import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { organicTyper } from "../assets/organicTyper.js";
import { MongoClient } from "mongodb";
// import { Locator } from "playwright";

// let products: {};

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();

const db = client.db("click_bank");
const col = db.collection("aff_products");

chromium.use(stealth());

const browser = await chromium.connectOverCDP("http://localhost:9222");

const context = browser.contexts()[0];

let page = context.pages()[0];
page.setDefaultNavigationTimeout(2e4);
page.setDefaultTimeout(2e4);

const url = page.url();
switch (true) {
  case url.includes("login"):
    await makettoJanai();
    break;

  case url.includes("/results?"):
    await shuShuOHajimeru();
    break;

  default:
    makettoJanai();
}

async function downloadImg(url: string, outputPath: string) {
  const res = await fetch(url);
  const body = res.body;
  if (!body) {
    throw new Error("Failed to download image :: ");
    // console.log("Failed to download image :: ");
  }

  const fileStream = createWriteStream(outputPath);
  await pipeline(body, fileStream);
}

async function shuShuOHajimeru() {
  try {
    console.log("We are inside Shu shu Hajimeru");
    await page.waitForTimeout(1e3);
    await page.waitForSelector("#all-cards-container > div");
    const shohin = await page.locator("#all-cards-container > div").all();

    console.log("The elements we will be working on :::: ", shohin);
    // await page.pause();

    for (const konoShohin of shohin) {
      //? Main card selector
      const sosen =
        " > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > p:nth-child(2)";

      //? Bread Crumbs
      const obaaSan = await konoShohin
        .locator(sosen + " > a:nth-child(1)")
        .textContent();
      const haha = await konoShohin
        .locator(sosen + " > a:nth-child(2)")
        .textContent();

      console.log(obaaSan);
      console.log(haha);

      const shohinMei = await konoShohin
        .locator(
          "p#title-offer-details.MuiTypography-root.MuiTypography-body1.css-9l3uo3",
        )
        .textContent();

      console.log(await col.findOne({ proName: shohinMei }));
      if (await col.findOne({ proName: shohinMei })) {
        continue;
      }

      const linksObj = { affPage: "", salesPage: "", contacts: [] as String[] };

      const linksSelectors = await konoShohin
        .locator(
          ".css-lpt2oc > div :where(a.css-1ujsas3[href*=mailto] ,a[href])",
        )
        .all();

      for (const cur of linksSelectors) {
        if (
          ((await cur.locator("p").textContent()) || "").includes("Affiliate")
        ) {
          linksObj.affPage = (await cur.getAttribute("href")) || "";
        } else if (
          ((await cur.locator("p").textContent()) || "").includes("Sales")
        ) {
          linksObj.salesPage = (await cur.getAttribute("href")) || "";
        } else {
          linksObj.contacts.push((await cur.getAttribute("href")) || "");
        }
      }

      await page.waitForTimeout(1e3);
      await konoShohin
        .getByRole("button", { name: "Get Affiliate Link" })
        .click();
      await page.waitForTimeout(1e3);
      await page.getByLabel("Open", { exact: true }).click();
      await page.waitForTimeout(1e3);
      await page.getByRole("option", { name: "newpromo8" }).click();
      await page.locator("button").filter({ hasText: "Continue" }).click();
      await page.waitForTimeout(6e3);

      if (
        await page.getByRole("heading", { name: "Apply For Approval" }).count()
      ) {
        await page.getByRole("button").click();
        await page.waitForTimeout(1e3);

        continue;
      }
      await page.waitForTimeout(1e3);
      const affLink = await page
        .locator("textarea.marketplace-ui-MuiInputBase-input:nth-child(1)")
        .inputValue();

      await page.getByLabel("close", { exact: true }).click();
      await page.waitForTimeout(1e3);

      //? Product details

      const setsumei = await konoShohin
        .locator(".MuiTypography-root.MuiTypography-body1.css-1gm4amk")
        .textContent();

      const selectors = {
        gokei:
          "div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > p:nth-child(2)",
        furui:
          "div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > p:nth-child(2)",
        ranku:
          "div:nth-child(2) > div:nth-child(1) > div:nth-child(5) > h3:nth-child(2)",
        juryoku:
          "div:nth-child(2) > div:nth-child(1) > div:nth-child(4) > h3:nth-child(2)",
        epc: "div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > span:nth-child(1) > h3:nth-child(2)",
        cvr: "div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > h3:nth-child(2)",
      };

      const _ = await Promise.all(
        Object.entries(selectors).map(async ([key, selector]) => {
          return [key, await konoShohin.locator(selector).textContent()];
        }),
      ).then(Object.fromEntries);
      console.log(_);

      const tags = await Promise.all(
        (
          await konoShohin
            .locator(
              ".css-45ujxc > p ~ div > div.MuiGrid-root.MuiGrid-item.css-1wxaqej",
            )
            .all()
        ).map((each) => each.textContent()),
      );

      let filePath;
      //? Numbers

      const obj = {
        proName: shohinMei,
        category: obaaSan,
        subCategory: haha,
        setsumei,
        ...linksObj,
        affLink,
        ..._,
        tags,
        createdAt: new Date(),
      };

      if (await konoShohin.locator(".css-4xkoi8 img").count()) {
        const imgSrc =
          (await konoShohin.locator(".css-4xkoi8 img").getAttribute("src")) ||
          "";
        filePath = /\w+\.png/.exec(imgSrc)?.[0];

        await downloadImg(imgSrc, "affImages/" + filePath!);
        obj.img = filePath;
      }
      console.log(obj);

      // await page.waitForTimeout(1e9);
      col.insertOne(obj);
    }
    await page.getByRole("button", { name: "Go to next page" }).click();
    await page.waitForTimeout(4e3);
    await shuShuOHajimeru();
  } catch (err) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1e3);
    console.log(err);
    await shuShuOHajimeru();
  }
}

