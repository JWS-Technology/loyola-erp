import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Attendance from "@/models/attendance.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      class: classId,
      date,
      hour,
      records,
    } = body;

    // 🔐 TEMP: Replace later with auth user
    const staffId = "6972fef1bb343c6be9ed98ac"; // dummy ObjectId

    // ✅ Validation
    if (!classId || !date || !hour || !records?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ❌ Prevent duplicate attendance
    const existing = await Attendance.findOne({
      class: classId,
      date: new Date(date),
      hour,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Attendance already marked" },
        { status: 409 }
      );
    }

    // ✅ Create attendance
    const attendance = await Attendance.create({
      staffId,
      class: classId,
      date: new Date(date),
      hour,
      records,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance marked successfully",
        data: attendance,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Attendance Error:", error);

    // Mongo duplicate index error safety
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Attendance already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
