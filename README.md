# Trip Tinder

Swipe together, travel together. Cornell Tech Product Studio, Team 311.

Spec and clickable mock: `reference/`.

## Run it

```bash
cp .env.example .env.local   # fill in the Supabase values
npm install
npm run dev                  # http://localhost:3000
npm test                     # schema + logic tests (no network needed)
```

## Database

- `supabase/migrations/0001_init.sql`: tables, row-level security, and the functions the app calls.
- `supabase/seed.sql`: generated from `src/data/places.nyc.ts` by `npm run seed:sql`. Edit the TS file, not the SQL.
- To set up a fresh Supabase project, paste the migration and then the seed into the SQL Editor.

## Where things go

- `src/screens/`: one file per screen in the spec (Welcome, TripBasics, Invite, Join, SwipeDeck, ...). Screens take data and callbacks as props and never call the database, so a Figma version can replace one file at a time.
- `src/app/`: routes that load data and render a screen.
- `src/lib/`: matching, planning, and Supabase clients.
- `src/app/globals.css`: design tokens (colors, radii, spacing) as CSS variables.
