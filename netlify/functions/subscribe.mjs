import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const subscription = await req.json();

    if (!subscription?.endpoint) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Subscription inválida"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const store = getStore("orion-push");

    await store.setJSON("primary", subscription);

    return new Response(
      JSON.stringify({
        ok: true
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("SUBSCRIBE_ERROR:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};