import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  staffId: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  date: Date;
  hour: number;
  records: {
    student: mongoose.Types.ObjectId;
    status: "P" | "A";
  }[];
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    hour: {
      type: Number,
      required: true,
    },

    records: [
      {
        student: {
          type: Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["P", "A"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

// ✅ Prevent duplicate attendance
AttendanceSchema.index({ class: 1, date: 1, hour: 1 }, { unique: true });

// ✅ Faster staff queries
AttendanceSchema.index({ staffId: 1, date: 1 });

export default mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);
