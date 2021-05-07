import { decode, json, rest, serve, setApplicationId } from "./deps.ts";

const token = Deno.env.get("DISCORD_TOKEN");
rest.token = `Bot ${token}`;
setApplicationId(
  new TextDecoder().decode(decode(token?.split(".")[0] || "")) || "",
);

serve({
  // @ts-ignore we don't want to return a response here,the rest will send the response
  "/": main,
});

async function main(request: Request) {
  const authorization = request.headers.get("Authorization")!;

  const secret = Deno.env.get("GAMER_REST_SECRET");
  if (!secret || !authorization || authorization !== secret) {
    return json({
      error: "Invalid authorization provided.",
    }, { status: 401 });
  }

  const payload = JSON.parse(await request.text());

  await rest.processRequest({
    url: payload.url,
    method: request.method,
    respond: (payload) => {
      json(payload.body ? JSON.parse(payload.body) : {}, {
        status: payload.status,
      });
    },
    reject: (error) => json(error as Record<string, unknown>),
  }, payload).catch(console.error);
}
