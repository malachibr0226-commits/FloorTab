import type { Database, MenuItem, Table } from "./types.js";

const menu: MenuItem[] = [
  { id: "m1", name: "Margherita Pizza", category: "food", price: 14.0 },
  { id: "m2", name: "Caesar Salad", category: "food", price: 9.5 },
  { id: "m3", name: "Truffle Fries", category: "food", price: 7.0 },
  { id: "m4", name: "Grilled Salmon", category: "food", price: 22.0 },
  { id: "m5", name: "Cheeseburger", category: "food", price: 15.5 },
  { id: "m6", name: "House Red Wine", category: "drink", price: 8.0 },
  { id: "m7", name: "Craft Lager", category: "drink", price: 6.5 },
  { id: "m8", name: "Sparkling Water", category: "drink", price: 3.5 },
  { id: "m9", name: "Espresso", category: "drink", price: 3.0 },
];

function makeTables(): Table[] {
  const layout: Array<{ label: string; seats: number }> = [
    { label: "T1", seats: 2 },
    { label: "T2", seats: 2 },
    { label: "T3", seats: 4 },
    { label: "T4", seats: 4 },
    { label: "T5", seats: 4 },
    { label: "T6", seats: 6 },
    { label: "Bar 1", seats: 1 },
    { label: "Bar 2", seats: 1 },
    { label: "Patio 1", seats: 4 },
  ];
  return layout.map((t, i) => ({
    id: `t${i + 1}`,
    label: t.label,
    seats: t.seats,
    status: "available",
    tab: null,
  }));
}

export function seedDatabase(): Database {
  return { menu, tables: makeTables() };
}
