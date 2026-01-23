import { Schema, model, models } from "mongoose";

const StaffSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    fatherName: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    contact: { type: String },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["PRINCIPAL", "STAFF"],
      default: "STAFF",
    },
  },
  { timestamps: true },
);

StaffSchema.index({ role: 1 });

export default models.Staff || model("Staff", StaffSchema);
