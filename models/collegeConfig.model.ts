import { Schema, model, models } from "mongoose";

const CollegeConfigSchema = new Schema(
  {
    // We use a fixed ID or just fetch the first document always
    type: { type: String, default: "TIMETABLE_CONFIG", unique: true },

    // Default Weekly Schedule (0=Sunday, 1=Monday...)
    weeklySchedule: {
      type: Schema.Types.Mixed,
      of: String, // Value = Template Name (e.g., "1": "REGULAR")
      default: {},
    },

    // Specific Date Overrides (e.g., "2026-02-14": "HOLIDAY")
    overrides: {
      type: Schema.Types.Mixed,
      of: String, // Value = Template Name
      default: {},
    },
  },
  { timestamps: true },
);

export default models.CollegeConfig ||
  model("CollegeConfig", CollegeConfigSchema);
