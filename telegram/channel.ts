import kleur from "kleur";
import { Api, TelegramClient } from "telegram";
import { crawlChats } from "./crawler.ts";
import { chatInstance, isMember, type ChatInstanceResult } from "../engine/hooks.ts";
import type { Dialog } from "telegram/tl/custom/dialog.js";

async function channelWorks(
  client: TelegramClient,
  channels: Dialog[],
): Promise<void> {
  //? ///////////////
  //  We are going to check if the channel has a group.
  // Then we will check if we have already joined the group.
  //  If we have not joined the group, we will join the group.
  //  Then we will come back to the operation of the Channel.

  //? ///////////////
  // If channel does not have an associated group, we will scrape links from it.
  // Then will Leave the channel and delete it.

  console.log(kleur.green("Lets work on the Channels. "));

  for (const channel of channels) {
    console.log(kleur.green(`Working on channel: ${channel.title}`));
    console.log(
      kleur.green("Checking if the channel has a group associated with it. "),
    );
    const fullChannel = await client.invoke(
      new Api.channels.GetFullChannel({ channel: channel.id! }),
    );

    // A channel's full chat is always a `ChannelFull`; the union member
    // `ChatFull` (small groups) does not carry `linkedChatId`.
    const fullChat = fullChannel.fullChat as Api.ChannelFull;

    if (fullChat.linkedChatId) {
      console.log(kleur.green("The channel has a group associated with it. "));

      const linkedChatId = fullChat.linkedChatId;

      console.log(await client.getEntity(linkedChatId));
      // `title` is read off the payload defensively; it is optional on the type.
      const linkedChat = (await chatInstance(linkedChatId)) as ChatInstanceResult & {
        title?: string;
      };

      console.log(kleur.yellow("The linked chat is : "), linkedChat.title);

      console.log(
        kleur.green(
          "Check if you are a member of the group associated with the channel. ",
        ),
      );

      // NOTE: `isMember()` is deliberately not awaited — the original code
      // tested the promise itself (always truthy) rather than its result.
      // Preserved verbatim to avoid a behaviour change.
      if (isMember() as unknown as boolean) {
        console.log(
          kleur.green(
            "You are already a member of the group associated with the channel. ",
          ),
        );
      } else {
        console.log(
          kleur.red(
            "You are not a member of the group associated with the channel. ",
          ),
        );
        console.log(kleur.green("Joining the group..."));
        await client.invoke(
          new Api.channels.JoinChannel({ channel: linkedChatId }),
        );
        console.log(kleur.green("Joined the group successfully. "));
      }
    } else {
      console.log(
        kleur.red("The channel does not have a group associated with it. "),
      );

      console.log(kleur.green("Lets scrape channel links."));

      await crawlChats([channel]);
    }
    console.log(fullChannel);
  }
}

export { channelWorks };
