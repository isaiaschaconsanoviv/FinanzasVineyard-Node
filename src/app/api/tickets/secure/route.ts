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

    const preParts = split[0].split('/');
    const resourceType = preParts[preParts.length - 1]; // 'image', 'video', or 'raw'

    let path = decodeURIComponent(split[1]);
    
    // Remove Cloudinary signature if present (e.g. s--vLyI662w--)
    path = path.replace(/^s--[\w-]+--\//, '');
    
    // Remove version string if present (e.g. v1787324166)
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, '');
    }
    const lastDotIndex = path.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? path.substring(0, lastDotIndex) : path;
    const format = lastDotIndex !== -1 ? path.substring(lastDotIndex + 1) : '';

    const downloadUrl = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: type
    });

    // Fetch the image on the server side and stream it to the client
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Cloudinary error ${response.status} for ${downloadUrl}:`, errorText);
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
