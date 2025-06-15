export async function sendNotification(action: string, message: string) {
  const payload = {
    username: "sawa",
    embeds: [
      {
        title: action,
        description: message,
        footer: {
          text: "sawa",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(process.env.WEBHOOK_URL!, {
    method: "POST",
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("failed to send notification:", res.statusText);
  }
}
