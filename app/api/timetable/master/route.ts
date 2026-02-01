import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/config/dbConnect";
import TimetableTemplate from "@/models/timetableTemplate.model";
import CollegeConfig from "@/models/collegeConfig.model";

export async function GET() {
  try {
    await dbConnect();

    // 1. Parallel Fetch: Get Templates AND Global Config
    const [templates, configDoc] = await Promise.all([
      TimetableTemplate.find({}).lean(),
      CollegeConfig.findOne({ type: "TIMETABLE_CONFIG" }).lean(),
    ]);

    // 2. Optimize Templates Payload
    const optimizedTemplates = templates.map((t: any) => ({
      id: t.name,
      slots: t.slots.map((s: any) => ({
        l: s.label,
        t: _shortType(s.type),
        s: s.startTime,
        e: s.endTime,
        req: s.attendanceRequired ? 1 : 0,
      })),
    }));

    // 3. Prepare Config
    // If no config exists yet, return empty defaults
    const schedule = configDoc
      ? {
          defaults: configDoc.weeklySchedule,
          overrides: configDoc.overrides,
        }
      : { defaults: {}, overrides: {} };

    return NextResponse.json({
      success: true,
      data: {
        templates: optimizedTemplates,
        schedule: schedule,
      },
    });
  } catch (error) {
    console.error("Timetable Master Error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}

// Helper to minify types (Save bandwidth)
function _shortType(type: string) {
  const map: any = { PERIOD: "P", BREAK: "B", LAB: "L", EXAM: "E", FREE: "F" };
  return map[type] || "F";
}
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Expect body: { weeklySchedule: {...}, overrides: {...} }
    const { weeklySchedule, overrides } = body;

    if (!weeklySchedule) {
      return NextResponse.json(
        { success: false, error: "Weekly Schedule is required" },
        { status: 400 },
      );
    }

    // Update the Single Global Config
    const updated = await CollegeConfig.findOneAndUpdate(
      { type: "TIMETABLE_CONFIG" },
      {
        $set: {
          weeklySchedule: weeklySchedule,
          overrides: overrides || {},
        },
      },
      { new: true, upsert: true }, // Create if doesn't exist
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Schedule Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update schedule" },
      { status: 500 },
    );
  }
}
