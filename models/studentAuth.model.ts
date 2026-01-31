import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

const StudentAuthSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,
  },
  { timestamps: true },
);

StudentAuthSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default models.StudentAuth || model("StudentAuth", StudentAuthSchema);
