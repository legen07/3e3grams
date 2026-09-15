// processUnreadMessages.mjs
import { Api } from "telegram";
import { client } from "./live";
import kleur from "kleur";
import { exit } from "../helpers/actions";
import { fetchDialogs } from "./dialogs";

/**
 * Processes unread messages in a Telegram group.
 * @param {TelegramClient} client - GramJS client instance
 * @param {TelegramClient} groupInstance - Telegram group entity
 */
async function chat() {
  //? .1 Get unread count for the given group

  const chats = await fetchDialogs(client);

  const groupInstance = chats.groups.filter((group) => +group.unreadCount > 3);
  console.log(groupInstance);

  const dialogs = await client.invoke(
    new Api.messages.GetPeerDialogs({
      peers: [new Api.InputDialogPeer({ peer: groupInstance })],
    }),
  );
  console.log(dialogs);

  await exit();
  const unreadCount = dialogs.dialogs[0].unreadCount;
  console.log(kleur.cyan(`Unread messages count: ${unreadCount}`));
  if (unreadCount === 0) {
    console.log(kleur.green("No unread messages. Exiting."));
    return;
  }

  await exit();
  //? 2. Fetch all unread messages (newest first, then reverse to oldest first)

  const history = await client.invoke(
    new Api.messages.GetHistory({
      peer: groupInstance,
      limit: unreadCount,
      offsetId: 0,
      addOffset: 0,
      maxId: 0,
      minId: 0,
      hash: 0,
    }),
  );
  let messages = history.messages; // newest first
  messages = messages.reverse(); // oldest first
  console.log(kleur.cyan(`Fetched ${messages.length} unread messages.`));

  // Keep track of already processed messages and thread roots
  const processedMessageIds = new Set();
  const processedThreadRoots = new Set();

  // ------------------------------------------------------------------
  // Helper: traverse reply chain to find the root message of a thread
  // ------------------------------------------------------------------
  async function getThreadRootId(msgId) {
    let currentId = msgId;
    while (true) {
      const msgs = await client.getMessages(groupInstance, {
        ids: [currentId],
      });
      if (!msgs || msgs.length === 0) break;
      const msg = msgs[0];
      if (msg.replyTo && msg.replyTo.replyToMsgId) {
        currentId = msg.replyTo.replyToMsgId;
      } else {
        return currentId;
      }
    }
    return currentId;
  }

  // ------------------------------------------------------------------
  // Placeholder: AI processing
  // ------------------------------------------------------------------
  async function aiProcessMessages(messageIds, chat) {
    console.log(kleur.blue("Calling AI on message IDs:"), messageIds);
    // Replace this with your actual AI call.
    return { message: "AI response placeholder", status: true };
  }

  // ------------------------------------------------------------------
  // Placeholder: store processed IDs (MongoDB)
  // ------------------------------------------------------------------
  async function saveProcessedMessageIds(messageIds, chat) {
    console.log(kleur.green("Saving processed IDs to DB:"), messageIds);
    // Replace with your real DB logic.
  }

  // ------------------------------------------------------------------
  // 3. Loop over each unread message (oldest first)
  // ------------------------------------------------------------------
  for (const msg of messages) {
    if (processedMessageIds.has(msg.id)) {
      console.log(kleur.grey(`Message ${msg.id} already processed, skipping.`));
      continue;
    }

    // Determine if this message belongs to a thread (has replies or is a reply itself)
    const isThread = !!(
      msg.replyTo ||
      (msg.replies && msg.replies.replies > 0)
    );

    if (isThread) {
      console.log(kleur.yellow(`Message ${msg.id} is part of a thread.`));

      // Find the root message of the thread
      const rootId = msg.replyTo ? await getThreadRootId(msg.id) : msg.id;

      if (processedThreadRoots.has(rootId)) {
        console.log(
          kleur.grey(`Thread root ${rootId} already processed, skipping.`),
        );
        processedMessageIds.add(msg.id); // still mark this single message
        continue;
      }

      // Fetch the root message
      const rootMsgArr = await client.getMessages(groupInstance, {
        ids: [rootId],
      });
      const rootMsg = rootMsgArr[0];

      // Fetch all replies to the root
      const repliesResult = await client.invoke(
        new Api.messages.GetReplies({
          peer: groupInstance,
          msgId: rootId,
          offsetId: 0,
          limit: 100, // adjust if needed
          maxId: 0,
          minId: 0,
          hash: 0,
        }),
      );
      const replies = repliesResult.messages; // does NOT include root

      // Combine root + replies, sort by date, take the last 10 messages
      const threadMessages = [rootMsg, ...replies].sort(
        (a, b) => a.date - b.date,
      );
      const last10Ids = threadMessages.slice(-10).map((m) => m.id);
      console.log(
        kleur.yellow(
          `Processing thread (root ${rootId}) last 10 IDs: ${last10Ids}`,
        ),
      );

      // Mark all as processed
      last10Ids.forEach((id) => processedMessageIds.add(id));
      processedThreadRoots.add(rootId);

      // Send to AI
      const aiResult = await aiProcessMessages(last10Ids, groupInstance);
      if (aiResult.status) {
        await client.sendMessage(groupInstance, {
          message: aiResult.message,
          replyTo: msg.id,
        });
        console.log(
          kleur.green(`Replied to message ${msg.id} with: ${aiResult.message}`),
        );
      } else {
        console.log(
          kleur.red("AI returned status false for thread. Logging only."),
        );
      }
      // Save to DB
      await saveProcessedMessageIds(last10Ids, groupInstance);
    } else {
      // Non‑thread message: group last 7 messages from the same user
      console.log(
        kleur.blue(`Message ${msg.id} is non-thread, grouping by user.`),
      );

      // Get a valid InputPeer for the sender
      const senderInputPeer = await client.getInputEntity(msg.fromId);

      // Search for last 7 messages from this user in the chat
      const searchResult = await client.invoke(
        new Api.messages.Search({
          peer: groupInstance,
          q: "",
          fromId: senderInputPeer,
          filter: new Api.InputMessagesFilterEmpty(),
          minDate: 0,
          maxDate: 0,
          offsetId: 0,
          addOffset: 0,
          limit: 7,
          maxId: 0,
          minId: 0,
          hash: 0,
        }),
      );
      const userMessages = searchResult.messages; // newest first
      const ids = userMessages.map((m) => m.id);
      console.log(
        kleur.blue(`Collected ${ids.length} messages from user: ${ids}`),
      );

      // Skip if all IDs already processed
      if (ids.every((id) => processedMessageIds.has(id))) {
        console.log(
          kleur.grey("All collected IDs already processed, skipping."),
        );
        continue;
      }

      // Mark all as processed
      ids.forEach((id) => processedMessageIds.add(id));

      // AI call
      const aiResult = await aiProcessMessages(ids, groupInstance);
      if (aiResult.status) {
        // Reply to the most recent message of this user (first in array)
        const replyToId = ids[0];
        await client.sendMessage(groupInstance, {
          message: aiResult.message,
          replyTo: replyToId,
        });
        console.log(
          kleur.green(
            `Replied to user's latest message ${replyToId} with: ${aiResult.message}`,
          ),
        );
      } else {
        console.log(
          kleur.red("AI returned status false for user batch. Logging only."),
        );
      }
      // Save to DB
      await saveProcessedMessageIds(ids, groupInstance);
    }
  }

  console.log(kleur.green("Finished processing unread messages."));
}
await chat();
export { chat };
