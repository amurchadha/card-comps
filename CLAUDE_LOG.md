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

## Pending Work
- [ ] Update inventory UI for new ROI fields (card_status, grading costs, sale tracking)
- [ ] 130point scraper still running in background

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
