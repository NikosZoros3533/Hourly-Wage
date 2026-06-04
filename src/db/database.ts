import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("oloiolo.db");

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY NOT NULL,
      hourlyRate REAL
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      date TEXT NOT NULL,

      startTime TEXT NOT NULL,

      endTime TEXT NOT NULL,

      hours REAL NOT NULL,

      money REAL NOT NULL,

      paid INTEGER DEFAULT 0,

      paidGroupId INTEGER
    );
  `);
};