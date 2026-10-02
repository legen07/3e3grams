import kleur from "kleur";
import input from "input";
import { Api, TelegramClient } from "telegram";
import type { CategorizedDialogs } from "../telegram/dialogs.ts";
import type { TotalList } from "telegram/Helpers.js";

async function deletePrivate(
  client: TelegramClient,
  dialogs: CategorizedDialogs,
): Promise<void> {
  console.log(kleur.green("List of all personal Chats : \n"));
  console.log(dialogs.private.filter((chat) => (chat.entity as Api.User).deleted));

  const deletedIds = dialogs.private.reduce<number[]>((acc, chat) => {
    (chat.entity as Api.User).deleted && acc.push(Number(chat.id));

    return acc;
  }, []);
  console.log(deletedIds);

  for (const id of deletedIds) {
    const delation = await client.invoke(
      new Api.messages.DeleteHistory({
        peer: id,
        maxId: 0,
        revoke: true,
      }),
    );

    console.log(kleur.red(`Deleted Chat with ID: ${id}`));
    console.log(delation);
  }
}

async function deleteNoMsgChats(
  client: TelegramClient,
  dialogs: CategorizedDialogs,
  // `each5messages` / `noMessageChat` were free variables in the original code;
  // they are declared as parameters so the function is self-contained.
  each5messages: TotalList<Api.Message>,
  noMessageChat: unknown[],
): Promise<void> {
  if (each5messages.total == 1) {
    const peerId = (each5messages[0].peerId as Api.PeerUser).userId;
    console.log(
      kleur.red(
        `No messages found in chat: ${(each5messages[0].peerId as Api.PeerUser).userId}`,
      ),
    );

    const delation = await client.invoke(
      new Api.messages.DeleteHistory({
        peer: peerId,
        maxId: 0,
        revoke: true,
      }),
    );

    console.log(kleur.red(`Deleted Chat with ID: ${peerId}`));
    console.log(delation);

    noMessageChat.push(peerId);
  }
}

async function exit(): Promise<void> {
  if (!(await input.confirm("Press Enter to continue..."))) {
    console.log(kleur.red("Exiting the program."));
    process.exit(0);
  }
}

export { deletePrivate, deleteNoMsgChats, exit };
