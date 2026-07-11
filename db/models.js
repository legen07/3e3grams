import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Channel name must be at least 3 characters"],
      maxlength: [50, "Channel name cannot exceed 50 characters."],
    },
    username: {
      type: String,
    },
    id: {
      type: Number,
      required: [true, "Channel Id is required."],
    },
    members: {
      type: Number,
      required: [true, "Member count is required."],
      min: [0, "Member count cannot be negative."],
      default: 0,
    },
    fully_scraped: {
      type: Boolean,
      default: false,
    },
    last_msg_scraped: {
      type: Number,
      default: 0,
    },
    groups_scraped: {
      type: Array,
    },
    channels_scraped: {
      type: Array,
    },
    associated_group: {
      name: {
        type: String,
        trim: true,
      },
      is_member: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

const joinedDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [
      true,
      "The date is important for it is the key of the document. ",
    ],
    default: Date,
  },
  joined: [
    {
      chat_id: {
        type: Number,
        required: [true, "Chat Id of the chat is required"],
      },
      type: {
        type: String,
        required: [true, "Need to specify the type of chat. "],
      },
    },
  ],
});

const joinLaterSchema = new mongoose.Schema({
  list: {
    type: [String],
  },
});

channelSchema.index({ "associated_group.name": 1 });

const JoinedDate = mongoose.model("Joined_Date", joinedDateSchema);
const JoinLater = mongoose.model("Join_later", joinLaterSchema);
const Channel = mongoose.model("Channel", channelSchema);

export { Channel, JoinedDate, JoinLater };
