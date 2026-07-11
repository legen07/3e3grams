import { TelegramClient
 } from "telegram";
import { Session, StringSession } from "telegram/sessions";

const sessionId = new StringSession(process.env.SESSION);
const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;

const client = new TelegramClient(sessionId, apiId, apiHash, {reconnectRetries: 3});

await client.connect();

export {client};