"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const PLAN_LIMITS = {
    TRIAL: { realtimeMinutes: 20, diagrams: 5, videos: 1, tokens: 5000 }, // Added small limits for trial
    BASIC: { realtimeMinutes: 60, diagrams: 100, videos: 3, tokens: 10000 },
    PRO: { realtimeMinutes: 240, diagrams: 999999, videos: 20, tokens: 50000 },
    UNLIMITED: { realtimeMinutes: 800, diagrams: 999999, videos: 999999, tokens: 999999 },
};
class UsageService {
    async checkLimit(userId, type, amount = 1) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const plan = user.plan || 'TRIAL';
        const limits = PLAN_LIMITS[plan];
        // Map DB field names to limit keys
        const fieldMap = {
            realtimeMinutes: 'realtimeMinutesUsed',
            diagrams: 'diagramsUsed',
            videos: 'videosUsed',
            tokens: 'tokensUsed'
        };
        const currentUsage = user[fieldMap[type]];
        const limit = limits[type];
        if (currentUsage + amount > limit) {
            // Check for add-on credits
            if (user.creditBalance > 0) {
                // Deduct 1 credit for the overage (simplified model: 1 credit = 1 unit of usage)
                // In a real app, we might have different costs for different actions.
                await prisma.user.update({
                    where: { id: userId },
                    data: { creditBalance: { decrement: 1 } }
                });
                return true;
            }
            throw new Error(`Plan limit reached for ${type}. Upgrade your plan or add credits.`);
        }
        return true;
    }
    async incrementUsage(userId, type, amount = 1) {
        const fieldMap = {
            realtimeMinutes: 'realtimeMinutesUsed',
            diagrams: 'diagramsUsed',
            videos: 'videosUsed',
            tokens: 'tokensUsed'
        };
        await prisma.user.update({
            where: { id: userId },
            data: {
                [fieldMap[type]]: { increment: amount }
            }
        });
    }
    async trackSessionDuration(userId, startTime) {
        const durationMs = Date.now() - startTime;
        const minutes = Math.ceil(durationMs / 60000);
        if (minutes > 0) {
            await this.incrementUsage(userId, 'realtimeMinutes', minutes);
        }
    }
}
exports.UsageService = UsageService;
