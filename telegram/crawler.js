import { Channel, JoinedDate, JoinLater } from "../db/models.js";
import { Api } from "telegram";
import { connectDB } from "../db/connection.js";
import { client } from "./live.js";
import { exit } from "../helpers/actions.js";
import { sanitizeAndExtract } from "../engine/crawledData.js";
import kleur from "kleur";
import { chatInstance, isMember, hasIssue } from "../engine/hooks.js";

export async function crawlChats(chats) {
  await connectDB();

  //? ////////////////
  // Now we are here to Crawl through channels. Find New channels and groups.
  // Our job here is to go to the last date this site was scraped.
  // If the channel has never been scrapped, we will start scrapping from the first message of the channel.
  // Then after evey 50 messages, we will log that data into the database.

  for (const chat of chats) {
    const chatId = Number(chat.id);
    console.log(
      kleur.yellow(
        "Check to see if the channel already exist in the database. ",
      ),
    );

    let chatDB = (await Channel.find({ id: chatId }))[0];

    console.log(chatDB);
    if (!chatDB) {
      console.log(
        kleur.red(
          "Channel is not available in database so, Creating it for the first time. ",
        ),
      );
      chatDB = await Channel.create({
        name: chat.title,
        id: chatId,
        last_msg_scraped: 0,
      });
      await chatDB.save();
    } else {
      console.log(kleur.blue("Channel is in database."));
    }

    const a = (c) => {
      if (c) {
        chatDB.username = c;
        return true;
      } else false;
    };

    a(chat.entity.username) || a(chat.username);

    let stop = true;
    const lstMsg = await client.getMessages(chat.id, {
      limit: 1,
    });
    console.log(lstMsg);
    const lstMsgId = Number(lstMsg[0].id);

    while (stop) {
      const lastMsgLevel = chatDB.last_msg_scraped;

      const messages = await client.getMessages(chat.id, {
        limit: lastMsgLevel + 50,
        reverse: true,
        offsetDate: lastMsgLevel,
      });
      const totalMsgs = messages.total;
      const newMsgLevel = ((lst) =>
        lst + 50 > totalMsgs ? totalMsgs : lst + 50)(lastMsgLevel);

      console.log(kleur.yellow("Below are 50 messages from the channel. "));

      const strMsg = messages
        .map((item) => {
          if (Number(item.id) === lstMsgId) stop = false;
          return item.message;
        })
        .join(" ");
      console.log(strMsg);

      const { extLinks, extUsernames } = sanitizeAndExtract(strMsg);

      const usrnames = [...extLinks, ...extUsernames];

      console.log(
        kleur.yellow("Check to see if there is no username in message. "),
      );
      if (usrnames.length === 0) {
        console.log(
          kleur.red("There is not link. So starting going to another message."),
        );

        await contineo();
        await new Promise((res) => setTimeout(res, 1e4));
        continue;
      }
      console.log(kleur.yellow("These are the usrnames available. "));
      console.log(usrnames);

      await checkAndJoin(usrnames);

      //! Done with 50 messages.
      console.log(kleur.blue("Done with 50 messages."));
      console.log(
        kleur.green("Log  Plus 50 to the LastMessage of this chat. "),
      );

      await contineo();
      // await exit();
      await new Promise((res) => setTimeout(res, 1e4));

      async function contineo() {
        if (newMsgLevel === totalMsgs) {
          chatDB.fully_scraped = true;
        }
        chatDB.last_msg_scraped = newMsgLevel;
        await chatDB.save();
      }
    }

    //! Done Scrapping links from this chat.

    console.log(
      kleur.blue(
        "Done Scrapping links from this chat. Going to next chat. Or could be last message.",
      ),
    );

    // function ()
    /* 
    for (const msg of messages) {
      if (!graph.has(chat.id)) graph.set(chat.id, []);

      graph.get(chat.id).push({
        text: msg.message,
        date: msg.date,
        senderId: msg.senderId,
      });
    } */

    /**
     * Check if I am already a member of a chat. Then join otherwise.
     * @param {string[]} links - Links from messages.
     * @param {string[]} usrnames - Usernames from messages.
     * @returns {void} - Lets return nothing for now.
     */
    async function checkAndJoin(usrnames) {
      console.log(
        kleur.green("Check if I am a member then join if otherwise. "),
      );

      /**
       * Work on links.
       * Create an array of channels that I am not a member for both links and usrnames.
       */
      for (const usrname of usrnames) {
        const tod = new Date();
        const today = new Date(
          Date.UTC(tod.getUTCFullYear(), tod.getUTCMonth(), tod.getUTCDate()),
        );
        let joined = [];

        let joinedDate = (await JoinedDate.find({ date: today }))[0];

        if (!joinedDate) {
          joinedDate = JoinedDate.create({
            date: today,
          });
        } else {
          joined = joinedDate.joined;
        }

        const joinLater = await JoinLater.findOne({});

        const channel = await chatInstance(usrname);

        if (hasIssue(channel, usrname)) continue;

        const channelName = channel.title;

        console.log(
          kleur.green("Check to see if I have join more than 3 groups today. "),
        );
        if (joined.length >= 4) {
          //? At this point the I have joined a lot of channels for today. So I will push them into a database then work on them later.
          console.log(kleur.red("Have joined more than three channels today."));

          joinLater.list.push(channel.id);

          console.log(kleur.green("Skipping to other usernames. "));
          continue;
        }

        console.log(
          kleur.yellow("Have not joined more than three channels yet. "),
        );

        console.log(
          kleur.yellow("Channel participants count : "),
          channel.fullChat.participantsCount,
        );
        if (
          !(await isMember(usrname)) &&
          channel.fullChat.participantsCount > 2e3
        ) {
          //? Lets join this channel.
          console.log(kleur.yellow("Joining ", channelName));

          await client.invoke(
            new Api.channels.JoinChannel({ channel: usrname }),
          );

          console.log(" This is the chat is. : ",Number(channel.fullChat.id));
          console.log(kleur.green("Logging this data into the database. "));
          joinedDate.joined.push({
            chat_id: Number(channel.fullChat.id),
            type: channel.isGroup ? "group" : "channel",
          });
          await joinedDate.save();

          console.log(
            kleur.blue("Successfully Joined and Logged : ", channelName),
          );
        }
      }
    }
  }
}
