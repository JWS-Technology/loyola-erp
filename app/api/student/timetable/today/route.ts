import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TimetableTemplate from "@/models/timetableTemplate.model";
import CollegeConfig from "@/models/collegeConfig.model";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1️⃣ Get today in IST
    const now = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffsetMs);

    const year = istNow.getFullYear();
    const month = String(istNow.getMonth() + 1).padStart(2, "0");
    const day = String(istNow.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    const dayOfWeek = istNow.getDay().toString();

    // 2️⃣ Fetch config + templates
    const [config, templates] = await Promise.all([
      CollegeConfig.findOne({ type: "TIMETABLE_CONFIG" }).lean(),
      TimetableTemplate.find({}).lean(),
    ]);

    // No config → holiday
    if (!config) {
      const payload = {
        date: dateKey,
        template: "HOLIDAY",
        isHoliday: true,
        slots: [],
      };

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
    }

    // 3️⃣ Resolve template
    const overrideTemplate = config.overrides?.[dateKey];
    const weeklyTemplate = config.weeklySchedule?.[dayOfWeek];
    const templateName = overrideTemplate || weeklyTemplate || "HOLIDAY";

    const template = templates.find((t) => t.name === templateName);

    // Holiday / empty template
    if (!template || template.slots.length === 0) {
      const payload = {
        date: dateKey,
        template: templateName,
        isHoliday: true,
        slots: [],
      };

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
    }

    // 4️⃣ Minify slots
    const slots = template.slots.map((s: any) => ({
      l: s.label,
      t: _shortType(s.type),
      s: s.startTime,
      e: s.endTime,
    }));

    const payload = {
      date: dateKey,
      template: templateName,
      isHoliday: false,
      slots,
    };

    // 5️⃣ Version hash
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

function _shortType(type: string) {
  const map: any = {
    PERIOD: "P",
    BREAK: "B",
    LAB: "L",
    EXAM: "E",
    FREE: "F",
  };
  return map[type] || "F";
}
