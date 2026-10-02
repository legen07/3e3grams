import { createClient } from "./telegram/client.ts";
import { fetchDialogs } from "./telegram/dialogs.ts";
import { getTrendingKeywords } from "./reddit/trends.ts";
import { searchTelegram } from "./telegram/search.ts";
import type { SearchedChat } from "./telegram/search.ts";
import { crawlChats } from "./telegram/crawler.ts";
import kleur from "kleur";
import { exit } from "./helpers/actions.ts";
import { channelWorks } from "./telegram/channel.ts";
import { client } from "./telegram/live.ts";
import type { Dialog } from "telegram/tl/custom/dialog.js";

async function main(): Promise<void> {
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
      String(
        Object.entries(dialogs).flatMap(([key, chats]: [string, Dialog[]]) => {
          console.log(chats);
          return chats.map((chat) => chat.title).join("\n");
        }),
      ),
    ),
  );
  console.log(kleur.green("List of unread Groups : \n"));
  console.log(kleur.yellow(String(unreadGroups)));
  if (unreadGroups.length < 1) {
    console.log(kleur.red("There are Unread messages. Lets work on them. "));
  } else {
    console.log(kleur.red("Insufficient Unread messages from Groups."));
  }

  await channelWorks(client, dialogs.channels);

  await exit();

  await exit();

  const keywords = await getTrendingKeywords();

  const discoveredChats: SearchedChat[] = [];

  for (const keyword of keywords.slice(0, 10)) {
    const results = await searchTelegram(client, keyword);
    discoveredChats.push(...results);
  }

  // `crawlChats` takes the chat list; it returns nothing, so there is no graph
  // to report here.
  await crawlChats(discoveredChats);

  console.log("Done crawling discovered chats.");
}

main();
