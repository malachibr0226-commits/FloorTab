import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "./types.js";
import { seedDatabase } from "./seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");
const DATA_FILE = resolve(DATA_DIR, "floortab.json");

let db: Database;

function persist(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export function loadDatabase(): void {
  if (existsSync(DATA_FILE)) {
    try {
      db = JSON.parse(readFileSync(DATA_FILE, "utf-8")) as Database;
      return;
    } catch {
      // Corrupt file — fall through to a fresh seed.
    }
  }
  db = seedDatabase();
  persist();
}

export function getDatabase(): Database {
  return db;
}

export function saveDatabase(): void {
  persist();
}

export function resetDatabase(): void {
  db = seedDatabase();
  persist();
}
