import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import dbConnect from "@/config/dbConnect";
import RefreshToken from "@/models/refreshToken.model";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { refreshToken, deviceId } = await req.json();

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }

  // Hash incoming refresh token (SHA-256)
  const incomingTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Find matching active token
  const matchedToken = await RefreshToken.findOne({
    tokenHash: incomingTokenHash,
    revoked: false,
  });

  if (
    !matchedToken ||
    matchedToken.expiresAt < new Date() ||
    (deviceId && matchedToken.deviceId !== deviceId)
  ) {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 401 }
    );
  }

  // 🔁 Rotate refresh token
  matchedToken.revoked = true;
  await matchedToken.save();

  const newRefreshToken = crypto.randomBytes(40).toString("hex");
  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await RefreshToken.create({
    userId: matchedToken.userId,
    deviceId: matchedToken.deviceId,
    tokenHash: newRefreshTokenHash,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const newAccessToken = jwt.sign(
    { userId: matchedToken.userId },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  return NextResponse.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}
