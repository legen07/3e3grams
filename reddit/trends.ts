interface RedditListing {
  data: {
    children: Array<{ data: { display_name: string } }>;
  };
}

export async function getTrendingKeywords(): Promise<string[]> {
  const res = await fetch("https://www.reddit.com/subreddits/popular.json");
  const json = (await res.json()) as RedditListing;

  return json.data.children.map((c) =>
    c.data.display_name.toLowerCase(),
  );
}
