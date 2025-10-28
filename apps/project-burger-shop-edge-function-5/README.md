# project-burger-shop-edge-function-5

Single‑file demo calling a Supabase Edge Function and a Postgres RPC.

## Start From Template
- Copy `apps/burger-template` or reuse its structure.
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Run
- `npm install`
- `npm run dev`
- Add a button in `app/demo/page.tsx` to `fetch('/functions/v1/daily_sales_summary')` and display JSON.

## RPC Example (apply in SQL editor)
```sql
create or replace function public.compute_order_total(order_id uuid)
returns int language sql stable security invoker as $$
  select coalesce(sum(price_cents),0) from public.menu_items mi
  join public.order_items oi on oi.item_id = mi.id
  where oi.order_id = compute_order_total.order_id;
$$;
```

## Next Steps
- Add Edge Function (via Supabase CLI) to compute daily sales; show result in the UI.

