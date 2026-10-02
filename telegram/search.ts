import { Api, TelegramClient } from "telegram";

export interface SearchedChat {
  id: Api.Chat["id"];
  title: string;
  username?: string;
  participants: number;
}

/**
 * Search Telegram public chats for a keyword.
 *
 * NOTE: `searchPublicChats` is not part of the gramjs typings bundled with the
 * installed `telegram` version, so the call is typed locally to preserve the
 * existing behaviour.
 */
export async function searchTelegram(
  client: TelegramClient,
  keyword: string,
): Promise<SearchedChat[]> {
  const result = await (
    client as unknown as {
      searchPublicChats(query: string): Promise<Array<Api.Chat & { username?: string }>>;
    }
  ).searchPublicChats(keyword);

  return result.slice(0, 5).map((chat) => ({
    id: chat.id,
    title: chat.title,
    username: chat.username,
    participants: chat.participantsCount,
  }));
}
