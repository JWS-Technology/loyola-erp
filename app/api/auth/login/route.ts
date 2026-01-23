import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import dbConnect from "@/config/dbConnect";
import Staff from "@/models/staff.model";
import RefreshToken from "@/models/refreshToken.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password, deviceId } = await req.json();

    // 1️⃣ Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    // 2️⃣ Find staff
    const user = await Staff.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    /**
     * 3️⃣ TEMP AUTH LOGIC
     * password === contact
     */
    const contactString = String(user.contact);

    if (password !== contactString) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 4️⃣ Create Access Token (JWT)
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    // 5️⃣ Create Refresh Token
    const refreshToken = crypto.randomBytes(40).toString("hex");

    // 6️⃣ Hash refresh token (SHA-256)
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 7️⃣ Optional deviceId
    const finalDeviceId = deviceId ?? crypto.randomUUID();

    // 8️⃣ Store refresh token
    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      deviceId: finalDeviceId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // 9️⃣ Response
    return NextResponse.json({
      accessToken,
      refreshToken,
      deviceId: finalDeviceId,
      mustChangePassword: true, // still important
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
