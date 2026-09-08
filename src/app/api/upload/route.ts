import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    let files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      // Fallback para mantener compatibilidad temporal si mandan 'file' en vez de 'files'
      const singleFile = formData.get("file") as File | null;
      if (singleFile) {
        files = [singleFile];
      } else {
        return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
      }
    }

    const urls: string[] = [];

    // Subir cada archivo a Cloudinary
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "finanzas_tickets", resource_type: "auto", type: "authenticated" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      urls.push((uploadResult as any).secure_url);
    }

    return NextResponse.json({ urls, url: urls[0] }); // Retornamos `url` también por compatibilidad temporal
  } catch (error: any) {
    console.error("Error uploading files to Cloudinary:", error);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
