import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, differenceInMonths, differenceInYears } from "date-fns";

let GLOBAL_ANNIVERSARY_DATE = new Date("2022-07-28T00:00:00");

export function setAnniversaryDate(date: string) {
  GLOBAL_ANNIVERSARY_DATE = new Date(date);
}

export function getTimeTogether() {
  const now = new Date();
  
  const years = differenceInYears(now, GLOBAL_ANNIVERSARY_DATE);
  const months = differenceInMonths(now, GLOBAL_ANNIVERSARY_DATE) % 12;
  const days = differenceInDays(now, GLOBAL_ANNIVERSARY_DATE) % 30; // Approximation for display
  const hours = differenceInHours(now, GLOBAL_ANNIVERSARY_DATE) % 24;
  const minutes = differenceInMinutes(now, GLOBAL_ANNIVERSARY_DATE) % 60;
  const seconds = differenceInSeconds(now, GLOBAL_ANNIVERSARY_DATE) % 60;

  return { years, months, days, hours, minutes, seconds };
}

export function getCurrentPhase() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const feb14 = new Date(currentYear, 1, 14); // Feb is 1
  
  if (now >= feb14) {
    return "dashboard";
  }
  return "invitation";
}

export function isTrackUnlocked(day: number, hour: number = 0) {
  if (typeof window !== "undefined") {
    const debugUnlock = localStorage.getItem("debug_unlock_all") === "true";
    if (debugUnlock) return true;
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const targetDate = new Date(currentYear, 1, day, hour, 0, 0); // Feb is 1
  return now >= targetDate;
}

export function getTimeUntil(day: number, hour: number = 0) {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), 1, day, hour, 0, 0);
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

export function getDaysUntil(day: number) {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), 1, day);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
