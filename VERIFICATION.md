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

Browser verification intercepted Supabase requests and supplied a temporary test fixture derived from the live Met record. A second dated copy existed only in that browser test to exercise navigation. **No sample records or fixtures ship in the application, and no daily object has been inserted into a hosted database.**

Concurrency/idempotence tests use an in-memory store. The SQL schema includes RLS, explicit read-only public grants, and unique constraints, but their enforcement has not yet been verified against a hosted Supabase instance.

## Provisioning update

Created Supabase project `ohnqqkffbfdwuetdqgfj` (`one-from-the-met`) in Kenneth Testing Lab on the $0/month plan. Applied the schema as migration `create_daily_objects`. A live catalog query verified RLS enabled, anonymous SELECT allowed, and anonymous INSERT/UPDATE/DELETE privileges denied. The table is currently empty.

Created the public GitHub repository at https://github.com/kennethistesting/one-from-the-met.

## Pending external setup

- Verify unique constraints and real anonymous Data API behavior.
- Configure public build variables, privileged Action secrets, and GitHub Pages as documented in README.
- Run daily selection twice against the real database, then deploy and test the public Pages URL.

The local implementation is ready for this setup. The live-site acceptance criteria are not yet complete.
