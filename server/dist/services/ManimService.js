"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManimService = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const crypto_1 = __importDefault(require("crypto"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ManimService {
    constructor() {
        this.outputDir = path_1.default.join(process.cwd(), 'public', 'animations');
        // Use the venv python executable
        this.pythonPath = path_1.default.join(process.cwd(), 'venv', 'bin', 'python');
        // Ensure output directory exists
        if (!fs_1.default.existsSync(this.outputDir)) {
            fs_1.default.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    async generateVideo(code, title) {
        const timestamp = Date.now();
        const randomId = crypto_1.default.randomBytes(4).toString('hex');
        const filename = `manim_${timestamp}_${randomId}`;
        const pyFilePath = path_1.default.join(this.outputDir, `${filename}.py`);
        // Wrap code to ensure it imports manim and has a class
        // We expect the LLM to provide the full Scene class, but we can add imports if missing
        let finalCode = code;
        if (!code.includes('from manim import *')) {
            finalCode = `from manim import *\n\n${code}`;
        }
        // Write python file
        await fs_1.default.promises.writeFile(pyFilePath, finalCode);
        try {
            // Run manim
            // -ql = quality low (faster rendering)
            // -o = output filename
            // --media_dir = where to store media
            const command = `"${this.pythonPath}" -m manim -ql "${pyFilePath}" -o "${filename}.mp4" --media_dir "${this.outputDir}"`;
            console.log(`Executing Manim: ${command}`);
            const { stdout, stderr } = await execAsync(command);
            console.log('Manim stdout:', stdout);
            // Manim usually outputs to media_dir/videos/py_filename/quality/filename.mp4
            // But with -o and custom media_dir it might vary. 
            // Let's rely on the fact that we set the output filename.
            // By default manim creates a complex folder structure. 
            // Let's try to find the file or simplify the command.
            // Simpler approach: Let manim do its thing and find the file.
            // With -o, it names the file. 
            // The output path usually ends up in <media_dir>/videos/<py_filename>/480p15/<filename>.mp4 for -ql
            // Actually, to make it easier to serve, let's move the file after generation if needed.
            // Or better, search for the .mp4 file in the output dir recursively.
            // Construct the expected path based on Manim defaults for -ql (480p15)
            // Note: The class name is usually needed for the command if multiple scenes, 
            // but if we don't specify, it renders the first one.
            // Let's assume the file is generated. We need to find where.
            // A reliable way is to use `find` or just look in the expected folder.
            // For -ql, it's 480p15.
            const expectedPath = path_1.default.join(this.outputDir, 'videos', filename, '480p15', `${filename}.mp4`);
            console.log('Expected video path:', expectedPath);
            // We want to serve it from /animations/<filename>.mp4
            const publicPath = path_1.default.join(this.outputDir, `${filename}.mp4`);
            console.log('Target public path:', publicPath);
            // Wait a bit for file system
            await new Promise(resolve => setTimeout(resolve, 500));
            if (fs_1.default.existsSync(expectedPath)) {
                console.log('File found at expected path, moving...');
                await fs_1.default.promises.rename(expectedPath, publicPath);
                // Clean up the video folder
                await fs_1.default.promises.rm(path_1.default.join(this.outputDir, 'videos'), { recursive: true, force: true });
                console.log('Move successful');
            }
            else {
                console.error('File NOT found at expected path');
                // Fallback: try to find any mp4 in the directory created
                // This part is a bit brittle, but let's try to be robust
                // If the user didn't provide a class name, manim might error or pick one.
            }
            // Cleanup python file
            // await fs.promises.unlink(pyFilePath);
            return `/animations/${filename}.mp4`;
        }
        catch (error) {
            console.error('Manim generation failed:', error);
            throw new Error('Failed to generate animation');
        }
    }
}
exports.ManimService = ManimService;
