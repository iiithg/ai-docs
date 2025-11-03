# Standalone Orders Table SQL Example Series
# SQL Example Scripts Directory Overview

This folder (`docs/sql-examples/`) contains a series of fully independent SQL demo scripts, all focused on a single sample "orders" table. These examples are not tied to any project codebase; you can copy and use them in any PostgreSQL or Supabase SQL editor for learning and testing.

## Table Content Description

The `orders` table shown in these examples represents a simplified order data model, as you might find in a food delivery or burger shop system. The table includes:

- Order ID (`id`): serial primary key
- User ID (`user_id`): which user placed the order
- Status (`status`): order status (e.g. 'paid', 'pending', 'cancelled')
- Amount (`amount`): total price of the order (numeric type)
- Details (`details`): a JSONB column that holds an array of order items (each with SKU, name, quantity, price), plus optional extra info like reasons or promotions
- Placed At (`placed_at`): timestamp the order was created (defaults to now)
- Is Paid (`is_paid`): boolean flag indicating if the order has been paid

The included SQL illustrates order creation, querying, updating, and deleting—all based on this single, self-contained table.

## Steps Overview

- `step-1-create-table.sql`: Create the `orders` table with relevant columns and types (serial, int, text, numeric, jsonb, timestamptz, boolean).
- `step-2-seed-orders.sql`: Insert multiple sample rows demonstrating realistic example data (JSON order details, various dates, cancellation, payment flags, etc).
- `step-3-select-examples.sql`: Query examples—select all, filter by status or paid state, select/extract JSON columns.
- `step-4-insert-example.sql`: Standalone INSERT example—add a new order and explain each field.
- `step-5-update-example.sql`: Example UPDATE—mark an order as paid.
- `step-6-delete-example.sql`: Example DELETE—remove old cancelled orders.

## How to Use

1. Run `step-1-create-table.sql` to set up the table (it's safe to run repeatedly).
2. Run `step-2-seed-orders.sql` to fill it with demo data.
3. Try each of the following scripts (`step-3` through `step-6`) one by one; every file is clearly commented for educational purposes.

> All files in this folder are strictly for study/demo. You are free to customize, combine, or adapt as needed. Comments and expected outputs are in plain English for maximum clarity.