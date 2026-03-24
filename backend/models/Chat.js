import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      default: "Neutral",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);