import kleur from "kleur";
import input from "input";

async function deletePrivate(client, dialogs) {
  console.log(kleur.green("List of all personal Chats : \n"));
  console.log(dialogs.private.filter((chat) => chat.entity.deleted));

  const deletedIds = dialogs.private.reduce((acc, chat) => {
    chat.entity.deleted && acc.push(Number(chat.id));

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

async function deleteNoMsgChats(client, dialogs) {
  if (each5messages.total == 1) {
    const peerId = each5messages[0].peerId.userId;
    console.log(
      kleur.red(`No messages found in chat: ${each5messages[0].peerId.userId}`),
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

async function exit() {
    if (!(await input.confirm("Press Enter to continue..."))) {
      console.log(kleur.red("Exiting the program."));
      process.exit(0);
    }
  }

export { deletePrivate, deleteNoMsgChats, exit };
