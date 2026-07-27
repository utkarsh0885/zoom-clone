import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInviteLink(meetingId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/join/${meetingId}`;
  }
  return `http://localhost:3000/join/${meetingId}`;
}
