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

export interface Tab {
  id: string;
  tableId: string;
  serverName: string;
  openedAt: string;
  items: TabItem[];
}

export interface Table {
  id: string;
  label: string;
  seats: number;
  status: "available" | "occupied";
  tab: Tab | null;
  total: number;
}
