import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import "dotenv/config";

export const railwayS3 = new S3Client({
  region: "auto",
  endpoint: "https://storage.railway.app",
  credentials: {
    accessKeyId: process.env.RAILWAY_S3_ACCESS_KEY!,
    secretAccessKey: process.env.RAILWAY_S3_SECRET_KEY!,
  },
  forcePathStyle: true, // ✅ REQUIRED for Railway
});

type UploadMediaParams = {
  localFilepath: string;
  mimeType: string;
  folder?: "videos" | "image";
};

type UploadMediaResult = {
  fileId: string;
  fileUrl: string;
  key: string;
};

/**
 * Uploads media to Railway bucket and returns stable fileId + URL
 */
export async function uploadMediaToBucket(
  params: UploadMediaParams
): Promise<UploadMediaResult> {
  const { localFilepath, mimeType, folder = "videos" } = params;

  if (!fs.existsSync(localFilepath)) {
    throw new Error(`File not found: ${localFilepath}`);
  }

  const ext = path.extname(localFilepath);
  const fileId = crypto.randomUUID();

  // 🔑 This is the REAL storage identifier
  const key = `${folder}/${fileId}${ext}`;

  const fileStream = fs.createReadStream(localFilepath);

  // 1️⃣ Upload (NO ACL — Railway ignores it)
  await railwayS3.send(
    new PutObjectCommand({
      Bucket: process.env.RAILWAY_BUCKET_NAME!,
      Key: key,
      Body: fileStream,
      ContentType: mimeType,
    })
  );

  // 2️⃣ Generate signed URL (publicly usable)
  const fileUrl = await getSignedUrl(
    railwayS3,
    new GetObjectCommand({
      Bucket: process.env.RAILWAY_BUCKET_NAME!,
      Key: key,
    }),
    {
      expiresIn: 60 * 60, // 1 hour
    }
  );

  return {
    fileId,
    key, // 👈 SAVE THIS
    fileUrl, // 👈 SEND THIS TO FE
  };
}
export async function getSignedMediaUrl(key: string) {
  return await getSignedUrl(
    railwayS3,
    new GetObjectCommand({
      Bucket: process.env.RAILWAY_BUCKET_NAME!,
      Key: key,
    }),
    { expiresIn: 60 * 60 } // 1 hour
  );
}
