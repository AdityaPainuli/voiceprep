export interface ClientContext {
  userId: string;
  lessonPlanId: string;
}

type RealtimeSessionState = {
  activeStart: number | null;
  lastActivityAt: number | null;
  interval: NodeJS.Timeout | null;
};
