import { TelegramClient } from "telegram";
import { Session, StringSession } from "telegram/sessions/index.js";

const sessionId = new StringSession(process.env.SESSION_ID);
const apiId = Number(process.env.API_ID);
// Guaranteed by the environment check in telegram/client.ts; asserted here so
// the client can be constructed eagerly for the whole app to share.
const apiHash = process.env.API_HASH!;

const client = new TelegramClient(sessionId, apiId, apiHash, {
  reconnectRetries: 3,
});

await client.connect();
export { client };
