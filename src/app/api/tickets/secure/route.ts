import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL no proporcionada" }, { status: 400 });
    }

    // Extract public_id and resource_type
    let type = "upload";
    let split = url.split('/upload/');
    if (split.length < 2) {
      split = url.split('/authenticated/');
      if (split.length >= 2) {
        type = "authenticated";
      } else {
        return NextResponse.json({ error: "URL inválida" }, { status: 400 });
      }
    }

    let path = split[1];
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, '');
    }
    const lastDotIndex = path.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? path.substring(0, lastDotIndex) : path;
    const format = lastDotIndex !== -1 ? path.substring(lastDotIndex + 1) : '';

    const isPdf = url.toLowerCase().endsWith('.pdf');
    const isVideo = url.includes('/video/');
    const resourceType = isPdf ? 'raw' : (isVideo ? 'video' : 'image');

    // Generate signed URL valid for 5 minutes
    const signedUrl = cloudinary.url(publicId, {
      type: type, // "authenticated" or "upload"
      resource_type: resourceType,
      sign_url: true,
      secure: true,
      format: format || undefined,
      expires_at: Math.floor(Date.now() / 1000) + 300
    });

    // Fetch the image on the server side and stream it to the client
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Cloudinary returned ${response.status}`);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "private, no-store, max-age=0, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Error generating secure URL:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
