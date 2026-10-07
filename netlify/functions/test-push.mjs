import webpush from "web-push";
import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const subject =
      process.env.VAPID_SUBJECT || "mailto:orion@example.com";

    if (!pub || !priv) {
      return new Response("VAPID not configured", { status: 500 });
    }

    const store = getStore("orion-push");

    const subscription = await store.get("primary", {
      type: "json"
    });

    if (!subscription) {
      return new Response("No subscription", { status: 404 });
    }

    webpush.setVapidDetails(subject, pub, priv);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Órion — Meu Plano 🔔",
        body: "Teste concluído! Os lembretes em segundo plano estão funcionando.",
        tag: "orion-test"
      })
    );

    return new Response("Push de teste enviado!", { status: 200 });
  } catch (error) {
    console.error("TEST_PUSH_ERROR:", error);

    return new Response(
      `Erro: ${error?.message || String(error)}`,
      { status: 500 }
    );
  }
};