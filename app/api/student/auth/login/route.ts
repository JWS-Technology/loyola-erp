import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Student from "@/models/student.model";
import StudentAuth from "@/models/studentAuth.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    console.log("req came");
    const { email, password } = await req.json();
    console.log(email, password);
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 },
      );
    }

    // 1️⃣ Find student
    const student = await Student.findOne({ email });
    console.log(student);
    if (!student) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 2️⃣ Find auth
    const auth = await StudentAuth.findOne({ studentId: student._id });
    if (!auth) {
      return NextResponse.json(
        { message: "Student auth not initialized" },
        { status: 403 },
      );
    }

    // 3️⃣ Verify password
    const ok = await auth.comparePassword(password);
    if (!ok) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 4️⃣ Issue token
    const accessToken = jwt.sign(
      {
        userId: student._id,
        role: "STUDENT",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "20m" },
    );

    auth.lastLogin = new Date();
    await auth.save();

    return NextResponse.json({
      accessToken,
      mustChangePassword: auth.mustChangePassword,
    });
  } catch (err) {
    console.log(err);
    console.error("STUDENT_LOGIN_ERROR", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
