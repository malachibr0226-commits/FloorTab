import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { MenuItem, Table } from "./types";

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function App() {
  const [tables, setTables] = useState<Table[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serverName, setServerName] = useState("Alex");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [tablesData, menuData] = await Promise.all([
        api.getTables(),
        api.getMenu(),
      ]);
      setTables(tablesData);
      setMenu(menuData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selected = useMemo(
    () => tables.find((t) => t.id === selectedId) ?? null,
    [tables, selectedId],
  );

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      try {
        await action();
        await refresh();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    },
    [refresh],
  );

  const occupied = tables.filter((t) => t.status === "occupied").length;
  const floorTotal = tables.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◧</span>
          <div>
            <h1>FloorTab</h1>
            <p>Floor &amp; tab management</p>
          </div>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{tables.length}</span>
            <span className="stat-label">Tables</span>
          </div>
          <div className="stat">
            <span className="stat-value">{occupied}</span>
            <span className="stat-label">Occupied</span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatMoney(floorTotal)}</span>
            <span className="stat-label">Open sales</span>
          </div>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}

      <main className="layout">
        <section className="floor">
          <h2>Floor plan</h2>
          {loading ? (
            <p className="muted">Loading floor…</p>
          ) : (
            <div className="grid">
              {tables.map((table) => (
                <button
                  key={table.id}
                  className={`table-card ${table.status} ${
                    table.id === selectedId ? "selected" : ""
                  }`}
                  onClick={() => setSelectedId(table.id)}
                >
                  <div className="table-head">
                    <span className="table-label">{table.label}</span>
                    <span className="seats">{table.seats} seats</span>
                  </div>
                  <div className="table-status">
                    {table.status === "occupied" ? (
                      <>
                        <span className="dot" /> {formatMoney(table.total)}
                      </>
                    ) : (
                      "Available"
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="panel">
          {!selected ? (
            <div className="empty">
              <h2>Select a table</h2>
              <p className="muted">
                Pick a table on the floor to open a tab or add items.
              </p>
            </div>
          ) : selected.status === "available" ? (
            <div className="empty">
              <h2>{selected.label}</h2>
              <p className="muted">This table is available.</p>
              <label className="field">
                Server name
                <input
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                />
              </label>
              <button
                className="primary"
                onClick={() => run(() => api.openTab(selected.id, serverName))}
              >
                Open tab
              </button>
            </div>
          ) : (
            <div className="tab-view">
              <div className="tab-head">
                <h2>{selected.label}</h2>
                <span className="muted">Server: {selected.tab?.serverName}</span>
              </div>

              <div className="items">
                {selected.tab && selected.tab.items.length > 0 ? (
                  selected.tab.items.map((item) => (
                    <div key={item.id} className="line-item">
                      <span className="qty">{item.quantity}×</span>
                      <span className="name">{item.name}</span>
                      <span className="price">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                      <button
                        className="remove"
                        title="Remove"
                        onClick={() => run(() => api.removeItem(selected.id, item.id))}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="muted">No items yet. Add from the menu below.</p>
                )}
              </div>

              <div className="total-row">
                <span>Total</span>
                <span className="total">{formatMoney(selected.total)}</span>
              </div>

              <div className="menu">
                <h3>Menu</h3>
                <div className="menu-grid">
                  {menu.map((m) => (
                    <button
                      key={m.id}
                      className="menu-item"
                      onClick={() => run(() => api.addItem(selected.id, m.id))}
                    >
                      <span>{m.name}</span>
                      <span className="menu-price">{formatMoney(m.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="danger"
                onClick={() => run(() => api.closeTab(selected.id))}
              >
                Close &amp; pay ({formatMoney(selected.total)})
              </button>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
