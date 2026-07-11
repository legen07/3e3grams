export async function searchTelegram(client, keyword) {
  const result = await client.searchPublicChats(keyword);

  return result.slice(0, 5).map(chat => ({
    id: chat.id,
    title: chat.title,
    username: chat.username,
    participants: chat.participantsCount
  }));
}