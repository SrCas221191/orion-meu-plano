import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed"
    };
  }

  try {
    const subscription = JSON.parse(event.body || "{}");

    if (!subscription.endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: "Subscription inválida"
        })
      };
    }

    const store = getStore("orion-push");

    await store.setJSON("primary", subscription);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: true
      })
    };
  } catch (error) {
    console.error("SUBSCRIBE_ERROR:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: false,
        error: error?.message || String(error)
      })
    };
  }
};