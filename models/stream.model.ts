import { Schema, model, models } from "mongoose";

const StreamSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default models.Stream || model("Stream", StreamSchema);
