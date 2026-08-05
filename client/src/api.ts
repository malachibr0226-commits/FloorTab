import type { MenuItem, Table } from "./types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const api = {
  getMenu: () => request<MenuItem[]>("/api/menu"),
  getTables: () => request<Table[]>("/api/tables"),
  openTab: (tableId: string, serverName: string) =>
    request<Table>(`/api/tables/${tableId}/open`, {
      method: "POST",
      body: JSON.stringify({ serverName }),
    }),
  addItem: (tableId: string, menuItemId: string) =>
    request<Table>(`/api/tables/${tableId}/items`, {
      method: "POST",
      body: JSON.stringify({ menuItemId, quantity: 1 }),
    }),
  removeItem: (tableId: string, itemId: string) =>
    request<Table>(`/api/tables/${tableId}/items/${itemId}`, {
      method: "DELETE",
    }),
  closeTab: (tableId: string) =>
    request<unknown>(`/api/tables/${tableId}/close`, { method: "POST" }),
};
