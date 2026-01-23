import { Schema, model, models } from "mongoose";

const ClassSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    year: { type: Number, required: true }, // 1,2,3
    section: { type: String, default: "A" },
    name: { type: String, required: true }, // "BA English - 1A"
  },
  { timestamps: true },
);

export default models.Class || model("Class", ClassSchema);
