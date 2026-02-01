import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TimetableTemplate from "@/models/timetableTemplate.model";
import CollegeConfig from "@/models/collegeConfig.model";

export async function POST() {
  await dbConnect();

  // 1. Clear Old Data
  await TimetableTemplate.deleteMany({});
  await CollegeConfig.deleteMany({ type: "TIMETABLE_CONFIG" });

  // 2. Create The "USUAL" Template
  await TimetableTemplate.create([
    {
      name: "REGULAR", // The Usual Schedule
      slots: [
        {
          label: "First Period",
          type: "PERIOD",
          startTime: "09:00",
          endTime: "09:55",
          attendanceRequired: true,
        },
        {
          label: "Second Period",
          type: "PERIOD",
          startTime: "09:55",
          endTime: "10:50",
          attendanceRequired: true,
        },
        {
          label: "Break",
          type: "BREAK",
          startTime: "10:50",
          endTime: "11:05", // Assumed 11:05 based on 15m duration
          attendanceRequired: false,
        },
        {
          label: "Third Period",
          type: "PERIOD",
          startTime: "11:05",
          endTime: "12:00",
          attendanceRequired: true,
        },
        {
          label: "Fourth Period",
          type: "PERIOD",
          startTime: "12:00",
          endTime: "12:55",
          attendanceRequired: true,
        },
        {
          label: "Lunch Break",
          type: "BREAK",
          startTime: "12:55",
          endTime: "13:40",
          attendanceRequired: false,
        },
        {
          label: "Fifth Period",
          type: "PERIOD",
          startTime: "13:40",
          endTime: "14:35",
          attendanceRequired: true,
        },
        {
          label: "Sixth Period",
          type: "PERIOD",
          startTime: "14:35",
          endTime: "15:30",
          attendanceRequired: true,
        },
      ],
    },
    {
      name: "HOLIDAY",
      slots: [], // Empty slots
    },
  ]);

  // 3. Set Global Weekly Rules
  // 0=Sunday, 1=Monday, ..., 6=Saturday
  await CollegeConfig.create({
    type: "TIMETABLE_CONFIG",
    weeklySchedule: {
      "1": "REGULAR", // Mon
      "2": "REGULAR", // Tue
      "3": "REGULAR", // Wed
      "4": "REGULAR", // Thu
      "5": "REGULAR", // Fri
      "6": "REGULAR", // Sat (Change to HOLIDAY if Sat is off)
      "0": "HOLIDAY", // Sun
    },
    overrides: {
      // Add specific holidays here e.g.:
      // "2026-02-14": "HOLIDAY"
    },
  });

  return NextResponse.json({ message: "Updated with Loyola Usual Timing" });
}
