# V1 implementation verification

Verified locally on September 8, 2026.

## Passed

- Strict TypeScript and Vite production build.
- Eleven automated tests covering New York date boundaries, leap-day validation, metadata eligibility, shuffled candidates, fallback content, idempotence, duplicate-object handling, concurrent selectors, the 20-attempt limit, database errors, and public-key validation.
- Live Met v1.1 search: returned 500 candidate IDs. Retrieved and validated object 10065, **Repose**, as public domain with a primary image.
- Chrome desktop at 1440px and mobile at 390px: live Met image loads; artwork preserves its aspect ratio; no horizontal overflow.
- Archive has four columns at 1440px, three at 800px, and two at 390px; entries appear newest first.
- Day and archive hash-route refreshes work on the local Vite server. Previous and next navigate actual supplied dates with a two-day gap. Newest entry has no next link.
- Exactly three observations, official Met link, absent optional fields, missing-image fallback, empty state, request error, successful retry, and invalid-date handling.
- No uncaught browser JavaScript errors.
- Source audit: the service-role environment variable is used only by the privileged script and daily workflow. The frontend has only SELECT queries. Deployment does not receive the service-role key.

## Test boundaries

Initial browser verification intercepted Supabase requests and supplied a temporary test fixture derived from the live Met record. A second dated copy existed only in that browser test to exercise navigation. No sample records or fixtures ship in the application. Subsequent live verification is recorded below.

Concurrent-race tests use an in-memory store. Same-day idempotence was also verified with two successful GitHub Actions runs against the hosted database. Multi-entry navigation was tested with fixtures; production currently has one genuine daily entry.

## Provisioning update

Created Supabase project `ohnqqkffbfdwuetdqgfj` (`one-from-the-met`) in Kenneth Testing Lab on the $0/month plan. Applied the schema as migration `create_daily_objects`. A live catalog query verified RLS enabled, anonymous SELECT allowed, and anonymous INSERT/UPDATE/DELETE privileges denied. Direct Data API verification returned GET 200 and POST/PATCH/DELETE 401. The live database has unique constraints on both display_date and met_object_id.

Created the public GitHub repository at https://github.com/kennethistesting/one-from-the-met.

## Live deployment verified

- Public site: https://kennethistesting.github.io/one-from-the-met/
- Deployment run 34308379952 completed successfully, including tests and production build.
- Public build variables and both daily-job secrets are configured in GitHub. The service-role key was entered directly by the owner and is not stored locally or in repository files.
- Daily run 34308841634 inserted Met object 310542, **Whistling vessel**, for September 8, 2026 (New York date), with public-domain status and exactly three observations.
- Daily run 34308910338 succeeded and logged: “An entry already exists for 2026-09-08; leaving it unchanged.” The database retained exactly one row with the same ID, object ID, date, and creation timestamp.
- The live homepage displays the selected object. Its original Met image loaded at 3078 × 4000 pixels. The archive and permanent day URL work, including direct refreshes on GitHub Pages.
- The workflow schedule is 10:00 UTC daily (06:00 EDT / 05:00 EST); daily inserts do not rebuild the frontend.

No external setup remains. Multi-entry production navigation will become available naturally after another daily selection; it has already passed the fixture-based browser checks.
