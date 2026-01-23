import { Schema, model, models } from "mongoose";

const StudentSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    gender: { type: String },
    dateOfBirth: { type: Date },
    fatherName: { type: String },
    contact: { type: String },
    email: { type: String },

    streamId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  },
  { timestamps: true },
);

export default models.Student || model("Student", StudentSchema);
