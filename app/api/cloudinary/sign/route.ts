// app/api/cloudinary/sign/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "";
    const public_id = body.public_id || "";

    // timestamp dalam detik
    const timestamp = Math.floor(Date.now() / 1000);

    // Buat string untuk ditandatangani.
    // Cloudinary expects parameters sorted alphabetically when signing.
    // Kita sign: folder, public_id, timestamp (only if provided).
    const paramsToSign: string[] = [];
    paramsToSign.push(`timestamp=${timestamp}`);
    if (folder) paramsToSign.push(`folder=${folder}`);
    if (public_id) paramsToSign.push(`public_id=${public_id}`);
    const toSign = paramsToSign.join("&");

    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const signature = crypto
      .createHash("sha1")
      .update(toSign + process.env.CLOUDINARY_API_SECRET)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    console.error("Sign error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
