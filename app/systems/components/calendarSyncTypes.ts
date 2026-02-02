export type TimeCategory = "Deep Work" | "Admin" | "Clients" | "Recovery";
export type AudienceSegment = "Clients" | "Partners" | "Internal";
export type SystemOfRecord = "primary_calendar" | "booking_tool" | "";

export interface TimeArchitectureState {
  categories: Record<TimeCategory, boolean>;
  days: Record<TimeCategory, string[]>;
  hoursPerWeek: Record<TimeCategory, number>;
  noMeetingsBefore: string;
  confirmedAdded: boolean;
}

export interface BookingRulesState {
  audience: AudienceSegment;
  bufferPre: number;
  bufferPost: number;
  cancellationWindow: number;
  allowedDays: string[];
  timeRange: string;
  reminderWindow: number;
  applied: boolean;
}

export interface FocusProtectionState {
  createdEvent: boolean;
  statusBusy: boolean;
  hideDetails: boolean;
  addBuffers: boolean;
}

export interface WeeklyResetState {
  day: string;
  time: string;
  duration: number;
  scheduled: boolean;
}

export interface CalendarWizardState {
  step: number;
  timeArchitecture: TimeArchitectureState;
  bookingRules: BookingRulesState;
  focusProtection: FocusProtectionState;
  weeklyReset: WeeklyResetState;
  systemOfRecord: SystemOfRecord;
}

export function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // fallback for older browsers
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}
