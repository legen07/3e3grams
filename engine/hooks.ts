import { Api } from "telegram";
import { client } from "../telegram/live.ts";
import kleur from "kleur";

const checkedChannels = new Set<string>();

/** Marker returned by {@link chatInstance} when the entity can't be resolved. */
export interface UnresolvedChat {
  info: null;
  type?: string;
}

/** Result of {@link chatInstance}: the full chat payload, or the marker above. */
export type ChatInstanceResult = Api.messages.ChatFull | UnresolvedChat;

/**
 * Structural view used by {@link hasIssue} to read the optional marker fields
 * off either the resolved payload or the unresolved object.
 */
export interface ChatCheck {
  type?: string;
  bot?: boolean;
  info?: null;
}

/**
 * Safely check if I am a member of a chat.
 * @param usrname - chat username.
 * @returns True if member, false otherwise.
 */
async function isMember(usrname?: Api.TypeEntityLike): Promise<boolean> {
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
        channel: channel as Api.TypeEntityLike,
        participant: me,
      }),
    );

    console.log(amI);
    console.log(kleur.blue("You are a member."));
    return true;
  } catch (err) {
    const error = err as { message?: string; errorMessage?: string };
    console.log(kleur.red("There was an issue checking membership. "));
    console.log("Error for checking is i am a member", err);

    error.errorMessage === "USER_NOT_PARTICIPANT" &&
      console.log(kleur.red("You are not a participant of this channel."));
    error.message === "err4" &&
      console.log(
        kleur.red("Above issue after checking issues with channel. "),
      );

    return false;
  }
}

/**
 * Safely get chat instance
 * @param usrname - chat username.
 * @returns The full chat payload, or an `{ info: null }` marker describing why
 *   the entity could not be resolved.
 */
async function chatInstance(
  usrname: Api.TypeEntityLike,
): Promise<ChatInstanceResult> {
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
    const error = err as { message?: string };
    const returnObj: UnresolvedChat = { info: null };
    const errMsg = error.message;
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
 * Check if there is an issue with the usrname and the channel entity.
 * @param channel - Channel instance (resolved payload) or the unresolved
 *   marker returned by {@link chatInstance}.
 * @param usrname - chat username.
 * @returns True when there is an issue, false otherwise.
 */
function hasIssue(channel: ChatInstanceResult, usrname: string): boolean {
  // Both union members are read structurally; the cast gives a single view.
  const check = channel as unknown as ChatCheck;

  let rtn = false;
  console.log(kleur.yellow("checking if there is an issue with the usrname."));

  switch (true) {
    case checkedChannels.has(usrname):
      console.log(kleur.red("This username has already been checked. "));
      rtn = true;
      break;

    case check.type === "user":
      console.log(
        kleur.red("This username is a Private user. Not a channel."),
        kleur.green("Skipping to next username. "),
      );
      rtn = true;
      break;

    case check.type === "bot":
      console.log(kleur.red("This username is a Bot. Not a channel. "));
      rtn = true;
      break;

    case check.bot:
      console.log(
        kleur.red("This username is a Bot user. Not a channel."),
        kleur.green("Skipping to next username. "),
      );
      rtn = true;
      break;

    case check.info === null:
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
