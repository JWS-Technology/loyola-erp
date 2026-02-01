import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TimetableTemplate from "@/models/timetableTemplate.model";
import CollegeConfig from "@/models/collegeConfig.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get("start"); // "2026-02-01"
    const endParam = searchParams.get("end"); // "2026-02-07"

    if (!startParam || !endParam) {
      return NextResponse.json(
        { success: false, error: "Range required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 1. Fetch Config & Templates Parallelly
    const [config, templates] = await Promise.all([
      CollegeConfig.findOne({ type: "TIMETABLE_CONFIG" }).lean(),
      TimetableTemplate.find({}).lean(),
    ]);

    if (!config) return NextResponse.json({ success: false, data: {} });

    // 2. Loop through the range
    const startDate = new Date(startParam);
    const endDate = new Date(endParam);
    const resultMap: Record<string, any> = {};

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateKey = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay().toString();

      // Resolve Logic
      const override = config.overrides?.[dateKey];
      const weekly = config.weeklySchedule?.[dayOfWeek];
      const templateName = override || weekly || "HOLIDAY";
      const isHoliday = templateName === "HOLIDAY";

      // Find slots if not holiday
      let slots: any[] = [];
      if (!isHoliday) {
        const t = templates.find((tmp: any) => tmp.name === templateName);
        if (t) {
          slots = t.slots.map((s: any) => ({
            l: s.label,
            t: _shortType(s.type),
            s: s.startTime,
            e: s.endTime,
          }));
        }
      }

      resultMap[dateKey] = {
        template: templateName,
        isHoliday: isHoliday,
        slots: slots,
      };
    }

    return NextResponse.json({ success: true, data: resultMap });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}

function _shortType(type: string) {
  return (
    { PERIOD: "P", BREAK: "B", LAB: "L", EXAM: "E", FREE: "F" }[type] || "F"
  );
}
