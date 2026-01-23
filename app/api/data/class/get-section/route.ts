import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Class from "@/models/class.model"; // Ensure this path matches your file structure

export async function GET(request: Request) {
  try {
    console.log("req cqame")
    await dbConnect();

    // 1. Get search params from the URL
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const year = searchParams.get("year");
    console.log(year)
    console.log(courseId)

    // 2. Validate courseId (It is required to filter classes)
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // 3. Build the query object
    // Always filter by courseId
    const query: any = { courseId };

    // If 'year' is provided in URL, add it to the filter
    // Example: /api/classes?courseId=123&year=1
    if (year) {
      query.year = year;
    }

    // 4. Fetch classes
    const classes = await Class.find(query)
      .sort({ year: 1, section: 1 }) // Sort by Year (1,2,3) then Section (A,B,C)
      .lean(); // .lean() converts Mongoose docs to plain JS objects (faster)

    return NextResponse.json({ 
      success: true, 
      data: classes 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch classes" 
    }, { status: 500 });
  }
}