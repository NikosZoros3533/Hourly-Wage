import { db } from "./database";
import { Shift } from "../types/shift";

export const getUnpaidShifts = async (): Promise<Shift[]> => {
  const result = await db.getAllAsync<Shift>(`
    SELECT * FROM shifts
    WHERE paid = 0
    ORDER BY date DESC
  `);

  return result;
};

export const addShift = async (
  shift: Omit<Shift, "id" | "paid" | "paidGroupId">,
) => {
  await db.runAsync(
    `
      INSERT INTO shifts (
        date,
        startTime,
        endTime,
        hours,
        money,
        paid,
        paidGroupId
      )
      VALUES (?, ?, ?, ?, ?, 0, NULL)
    `,
    [shift.date, shift.startTime, shift.endTime, shift.hours, shift.money],
  );
};

export const markAllAsPaid = async (): Promise<number> => {
  // Generate a unique paidGroupId (timestamp in milliseconds)
  const paidGroupId = Date.now();

  await db.runAsync(
    `
    UPDATE shifts
    SET paid = 1, paidGroupId = ?
    WHERE paid = 0
    `,
    [paidGroupId],
  );

  return paidGroupId;
};

export const getHistory = async (): Promise<
  {
    groupId: number;
    paymentDate: string;
    shifts: Shift[];
    totalHours: number;
    totalMoney: number;
  }[]
> => {
  // First, get all paid shifts, grouped by paidGroupId
  const result = await db.getAllAsync<Shift & { paymentDate?: string }>(`
    SELECT * FROM shifts
    WHERE paid = 1 AND paidGroupId IS NOT NULL
    ORDER BY paidGroupId DESC, date DESC
  `);

  // Group manually (SQLite doesn't return nested objects)
  const groupsMap = new Map<
    number,
    {
      groupId: number;
      paymentDate: string;
      shifts: Shift[];
      totalHours: number;
      totalMoney: number;
    }
  >();

  for (const shift of result) {
    const groupId = shift.paidGroupId!;
    if (!groupsMap.has(groupId)) {
      // Use the first shift's date as a rough payment date
      // Better: store a separate payment_date, but timestamp works as ID + date
      const paymentDate = new Date(groupId).toLocaleDateString();
      groupsMap.set(groupId, {
        groupId,
        paymentDate,
        shifts: [],
        totalHours: 0,
        totalMoney: 0,
      });
    }
    const group = groupsMap.get(groupId)!;
    group.shifts.push(shift);
    group.totalHours += shift.hours;
    group.totalMoney += shift.money;
  }

  return Array.from(groupsMap.values());
};

export const clearHistory = async (): Promise<void> => {
  await db.runAsync(`DELETE FROM shifts WHERE paid = 1`);
};

export const updateShift = async (
  id: number,
  shift: Omit<Shift, "id" | "paid" | "paidGroupId">,
): Promise<void> => {
  await db.runAsync(
    `
    UPDATE shifts
    SET date = ?, startTime = ?, endTime = ?, hours = ?, money = ?
    WHERE id = ?
    `,
    [shift.date, shift.startTime, shift.endTime, shift.hours, shift.money, id],
  );
};

export const deleteShift = async (id: number): Promise<void> => {
  await db.runAsync(`DELETE FROM shifts WHERE id = ?`, [id]);
};
