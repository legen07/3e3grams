

### Playwright index.js
```
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { writeFile, readFile } from "fs/promises";

chromium.use(stealth());

const context = await chromium.launchPersistentContext("./chromium", {
  // viewport: { width: 750, height: 950 },
  viewport: null,
  headless: false,
  slowMo: 3000,
  args: ["--window-position=1200,0", "--window-size=750,1090"],
});

const page = context.pages()[0] || (await context.newPage());

await page.bringToFront();

page.setDefaultTimeout(2_000_000);

page.on("dialog", async (dialog) => {
  await dialog.dismiss();
});
await page.goto("https://web.telegram.org/a/");
process.on("SIGINT", async (e) => {
  console.log("Shutting down correctly.", e);

  // await page.close();
  // await context.close();
  // process.exit(0);
});
// await page.waitForTimeout(20_000);

const rPopularRes = await fetch(
  "https://www.reddit.com/subreddits/popular.json",
);
const popularJson = JSON.parse(await rPopularRes.text());

const popularObj = popularJson.data.children.map((obj) => obj.data.title);

let savedSearches = [];

try {
  savedSearches = JSON.parse(
    (await readFile("./assets/searchHistory.json", "utf-8")) ?? [],
  );
} catch (err) {
  console.log("Unable to get File", err);
}

await page.pause();

console.log("This is after the try catch.");

// console.log(savedSearches);

let k = 1;
function getSearchWord() {
  const selWord = popularObj[popularObj.length - k];

  if (savedSearches.includes(selWord)) {
    k++;
    getSearchWord();
  }
  return selWord;
}

const chats = await page.locator(".chat-list .ListItem.Chat").all();

// console.log(chats);

//? Dependencies
let privateData = {};
let channelData = {};
let groupData = {};

const getData = async (data) => {
  try {
    return (
      ((file) => (file ? JSON.parse(file) : false))(
        await readFile(`./assets/${data}.json`, "utf-8"),
      ) || {}
    );
  } catch (err) {
    console.log("File is Unavailable. ", err);
  }
};

async function findGroups() {
  /*  await page.locator(".MiddleHeader .chat-info-wrapper .info .title").click();

  await page.getByText('Links').click(); */

  console.log("Now we are inside ");
  await page.pause();
}

async function chatsCraw(chat) {
  await page
    .locator(".middle-column-footer div button[aria-label='Go to bottom']")
    .click();
  await page.waitForTimeout(2_000);
  await page
    .locator(".middle-column-footer div button[aria-label='Go to bottom']")
    .click();

  const activeObj = {};
}

async function saveData() {
  const chat = page.locator("#LeftColumn-main chat-list .ListItem.selected");

  if ((await chat.getAttribute("class")).includes("private")) {
    privateData = getData("private");
  } else {
    await chat.click();

    // console.log(await page.locator(".messages-layout .chat-info-wrapper .status").waitFor("visible"), await page.locator(".messages-layout .chat-info-wrapper .status").innerHTML())

    // await page.locator(".messages-layout .Transition .MessageList[data-normal-height]").waitFor("visible")

    // page.waitForSelector()
    console.log(
      await page
        .locator(".messages-layout .chat-info-wrapper .status .online-status")
        .count(),
    );

    await findGroups();

    if (
      await page
        .locator(
          ".messages-layout .Transition .MessageList[data-normal-height]",
        )
        .count()
    ) {
      //? Is Group
      groupData = await getData("group");
    } else {
      //? Is Channel
      channelData = await getData("channel");
    }
  }
}
//! Dependencies

for (const chat of chats) {
  // console.log((await chat.getAttribute("class")).includes("private"));
  const chatId = /[^#].*/.exec(
    await chat.locator("> a.ListItem-button").getAttribute("href"),
  )[0];

  chatsCraw(chat);

  console.log(privateData);
  console.log(chatId);
}

const homeSearch = page.getByRole("textbox", { name: "Search" });

await homeSearch.click();
await page.waitForTimeout(2_000);

await homeSearch.fill(getSearchWord());

console.log(getSearchWord());
// console.log(getSearchWord());

await context.close();

```
