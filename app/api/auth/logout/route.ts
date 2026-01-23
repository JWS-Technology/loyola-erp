import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/config/dbConnect";
import RefreshToken from "@/models/refreshToken.model";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { refreshToken } = await req.json();

  const tokens = await RefreshToken.find({ revoked: false });

  for (const token of tokens) {
    const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
    if (isMatch) {
      token.revoked = true;
      await token.save();
      break;
    }
  }

  return NextResponse.json({ message: "Logged out" });
}
