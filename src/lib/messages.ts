export type MessageStatus = "pending" | "sent" | "cancelled";

export interface Message {
  id: string;
  recipient: string;
  body: string;
  createdAt: number;
  sendAt: number;
  status: MessageStatus;
}

const STORAGE_KEY = "delayed_messages";

export function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function createMessage(
  recipient: string,
  body: string,
  sendAt: number
): Message {
  return {
    id: crypto.randomUUID(),
    recipient,
    body,
    createdAt: Date.now(),
    sendAt,
    status: "pending",
  };
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  if (totalSeconds >= 86400) {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  } else if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  } else if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }
  return `${totalSeconds}s`;
}

export function formatDelay(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${minutes} min`;
}
