export type Shift = {
  id?: number;

  date: string;

  startTime: string;

  endTime: string;

  hours: number;

  money: number;

  paid: number;

  paidGroupId?: number | null;
};