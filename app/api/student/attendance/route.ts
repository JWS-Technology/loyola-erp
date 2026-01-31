import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Attendance from "@/models/attendance.model";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };

    if (decoded.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = decoded.userId;
    console.log(studentId);
    const studentObjectId = new mongoose.Types.ObjectId(decoded.userId);

    // 🔥 Efficient aggregation
    const data = await Attendance.aggregate([
      {
        $match: {
          "records.student": studentObjectId,
        },
      },
      {
        $project: {
          date: 1,
          hour: 1,
          class: 1,
          record: {
            $first: {
              $filter: {
                input: "$records",
                as: "r",
                cond: { $eq: ["$$r.student", studentObjectId] },
              },
            },
          },
        },
      },
      {
        $project: {
          date: 1,
          hour: 1,
          status: "$record.status",
          class: 1,
        },
      },
      {
        $sort: { date: 1, hour: 1 },
      },
    ]);
    console.log(data);
    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("STUDENT_ATTENDANCE_ERROR", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
