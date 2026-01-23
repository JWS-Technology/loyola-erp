import { NextRequest, NextResponse } from "next/server";
import Attendance from "@/models/attendance.model";
import dbConnect from "@/config/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const classId = searchParams.get("class");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");
    const hour = searchParams.get("hour");

    const filter: any = {};

    if (classId) filter.class = classId;
    if (staffId) filter.staffId = staffId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    if (hour) filter.hour = Number(hour);

    const attendance = await Attendance.find(filter)
      .populate("staffId", "name email")
      .populate("class", "name section")
      .populate("records.student", "name rollNo")
      .sort({ date: 1, hour: 1 });

    return NextResponse.json(
      { count: attendance.length, data: attendance },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
