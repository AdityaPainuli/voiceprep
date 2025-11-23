"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
class AuthService {
    async register(email, password) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                plan: 'TRIAL', // Default to Trial
                creditBalance: 0,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
        return { user: { id: user.id, email: user.email, plan: user.plan }, token };
    }
    async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
        return { user: { id: user.id, email: user.email, plan: user.plan }, token };
    }
    async getUser(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                plan: true,
                realtimeMinutesUsed: true,
                diagramsUsed: true,
                videosUsed: true,
                tokensUsed: true,
                creditBalance: true,
            }
        });
    }
}
exports.AuthService = AuthService;
