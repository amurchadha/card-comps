# Card Comps - Claude Work Log

## Credentials & Config
- **Supabase URL:** https://ghdqbnjsfhjgyqlktfud.supabase.co
- **DB Password:** In `.env.local` as `SUPABASE_DB_PASSWORD`
- **DB Host:** db.ghdqbnjsfhjgyqlktfud.supabase.co:5432

## Completed Work

### 2026-01-18
- [x] ROI Engine schema migration (004_roi_engine.sql) - APPLIED
- [x] Grading presets table populated (PSA/BGS/SGC/CGC fees)
- [x] Grade Calculator UI at `/labs/grade-calc`
- [x] API routes: `/api/grading-presets`, `/api/grade-comps`
- [x] Rainbow Tracker fixes (query by player+set, strip "Checklist" from names)
- [x] Fixed year duplication in rainbow search (regex for year pattern)
- [x] Inventory UI updated with ROI tracking:
  - Status tabs (Raw, Submitted, In Grading, Graded, Listed, Sold)
  - Grading costs section (fee, supplies, shipping)
  - Sale tracking (price, platform, fees, dates)
  - Profit/ROI display on sold cards
  - Total profit in stats

### 2026-01-19
- [x] Rainbow Tracker: Use actual print_run from database (not hardcoded)
- [x] Rainbow Tracker: Sort parallels by rarity (lowest print_run first)
- [x] Rainbow Tracker: Fix Sign In button (redirect to /sign-in)
- [x] PSG Chrome set data: 8 parallels per player with correct print runs

## Pending Work
- [ ] (none currently)

## Migration Status
| Migration | Status |
|-----------|--------|
| 001_initial | Applied |
| 002_pricing | Applied |
| 003_goals | Applied |
| 004_roi_engine | Applied (all parts) |

## Notes
- Cloudflare Pages auto-deploys on push to main
- Run migrations with: `SUPABASE_DB_PASSWORD=xxx node scripts/run-roi-migration.js`
