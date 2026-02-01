import { Schema, model, models } from "mongoose";

const TimetableTemplateSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // "REGULAR", "FRIDAY", "HALF_DAY"
    slots: [
      {
        label: { type: String, required: true }, // "Period 1"
        type: {
          type: String,
          enum: ["PERIOD", "BREAK", "LAB", "EXAM", "FREE"],
          required: true,
        },
        startTime: { type: String, required: true }, // "09:00"
        endTime: { type: String, required: true }, // "09:55"
        attendanceRequired: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export default models.TimetableTemplate ||
  model("TimetableTemplate", TimetableTemplateSchema);
