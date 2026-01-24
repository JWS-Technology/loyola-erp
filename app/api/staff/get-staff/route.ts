import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Staff from "@/models/staff.model";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Extract Token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      // 3. Fetch Full Profile Data
      // We fetch more fields here than we did for the Home Card
      const staff = await Staff.findById(decoded.userId)
        .select(
          "+firstName +lastName +email +contact +role +gender +fatherName +dateOfBirth +department",
        )
        .lean();

      if (!staff) {
        return NextResponse.json(
          { success: false, error: "Staff profile not found" },
          { status: 404 },
        );
      }

      // 4. Data Transformation for Flutter
      // Combine names and ensure fields are mobile-ready
      const profileData = {
        ...staff,
        name: `${staff.firstName || ""} ${staff.lastName || ""}`.trim(),
        // Ensure date is stringified if it's a Date object
        dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth : null,
      };

      return NextResponse.json(
        { success: true, data: profileData },
        { status: 200 },
      );
    } catch (jwtError: any) {
      if (jwtError.name === "TokenExpiredError") {
        return NextResponse.json(
          { success: false, error: "Session expired" },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 },
      );
    }
  } catch (error: any) {
    console.error("PROFILE_API_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
