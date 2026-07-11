export async function fetchDialogs(client) {
  const dialogs = await client.getDialogs();

  return dialogs.reduce(
    (acc, item) => {
      if (item.isChannel) {
        acc.channels.push(item);
      } else if (item.isGroup) {
        acc.groups.push(item);
      } else {
        acc.private.push(item);
      }

      return acc;
    },
    { channels: [], groups: [], private: [] },
  );
}
