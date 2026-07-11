import { Api, TelegramClient } from "telegram";
import { client } from "../telegram/live";
import kleur from "kleur";

const checkedChannels = new Set();

/**
 * Safely check if I am a member of a chat.
 * @param {string} usrname - chat username.
 * @returns {Promise<boolean>} - True if member, false otherwise.
 */
async function isMember(usrname) {
  if (typeof usrname !== "string") {
    usrname = String(Number(usrname));
  }

  try {
    console.log(kleur.yellow("Checking if I am a member of : "), usrname);

    const channel = await chatInstance(usrname);

    if (hasIssue(channel, usrname)) throw new Error("err4");

    const me = await client.getMe();

    const amI = await client.invoke(
      new Api.channels.GetParticipant({
        channel: channel,
        participant: me,
      }),
    );

    console.log(amI);
    console.log(kleur.blue("You are a member."));
    return true;
  } catch (err) {
    console.log(kleur.red("There was an issue checking membership. "));
    console.log("Error for checking is i am a member", err);

    err.errorMessage === "USER_NOT_PARTICIPANT" &&
      console.log(kleur.red("You are not a participant of this channel."));
    err.message === "err4" &&
      console.log(
        kleur.red("Above issue after checking issues with channel. "),
      );

    return false;
  }
}

/**
 * Safely get chat instance
 * @param {string} usrname - chat username.
 * @return {Promise<TelegramClient|{info: null, type: String}>} - Return chat Instance, undefined otherwise.
 */
async function chatInstance(usrname) {
  if (typeof usrname !== "string") {
    usrname = String(Number(usrname));
  }

  try {
    console.log(kleur.gray("Getting client.instance for "), usrname);

    const entity = await client.invoke(
      new Api.channels.GetFullChannel({ channel: usrname }),
    );

    return entity;
  } catch (err) {
    const returnObj = { info: null };
    const errMsg = err.message;
    console.log(kleur.red("There was an issue getting the user Entity."));
    console.log(errMsg);

    if (
      errMsg &&
      errMsg.includes("Cannot cast InputPeerUser to any kind of InputChannel")
    ) {
      returnObj.type = "bot";
    }
    if (
      errMsg &&
      errMsg.includes("Cannot cast") &&
      errMsg.includes("InputPeerUser")
    ) {
      returnObj.type = "user";
    }

    return returnObj;
  }
}

/**
 * Safetly check if there is an issue with the usrname and channel entity.
 * @param {Promise<TelegramClient|{info: null, type: String}>} - Channel instance or error.
 * Safely get chat instance
 * @param {string} usrname - chat username.
 * @returns {boolean} - Returns true when there is an issue, false otherwise.
 */
function hasIssue(channel, usrname) {
  let rtn = false;
  console.log(kleur.yellow("checking if there is an issue with the usrname."));

  switch (true) {
    case checkedChannels.has(usrname):
      console.log(kleur.red("This username has already been checked. "));
      rtn = true;
      break;

    case channel.type === "user":
      console.log(
        kleur.red("This username is a Private user. Not a channel."),
        kleur.green("Skipping to next username. "),
      );
      rtn = true;
      break;

    case channel.type === "bot":
      console.log(kleur.red("This username is a Bot. Not a channel. "));
      rtn = true;
      break;

    case channel.bot:
      console.log(
        kleur.red("This username is a Bot user. Not a channel."),
        kleur.green("Skipping to next username. "),
      );
      rtn = true;
      break;

    case channel.info === null:
      console.log(kleur.red("There was an issue with the usrname"));
      rtn = true;
      break;

    default:
      console.log(kleur.blue("There was no issue. With usrname. "));
      rtn = false;
      break;
  }

  checkedChannels.add(usrname);

  return rtn;
}

export { isMember, chatInstance, hasIssue, checkedChannels };
