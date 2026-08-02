export type AnalyticsEventType =
  | "view"
  | "click"
  | "action"
  | "share"
  | "save_contact";

export interface IAnalyticsEvent {
  _id: string;
  cardId: string;
  eventType: AnalyticsEventType;
  eventDetail?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
}

export interface IAnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  totalActions: number;
  totalShares: number;
  totalSaveContacts: number;
  daysLive: number;
  engagementRate: number;
}
