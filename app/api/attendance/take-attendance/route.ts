import { NextRequest, NextResponse } from "next/server";
import Attendance from "@/models/attendance.model";
import dbConnect from "@/config/dbConnect";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { staffId, class: classId, date, hour, records } = body;

    // Basic validation
    if (!staffId || !classId || !date || !hour || !records?.length) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Optional: prevent duplicate attendance
    const existing = await Attendance.findOne({
      staffId,
      class: classId,
      date: new Date(date),
      hour,
    });

    if (existing) {
      return NextResponse.json(
        { message: "Attendance already exists for this hour" },
        { status: 409 },
      );
    }

    const attendance = await Attendance.create({
      staffId,
      class: classId,
      date,
      hour,
      records,
    });

    return NextResponse.json(
      { message: "Attendance created", attendance },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Attendance error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
