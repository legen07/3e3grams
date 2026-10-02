import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { input } from "@inquirer/prompts";
import kleur from "kleur";

const {API_ID,API_HASH, SESSION_ID, PHONE_NUMBER} = process.env;

let apiId: number = Number(API_ID);


if (!API_HASH) {
  throw new Error("API HASH not found. ");
}

const apiHash: string = API_HASH;

const stringSession = new StringSession(SESSION_ID || "");

export async function createClient() {
  console.log(kleur.blue("Login to Telegram."));
  await input({ message: "Press Enter to continue..." });

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => {
      console.log("Entering phone number (+233593861032) automatically");
      return PHONE_NUMBER || "+233239793795";
     },
    // password: async () =>
    //   process.env.PASSWORD || (await input({ message: "2FA Password: " })),
    phoneCode: async () => await input({ message: "Code: " }),
    onError: (err) => console.log(err),
  });

  console.log("Saving session string...");
  console.log(client.session.save());
  console.log(kleur.blue("Telegram connected"));
  return client;
}
