import kleur from "kleur";
import { Api } from "telegram";
import { exit } from "../helpers/actions.js";
import { crawlChats } from "./crawler.js";
import { chatInstance, isMember } from "../engine/hooks.js";

async function channelWorks(client, channels) {
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
      new Api.channels.GetFullChannel({ channel: channel.id }),
    );

    if (fullChannel.fullChat.linkedChatId) {
      console.log(kleur.green("The channel has a group associated with it. "));

      const linkedChatId = fullChannel.fullChat.linkedChatId;

      console.log(await client.getEntity(linkedChatId));
      const linkedChat = await chatInstance(linkedChatId);
      
      console.log(kleur.yellow("The linked chat is : "), linkedChat.title);

      console.log(
        kleur.green(
          "Check if you are a member of the group associated with the channel. ",
        ),
      );

      if (isMember()) {
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
