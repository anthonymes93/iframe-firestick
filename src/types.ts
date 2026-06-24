export interface DisplayPage {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  durationMinutes?: number; // per-page override; falls back to config default
}

export interface DisplayConfig {
  pages: DisplayPage[];
  defaultDurationMinutes: number;
}
