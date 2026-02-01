import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TimetableTemplate from "@/models/timetableTemplate.model";
import CollegeConfig from "@/models/collegeConfig.model";

// 🚀 RAM Cache (Reuse this logic across files or keep it here)
let globalCache: any = {
  config: null,
  templates: [], // We might not even need templates for this specific logic, just the config
  lastFetch: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 Minutes

async function getCachedConfig() {
  const now = Date.now();
  if (globalCache.config && now - globalCache.lastFetch < CACHE_TTL) {
    return globalCache.config;
  }

  await dbConnect();
  // We only need the Config to resolve dates.
  // We don't need the full slot details here if we trust the client has them.
  const config = await CollegeConfig.findOne({
    type: "TIMETABLE_CONFIG",
  }).lean();

  globalCache.config = config;
  globalCache.lastFetch = now;
  return config;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // "2026-02"

    if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { success: false, error: "Invalid month format. Use YYYY-MM" },
        { status: 400 },
      );
    }

    // 1. Get Config from RAM
    const config = await getCachedConfig();

    if (!config) {
      return NextResponse.json({
        success: false,
        error: "No Schedule Config Found",
      });
    }

    // 2. Calculate Date Range
    const [year, month] = monthParam.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1); // Feb 1st
    const endDate = new Date(year, month, 0); // Last day of Feb

    const resultMap: Record<string, any> = {};

    // 3. Loop through every day of the month
    // We use a simple loop to generate keys "2026-02-01", "2026-02-02", etc.
    for (let d = 1; d <= endDate.getDate(); d++) {
      // Format YYYY-MM-DD safely
      const dayString = String(d).padStart(2, "0");
      const dateKey = `${monthParam}-${dayString}`;

      // Get Day of Week (0=Sun, 1=Mon...)
      // Create date object in Local time logic or force UTC to avoid timezone jumps
      const currentDay = new Date(year, month - 1, d);
      const dayOfWeek = currentDay.getDay().toString();

      // 4. RESOLVE LOGIC (Priority: Override > Weekly > Holiday)
      let templateName = "HOLIDAY";
      let isHoliday = true;

      const override = config.overrides?.[dateKey];
      const weekly = config.weeklySchedule?.[dayOfWeek];

      if (override) {
        templateName = override;
        isHoliday = override === "HOLIDAY";
      } else if (weekly) {
        templateName = weekly;
        isHoliday = weekly === "HOLIDAY";
      }

      // Add to map
      resultMap[dateKey] = {
        template: templateName,
        isHoliday: isHoliday,
      };
    }

    // 5. Return the Map
    return NextResponse.json({
      success: true,
      month: monthParam,
      data: resultMap,
    });
  } catch (error) {
    console.error("Month API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}
