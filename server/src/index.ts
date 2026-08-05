import { randomUUID } from "node:crypto";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { getDatabase, loadDatabase, resetDatabase, saveDatabase } from "./store.js";
import type { Table, Tab } from "./types.js";

const PORT = Number(process.env.PORT ?? 4000);

loadDatabase();

const app = express();
app.use(cors());
app.use(express.json());

function tabTotal(tab: Tab): number {
  return Number(
    tab.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
}

function serializeTable(table: Table) {
  return {
    ...table,
    total: table.tab ? tabTotal(table.tab) : 0,
  };
}

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "floortab-server" });
});

app.get("/api/menu", (_req: Request, res: Response) => {
  res.json(getDatabase().menu);
});

app.get("/api/tables", (_req: Request, res: Response) => {
  res.json(getDatabase().tables.map(serializeTable));
});

app.get("/api/tables/:id", (req: Request, res: Response) => {
  const table = getDatabase().tables.find((t) => t.id === req.params.id);
  if (!table) {
    return res.status(404).json({ error: "Table not found" });
  }
  res.json(serializeTable(table));
});

// Open a new tab for a table.
app.post("/api/tables/:id/open", (req: Request, res: Response) => {
  const table = getDatabase().tables.find((t) => t.id === req.params.id);
  if (!table) {
    return res.status(404).json({ error: "Table not found" });
  }
  if (table.status === "occupied") {
    return res.status(409).json({ error: "Table already has an open tab" });
  }
  const serverName = String(req.body?.serverName ?? "Staff").trim() || "Staff";
  table.status = "occupied";
  table.tab = {
    id: randomUUID(),
    tableId: table.id,
    serverName,
    openedAt: new Date().toISOString(),
    items: [],
  };
  saveDatabase();
  res.status(201).json(serializeTable(table));
});

// Add a menu item to an open tab.
app.post("/api/tables/:id/items", (req: Request, res: Response) => {
  const db = getDatabase();
  const table = db.tables.find((t) => t.id === req.params.id);
  if (!table || !table.tab) {
    return res.status(404).json({ error: "No open tab for this table" });
  }
  const menuItem = db.menu.find((m) => m.id === req.body?.menuItemId);
  if (!menuItem) {
    return res.status(400).json({ error: "Unknown menu item" });
  }
  const quantity = Math.max(1, Number(req.body?.quantity ?? 1));
  const existing = table.tab.items.find((i) => i.menuItemId === menuItem.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    table.tab.items.push({
      id: randomUUID(),
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    });
  }
  saveDatabase();
  res.status(201).json(serializeTable(table));
});

// Remove one line item from an open tab.
app.delete("/api/tables/:id/items/:itemId", (req: Request, res: Response) => {
  const table = getDatabase().tables.find((t) => t.id === req.params.id);
  if (!table || !table.tab) {
    return res.status(404).json({ error: "No open tab for this table" });
  }
  table.tab.items = table.tab.items.filter((i) => i.id !== req.params.itemId);
  saveDatabase();
  res.json(serializeTable(table));
});

// Close (pay) a tab and free the table.
app.post("/api/tables/:id/close", (req: Request, res: Response) => {
  const table = getDatabase().tables.find((t) => t.id === req.params.id);
  if (!table || !table.tab) {
    return res.status(404).json({ error: "No open tab for this table" });
  }
  const receipt = {
    tabId: table.tab.id,
    tableLabel: table.label,
    serverName: table.tab.serverName,
    items: table.tab.items,
    total: tabTotal(table.tab),
    closedAt: new Date().toISOString(),
  };
  table.status = "available";
  table.tab = null;
  saveDatabase();
  res.json(receipt);
});

// Reset all tables/tabs back to the seeded state (handy for demos).
app.post("/api/reset", (_req: Request, res: Response) => {
  resetDatabase();
  res.json({ status: "reset" });
});

app.listen(PORT, () => {
  console.log(`FloorTab API listening on http://localhost:${PORT}`);
});
