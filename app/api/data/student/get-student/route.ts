import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Student from "@/models/student.model";

// GET /api/students?class=<classId>&course=<courseId>
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const classId = searchParams.get("class");
    const courseId = searchParams.get("course");

    // 🚨 classId is mandatory for attendance
    if (!classId) {
      return NextResponse.json(
        { success: false, error: "classId is required" },
        { status: 400 },
      );
    }

    // 🔍 Build query dynamically
    const query: any = {
      classId,
    };

    // Optional safety filter
    if (courseId) {
      query.courseId = courseId;
    }

    console.log(query)
    const students = await Student.find(query)
      .select("firstName lastName rollNo") // optimize payload
      .sort({ firstName: 1 })
      .lean();

    // Normalize name for frontend (you use s.name)
    const formatted = students.map((s) => ({
      _id: s._id,
      name: `${s.firstName} ${s.lastName ?? ""}`.trim(),
      rollNo: s.rollNo ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formatted,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching students:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch students",
      },
      { status: 500 },
    );
  }
}
