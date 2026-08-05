export interface MenuItem {
  id: string;
  name: string;
  category: "food" | "drink";
  price: number;
}

export interface TabItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export type TableStatus = "available" | "occupied";

export interface Table {
  id: string;
  label: string;
  seats: number;
  status: TableStatus;
  tab: Tab | null;
}

export interface Tab {
  id: string;
  tableId: string;
  serverName: string;
  openedAt: string;
  items: TabItem[];
}

export interface Database {
  menu: MenuItem[];
  tables: Table[];
}
