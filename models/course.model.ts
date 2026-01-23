import { Schema, model, models } from "mongoose";

const CourseSchema = new Schema(
  {
    name: { type: String, required: true },
    streamId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
    durationYears: { type: Number, default: 3 },
  },
  { timestamps: true },
);

CourseSchema.index({ name: 1 });
CourseSchema.index({ streamId: 1 });

export default models.Course || model("Course", CourseSchema);
