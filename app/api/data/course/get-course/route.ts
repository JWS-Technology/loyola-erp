import { NextResponse } from "next/server";
import Course from "@/models/course.model";
import dbConnect from "@/config/dbConnect";

export async function GET() {
  try {
    // 1. Ensure DB connection
    await dbConnect();

    // 2. Fetch all courses
    // .populate("streamId") is optional if you want the full Stream details, not just the ID
    const courses = await Course.find({})
      .populate("streamId", "name") // optimizing to select only 'name' from stream
      .sort({ name: 1 }); // Sort alphabetically

    // 3. Return successful response
    return NextResponse.json({ 
      success: true, 
      data: courses 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching courses:", error);
    
    // 4. Return error response
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch courses" 
    }, { status: 500 });
  }
}