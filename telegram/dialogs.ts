import { TelegramClient } from "telegram";
import { Dialog } from "telegram/tl/custom/dialog.js";

export interface CategorizedDialogs {
  channels: Dialog[];
  groups: Dialog[];
  private: Dialog[];
}

export async function fetchDialogs(
  client: TelegramClient,
): Promise<CategorizedDialogs> {
  const dialogs = await client.getDialogs();

  const buckets: CategorizedDialogs = {
    channels: [],
    groups: [],
    private: [],
  };

  return dialogs.reduce((acc, item) => {
    if (item.isChannel) {
      acc.channels.push(item);
    } else if (item.isGroup) {
      acc.groups.push(item);
    } else {
      acc.private.push(item);
    }

    return acc;
  }, buckets);
}
