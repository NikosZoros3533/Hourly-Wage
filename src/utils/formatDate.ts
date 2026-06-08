// src/utils/formatDate.ts
export const formatDisplayDate = (dateString: string): string => {
  // Input: "2026-06-08" (YYYY-MM-DD)
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