async function makettoJanai() {
  await page.goto(
    "https://accounts.clickbank.com/master/dashboard/affiliate-marketplace?v=0.07401922826481977",
    { waitUntil: "load" },
  );

  await page.waitForTimeout(6000);
  await page.pause();

  //? Sign In if the signin page come up.
  const roguin = async () => {
    console.log("Need to signUp");

    await organicTyper(
      "gafful07@gmail.com",
      async (text: string) => {
        await page.locator('input[name="username"]').fill(text);
      },
      { typoRate: 0 },
    );

    await organicTyper(
      '+n"!p,r6WwA3Vik',
      async (text: string) => {
        await page.locator('input[name="password"]').fill(text);
      },
      { typoRate: 0 },
    );

    const moIchido = async () => {
      await page.getByRole("button", { name: "Login" }).click();

      await page.waitForTimeout(1e4);
      await page.waitForLoadState("domcontentloaded");
      console.log();
      try {
        await page.waitForURL("**/dashboard.html");
      } catch (err) {
        console.log("The page didn't load or something.");
      }

      if (page.url().includes("dashboard")) {
        await page.getByRole("link", { name: "Affiliate Marketplace" }).click();
        await makettoHajimeru();
      } else {
        await moIchido();
      }
    };

    await moIchido();
  };

  async function makettoHajimeru() {
    await page.waitForLoadState("load");
    await page.waitForTimeout(6e3);
    const pages = context.pages();
    let i = 1;
    while (i < pages.length) {
      if (pages[i].url().includes("affiliate-marketplace")) {
        page = pages[i];
        break;
      }
      i++;
    }
    await page.waitForLoadState("load");
    await page.waitForTimeout(6e3);
    console.log(page.url());

    await page.getByText("All", { exact: true }).click();

    await page.getByText("View All Offers").click();

    await page.waitForTimeout(1e3);

    if (await page.getByText("All CategoriesView All").isVisible()) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1e3);
    }

    console.log("Before we start shushu HAJIMERU");
    await shuShuOHajimeru();
  }

  if (page.url().includes("login")) {
    await roguin();
  } else {
    await makettoHajimeru();
  }

  await page.waitForTimeout(1e4);
}
