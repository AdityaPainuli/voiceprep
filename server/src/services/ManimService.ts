import path from "path";
import fs from "fs";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { railwayS3, uploadMediaToBucket } from "./bucket";

const execAsync = promisify(exec);

export class ManimService {
  private outputDir: string;
  private pythonPath: string;

  constructor() {
    this.outputDir = path.join("/tmp", "manim");
    this.pythonPath =
      process.env.PYTHON_PATH ||
      path.join(process.cwd(), "venv", "bin", "python");

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateVideo(
    code: string
  ): Promise<{ fileId: string; fileUrl: string; key: string }> {
    const id = `manim_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const pyFilePath = path.join(this.outputDir, `${id}.py`);
    const finalMp4Path = path.join(this.outputDir, `${id}.mp4`);

    let finalCode = code;
    // Adding fail-safe for the tool code generating
    if (!code.includes("from manim import *")) {
      finalCode = `from manim import *\n\n${code}`;
    }

    await fs.promises.writeFile(pyFilePath, finalCode);

    try {
      const command = `"${this.pythonPath}" -m manim -ql "${pyFilePath}" -o "${id}.mp4" --media_dir "${this.outputDir}"`;
      console.log("🎬 Executing Manim:", command);

      // TODO: Never a good idea to execute code in-house, probably handle it over in isolated container or e2b machines.
      await execAsync(command);

      const expectedPath = path.join(
        this.outputDir,
        "videos",
        id,
        "480p15",
        `${id}.mp4`
      );

      if (!fs.existsSync(expectedPath)) {
        throw new Error("Manim output not found");
      }

      await fs.promises.rename(expectedPath, finalMp4Path);

      // Upload to Railway Object Storage
      const { fileId, fileUrl, key } = await uploadMediaToBucket({
        localFilepath: finalMp4Path,
        mimeType: "video/mp4",
        folder: "videos",
      });

      return { fileId, fileUrl, key };
    } catch (err) {
      console.error("❌ Manim generation failed:", err);
      throw new Error("Failed to generate animation");
    } finally {
      // Cleanup
      fs.existsSync(pyFilePath) && fs.promises.unlink(pyFilePath);
      fs.existsSync(finalMp4Path) && fs.promises.unlink(finalMp4Path);
      fs.promises.rm(path.join(this.outputDir, "videos"), {
        recursive: true,
        force: true,
      });
    }
  }
}
