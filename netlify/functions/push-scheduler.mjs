import webpush from "web-push";
import { getStore } from "@netlify/blobs";

const meals = {
  "06:20": "Hora do café da manhã. Confira seu cardápio. 🍽️",
  "09:00": "Hora do lanche da manhã. Confira seu cardápio. 🍽️",
  "11:00": "Hora do almoço. Confira seu cardápio. 🍽️",
  "14:30": "Hora do lanche da tarde. Confira seu cardápio. 🍽️",
  "18:30": "Hora do jantar. Confira seu cardápio. 🍽️",
  "20:00": "Hora da ceia. Confira seu cardápio. 🍽️"
};

const water = new Set([
  "07:30",
  "08:30",
  "10:00",
  "12:30",
  "13:30",
  "15:30",
  "16:30",
  "17:30",
  "19:30"
]);

export default async () => {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT || "mailto:orion@example.com";

  if (!pub || !priv) {
    return new Response("VAPID not configured", { status: 200 });
  }

  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const time = Object.fromEntries(
    parts.map((x) => [x.type, x.value])
  );

  const now = `${time.hour}:${time.minute}`;

  let body = meals[now];

  if (!body && water.has(now)) {
    body = "Hora de beber água. 💧 Registre no Órion.";
  }

  if (!body) {
    return new Response("No reminder", { status: 200 });
  }

  try {
    const store = getStore("orion-push");
    const subscription = await store.get("primary", {
      type: "json"
    });

    if (!subscription) {
      return new Response("No subscription", { status: 200 });
    }

    webpush.setVapidDetails(subject, pub, priv);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Órion — Meu Plano",
        body,
        tag: `orion-${now}`
      })
    );

    return new Response("Sent", { status: 200 });
  } catch (error) {
    console.error("PUSH_ERROR:", error);

    if (error?.statusCode === 404 || error?.statusCode === 410) {
      try {
        const store = getStore("orion-push");
        await store.delete("primary");
      } catch {}
    }

    return new Response(
      `Push error: ${error?.message || String(error)}`,
      { status: 200 }
    );
  }
};