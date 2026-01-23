import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  class: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId; // Faculty / Staff
  date: Date;
  hour: number; // Period / Hour number (1–8 etc)
  records: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    hour: {
      type: Number,
      required: true,
    },
    records: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        status: ["P", "A"],
      },
    ],

    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

AttendanceSchema.index({ classId: 1, date: 1, period: 1 }, { unique: true });

AttendanceSchema.index({ staffId: 1, date: 1 });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
