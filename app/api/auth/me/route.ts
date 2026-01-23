import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Staff from "@/models/staff.model";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Extract the token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      // 3. Fetch from DB using the correct fields we found earlier
      const staff = await Staff.findById(decoded.userId)
        .select("firstName lastName email contact role")
        .lean();

      if (!staff) {
        return NextResponse.json(
          { success: false, error: "Staff not found" },
          { status: 404 },
        );
      }

      // 4. Transform data so Flutter gets the 'name' property it expects
      const responseData = {
        ...staff,
        name: `${staff.firstName || ""} ${staff.lastName || ""}`.trim(),
      };

      return NextResponse.json(
        { success: true, data: responseData },
        { status: 200 },
      );
    } catch (jwtError: any) {
      // 5. Handle JWT specific errors (Expired/Invalid)
      if (jwtError.name === "TokenExpiredError") {
        return NextResponse.json(
          { success: false, error: "Token expired" },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }
  } catch (error: any) {
    // 6. Handle Global/DB errors
    console.error("GET_STAFF_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
