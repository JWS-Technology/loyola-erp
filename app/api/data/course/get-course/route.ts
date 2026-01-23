import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Course from "@/models/course.model";
import "@/models/stream.model"; // 🔥 force model registration

export async function GET() {
  try {
    await dbConnect();

    const courses = await Course.find({})
      .populate("streamId", "name")
      .sort({ name: 1 });

    return NextResponse.json(
      { success: true, data: courses },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching courses:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
