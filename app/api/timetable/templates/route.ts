import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TimetableTemplate from "@/models/timetableTemplate.model";

// GET: Fetch all templates (already used by Master API, but good to have separate)
export async function GET() {
  await dbConnect();
  const templates = await TimetableTemplate.find({});
  return NextResponse.json({ success: true, data: templates });
}

// POST: Create a NEW Template
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Body: { name: "HALF_DAY", slots: [...] }
    const { name, slots } = body;

    // Validation
    if (!name || !slots || slots.length === 0) {
      return NextResponse.json(
        { success: false, error: "Name and at least 1 slot are required" },
        { status: 400 },
      );
    }

    // Check Duplicate Name
    const existing = await TimetableTemplate.findOne({
      name: name.toUpperCase(),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Template name already exists" },
        { status: 409 },
      );
    }

    // Create
    const newTemplate = await TimetableTemplate.create({
      name: name.toUpperCase(), // Force uppercase standard
      slots: slots,
    });

    return NextResponse.json(
      { success: true, data: newTemplate },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Template Error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}
