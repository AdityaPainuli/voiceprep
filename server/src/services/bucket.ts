import { S3Client } from "@aws-sdk/client-s3";

export const railwayS3 = new S3Client({
  region: "auto",
  endpoint: "https://storage.railway.app",
  credentials: {
    accessKeyId: process.env.RAILWAY_S3_ACCESS_KEY!,
    secretAccessKey: process.env.RAILWAY_S3_SECRET_KEY!,
  },
  forcePathStyle: true, // ✅ REQUIRED for Railway
});
