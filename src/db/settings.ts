// src/db/settings.ts
import { db } from "./database";

export const getHourlyRate = async (): Promise<number | null> => {
  const result = await db.getFirstAsync<{ hourlyRate: number }>(
    `SELECT hourlyRate FROM settings LIMIT 1`,
  );
  return result?.hourlyRate ?? null;
};

export const setHourlyRate = async (rate: number): Promise<void> => {
  const existing = await getHourlyRate();
  if (existing === null) {
    await db.runAsync(`INSERT INTO settings (hourlyRate) VALUES (?)`, [rate]);
  } else {
    await db.runAsync(`UPDATE settings SET hourlyRate = ?`, [rate]);
  }
};
