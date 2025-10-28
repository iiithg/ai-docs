"use client";
import { useEffect, useMemo, useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  category: "burger" | "side" | "drink";
  price_cents: number;
  available?: boolean;
};

const MENU: MenuItem[] = [
  { id: "classic", name: "Classic Burger", category: "burger", price_cents: 799 },
  { id: "cheese", name: "Cheeseburger", category: "burger", price_cents: 899 },
  { id: "fries", name: "Fries", category: "side", price_cents: 349 },
  { id: "cola", name: "Cola", category: "drink", price_cents: 199 },
  { id: "shake", name: "Milkshake", category: "drink", price_cents: 499 },
];

const TAX_RATE = 0.08; // 8% tax for demo
const START_WALLET = 2500; // $25.00 in cents
const INITIAL_INVENTORY: Record<string, number> = { classic: 5, cheese: 5, fries: 8, cola: 12, shake: 6 };

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function HomePage() {
  // persisted state
  const [wallet, setWallet] = useState<number>(START_WALLET);
  const [inventory, setInventory] = useState<Record<string, number>>(INITIAL_INVENTORY);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [receipts, setReceipts] = useState<Array<{ id: string; total: number; ts: number }>>([]);
  // UI state
  const [message, setMessage] = useState<string>("");
  const [coupon, setCoupon] = useState<string>("");
  const [devOpen, setDevOpen] = useState<boolean>(false);

  // load/save localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("burger-template-state") || "null");
      if (saved) {
        setWallet(saved.wallet ?? START_WALLET);
        setInventory(saved.inventory ?? INITIAL_INVENTORY);
        setReceipts(saved.receipts ?? []);
      }
    } catch {}
  }, []);
  useEffect(() => {
    const snapshot = { wallet, inventory, receipts };
    localStorage.setItem("burger-template-state", JSON.stringify(snapshot));
  }, [wallet, inventory, receipts]);

  const itemsInCart = useMemo(
    () => MENU.filter((m) => cart[m.id]).map((m) => ({ item: m, qty: cart[m.id] })),
    [cart]
  );

  const subtotal = useMemo(
    () => itemsInCart.reduce((sum, { item, qty }) => sum + item.price_cents * qty, 0),
    [itemsInCart]
  );
  // tax and total are computed later from netSubtotal (after discounts)

  function add(id: string) {
    setCart((c) => {
      const inStock = inventory[id] ?? 0;
      const qty = (c[id] || 0) + 1;
      if (qty > inStock) {
        setMessage("Not enough stock.");
        return c;
      }
      setMessage("");
      return { ...c, [id]: qty };
    });
  }
  function inc(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function dec(id: string) {
    setCart((c) => {
      const next = { ...c } as Record<string, number>;
      const n = (next[id] || 0) - 1;
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }
  function clearCart() {
    setCart({});
  }
  function resetAll() {
    setWallet(START_WALLET);
    setCart({});
    setReceipts([]);
    setInventory(INITIAL_INVENTORY);
    setCoupon("");
    setMessage("Reset to defaults.");
  }
  function checkout() {
    setMessage("");
    if (total === 0) {
      setMessage("Cart is empty.");
      return;
    }
    if (total > wallet) {
      setMessage("Insufficient funds.");
      return;
    }
    // decrease inventory
    setInventory((inv) => {
      const next = { ...inv };
      for (const { item, qty } of itemsInCart) next[item.id] = Math.max(0, (next[item.id] || 0) - qty);
      return next;
    });
    setWallet((w) => w - total);
    setReceipts((r) => [{ id: `R-${Date.now()}`, total, ts: Date.now() }, ...r].slice(0, 5));
    setCart({});
    setMessage("Purchase complete. Enjoy!");
  }

  const categories: Array<MenuItem["category"]> = ["burger", "side", "drink"];

  // pricing logic
  const countsByCategory = useMemo(() => {
    const counts: Record<MenuItem["category"], number> = { burger: 0, side: 0, drink: 0 } as any;
    for (const { item, qty } of itemsInCart) counts[item.category] += qty;
    return counts;
  }, [itemsInCart]);
  const combos = Math.min(countsByCategory.burger, countsByCategory.side, countsByCategory.drink);
  const comboDiscount = combos * 100; // $1 off per combo
  const couponDiscount = coupon.trim().toUpperCase() === "BURGER10" ? Math.round(subtotal * 0.1) : 0;
  const netSubtotal = Math.max(0, subtotal - comboDiscount - couponDiscount);
  const tax = Math.round(netSubtotal * TAX_RATE);
  const total = netSubtotal + tax;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        {/* Brand / Hero */}
        <section className="rounded-lg border bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden>🍔</div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">ByteBurger</h1>
                <p className="text-sm text-neutral-600">Crafting tasty demos since 2025</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-medium text-amber-900">Template</span>
          </div>
          <p className="mt-3 text-sm text-neutral-700">
            Build your meal, apply deals, and checkout — a friendly flow that mirrors a real burger shop.
          </p>
        </section>

        {/* Step 1 — Build Your Meal */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">1</span>
          Build Your Meal
        </div>

        {categories.map((cat) => (
          <section key={cat} className="space-y-3">
            <h2 className="text-lg font-semibold capitalize flex items-center gap-2">
              <span>{cat === 'burger' ? '🍔' : cat === 'side' ? '🍟' : '🥤'}</span>
              <span>{cat}</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MENU.filter((m) => m.category === cat).map((m) => (
                <div key={m.id} className="rounded-lg border bg-white p-4 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m.name}</div>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{fmt(m.price_cents)}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-500">In stock: {inventory[m.id] ?? 0}</div>
                  <button
                    className="mt-3 rounded bg-burger-red px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                    onClick={() => add(m.id)}
                  >
                    Add {cat === 'burger' ? '🍔' : cat === 'side' ? '🍟' : '🥤'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="space-y-4">
        <section className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold flex items-center gap-2"><span aria-hidden>💳</span> Wallet</div>
            <div className="text-sm">Balance: {fmt(wallet)}</div>
          </div>
          <div className="mt-3 flex gap-2 text-sm">
            <button onClick={resetAll} className="rounded border px-3 py-1 text-xs">Reset</button>
            <button onClick={() => setWallet((w)=>w+500)} className="rounded border px-3 py-1 text-xs">+ $5</button>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">2</span>
            Your Order
          </div>
          {itemsInCart.length === 0 ? (
            <div className="text-sm text-neutral-500">No items yet.</div>
          ) : (
            <div className="space-y-2">
              {itemsInCart.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="truncate">
                    <span className="mr-1">{item.category === 'burger' ? '🍔' : item.category === 'side' ? '🍟' : '🥤'}</span>
                    {item.name} <span className="text-neutral-400">×{qty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded border px-2" onClick={() => dec(item.id)}>-</button>
                    <button className="rounded border px-2" onClick={() => inc(item.id)}>+</button>
                    <div className="w-16 text-right">{fmt(item.price_cents * qty)}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button className="rounded border px-3 py-2 text-sm" onClick={clearCart}>Clear</button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-white p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">3</span>
            Deals
          </div>
          <div className="text-sm">Coupon:</div>
          <div className="flex gap-2">
            <input className="rounded border px-2 py-1 text-sm flex-1" placeholder="Code (e.g., BURGER10)" value={coupon} onChange={(e)=>setCoupon(e.target.value)} />
            <button className="rounded border px-3 py-1 text-xs" onClick={()=>setMessage('Coupon applied if valid')}>Apply</button>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">4</span>
            Checkout
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {comboDiscount > 0 && (
              <div className="flex justify-between text-emerald-700"><span>Combo discount ({combos} set)</span><span>-{fmt(comboDiscount)}</span></div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700"><span>Coupon BURGER10</span><span>-{fmt(couponDiscount)}</span></div>
            )}
            <div className="flex justify-between"><span>Tax (8%)</span><span>{fmt(tax)}</span></div>
            <div className="mt-2 flex items-center justify-between border-t pt-2 font-semibold"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
          <button className="mt-3 w-full rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90" onClick={checkout}>Pay Now ✅</button>
          {message && <div className="mt-2 text-sm text-amber-700">{message}</div>}
        </section>

        <section className="rounded-lg border bg-white p-4">
          <div className="font-semibold mb-2">Recent Receipts</div>
          {receipts.length === 0 ? (
            <div className="text-sm text-neutral-500">No purchases yet.</div>
          ) : (
            <ul className="space-y-1 text-sm">
              {receipts.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{new Date(r.ts).toLocaleTimeString()}</span>
                  <span>{fmt(r.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Dev tools inline */}
        <section className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Dev Tools</div>
            <button className="rounded border px-2 py-1 text-xs" onClick={()=>setDevOpen(o=>!o)}>{devOpen? 'Hide':'Show'}</button>
          </div>
          {devOpen && (
            <div className="mt-3 space-y-2 text-xs">
              <div>Inventory: {Object.entries(inventory).map(([k,v])=>`${k}:${v}`).join(' • ')}</div>
              <div className="flex gap-2">
                <button className="rounded border px-2 py-1" onClick={()=>setInventory(INITIAL_INVENTORY)}>Restock</button>
                <button className="rounded border px-2 py-1" onClick={()=>{setWallet(START_WALLET);}}>Reset Wallet</button>
                <button className="rounded border px-2 py-1" onClick={()=>{localStorage.removeItem('burger-template-state'); setMessage('Cleared local save.');}}>Clear Save</button>
              </div>
              <div className="text-neutral-500">Env: {process.env.NEXT_PUBLIC_SUPABASE_URL? 'configured':'not set'} (OK for template)</div>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
