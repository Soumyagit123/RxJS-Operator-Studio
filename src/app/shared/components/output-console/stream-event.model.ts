export type StreamEventType = 'next' | 'error' | 'complete' | 'subscribe' | 'unsubscribe';

export interface StreamEvent {
  id: string;
  timestamp: number;
  type: StreamEventType;
  value?: any;
  source?: string;
  durationMs?: number;
}
