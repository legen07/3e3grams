import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import kleur from "kleur";

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION || "");

export async function createClient() {

  console.log(kleur.blue("Login to Telegram."));
  await input.text("Press Enter to continue...");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => {console.log("Entering phone number (+233593861032) automatically");return "+233593861032"},
    password: async () => process.env.PASSWORD || await input.text("2FA Password: "),
    phoneCode: async () => await input.text("Code: "),
    onError: (err) => console.log(err),
  });

  console.log("Saving session string...");
  console.log(client.session.save());
  console.log(kleur.blue("Telegram connected"));
  return client;
}