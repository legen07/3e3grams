import { createClient } from "./telegram/client.js";
import { fetchDialogs } from "./telegram/dialogs.js";
import { getTrendingKeywords } from "./reddit/trends.js";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { searchTelegram } from "./telegram/search.js";
import { crawlChats } from "./telegram/crawler.js";
import { detectTopic } from "./engine/chatAnalyzer.js";
import input from "input";
import kleur from "kleur";
import { deletePrivate, exit } from "./helpers/actions.js";
import { channelWorks } from "./telegram/channel.js";
import { client } from "./telegram/live.js";

async function main() {
  console.log("Starting Telegram...");

  console.log("Check to see if user is authorized...");
  if (!(await client.isUserAuthorized())) {
    console.log(kleur.red(`User is NOT authorized.`));
    console.log(kleur.magenta(" So let's login in first. "));

    await createClient();
    console.log(kleur.blue().bold("Login Complete."));
  } else {
    console.log(kleur.blue().bold("User is already authorized."));
  }

 

  console.log(kleur.green("Now Lets get all the available Chats."));
  const dialogs = await fetchDialogs(client);

  const unreadGroups = dialogs.groups.filter((group) => +group.unreadCount > 3);

  console.log(
    kleur.green("List of available Chats : \n"),
    kleur.yellow(
      Object.entries(dialogs).flatMap(([key, chats]) => {
        console.log(chats);
        return chats.map((chat) => chat.title).join("\n");
      }),
    ),
  );
  console.log(kleur.green("List of unread Groups : \n"));
  console.log(kleur.yellow(unreadGroups));
  if (unreadGroups.length < 1) {
    console.log(kleur.red("There are Unread messages. Lets work on them. "));
  }

  await channelWorks(client, dialogs.channels);

  await exit();

  console.log(kleur.red("Insufficient Unread messages from Groups."));
  console
    .log
    // dialogs.channels
    ();

  await exit();

  const keywords = await getTrendingKeywords();

  let discoveredChats = [];

  for (const keyword of keywords.slice(0, 10)) {
    const results = await searchTelegram(client, keyword);
    discoveredChats.push(...results);
  }

  const graph = await crawlChats(client, discoveredChats);

  console.log("Graph built:", graph.size);
}

main();
