export async function getTrendingKeywords() {
  const res = await fetch("https://www.reddit.com/subreddits/popular.json");
  const json = await res.json();

  return json.data.children.map(c =>
    c.data.display_name.toLowerCase()
  );
}