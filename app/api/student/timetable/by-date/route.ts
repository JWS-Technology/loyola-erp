import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TimetableTemplate from "@/models/timetableTemplate.model";
import CollegeConfig from "@/models/collegeConfig.model";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: "date is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    // Parse date safely (IST not needed – date is explicit)
    const date = new Date(dateParam + "T00:00:00");
    const dayOfWeek = date.getDay().toString(); // 0=Sun

    // Fetch config + templates
    const [config, templates] = await Promise.all([
      CollegeConfig.findOne({ type: "TIMETABLE_CONFIG" }).lean(),
      TimetableTemplate.find({}).lean(),
    ]);

    // Resolve template
    let templateName = "HOLIDAY";
    if (config) {
      templateName =
        config.overrides?.[dateParam] ||
        config.weeklySchedule?.[dayOfWeek] ||
        "HOLIDAY";
    }

    const template = templates.find((t) => t.name === templateName);

    const payload =
      template && template.slots.length > 0
        ? {
            date: dateParam,
            template: templateName,
            isHoliday: false,
            slots: template.slots.map((s: any) => ({
              l: s.label,
              t: shortType(s.type),
              s: s.startTime,
              e: s.endTime,
            })),
          }
        : {
            date: dateParam,
            template: templateName,
            isHoliday: true,
            slots: [],
          };

    // Version hash
    const version = crypto
      .createHash("sha1")
      .update(JSON.stringify(payload))
      .digest("hex");

    const clientVersion = req.headers.get("if-none-match");
    if (clientVersion && clientVersion === version) {
      return new NextResponse(null, { status: 304 });
    }

    return NextResponse.json({
      success: true,
      version,
      data: payload,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

function shortType(type: string) {
  return (
    { PERIOD: "P", BREAK: "B", LAB: "L", EXAM: "E", FREE: "F" }[type] || "F"
  );
}
