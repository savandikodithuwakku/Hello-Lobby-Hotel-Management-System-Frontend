# HelloLobby Frontend

React + TypeScript + Vite frontend for the HelloLobby hotel management system.
Styling is Tailwind CSS v4; there is no hand-written stylesheet beyond the
theme file.

## Scripts

```bash
npm run dev
npm run build      # typechecks, then bundles
npm run typecheck
npm run preview
npm run lint
```

## API Configuration

Set `VITE_API_URL` if backend is not on default URL:

```bash
VITE_API_URL=http://localhost:5000/api/v1
```

## Structure

- `src/app`: application shell and router
- `src/features/auth`: auth pages, guards, context and API calls
- `src/features/dashboard`: protected dashboard page
- `src/features/users`: user management - list, create and detail screens
- `src/features/rooms`: room types, rooms and the guest-facing catalogue
- `src/features/reservations`: availability, bookings, the front desk and payments
- `src/features/errors`: 403 / 404 pages
- `src/shared/api`: HTTP client with automatic token refresh, the query-string
  builder every service uses, and the API types
- `src/shared/hooks`: the four things every screen does - filters in the URL
  (`useUrlFilters`), loading data (`useApiData`), writing to the API
  (`useAsyncAction`) and creating a record (`useCreateForm`)
- `src/shared/components`: the application shell, pagination, confirmations and
  the labelled filter fields (`form/`)
- `src/shared/constants` / `src/shared/types`: values and shapes with no better
  home, such as the list page size and the `<select>` option type
- `src/shared/ui`: the Tailwind class recipes, the page layout recipes and the
  money, date and plural formatting
- `src/index.css`: the only stylesheet - imports Tailwind and declares the
  design tokens as a Tailwind theme

A feature folder owns everything it needs, so it can be moved or reused as a
unit; only genuinely shared code lives in `src/shared`. The rule for promoting
something into `shared` is that a second feature needed the same thing - a
filter bar, a paged list, a currency format - rather than that it looked
reusable.

## Styling

Visual decisions live in the markup as Tailwind utility classes. Two rules keep
that from turning into noise:

- Design tokens are declared once in the `@theme` block of `src/index.css`.
  A `--color-*` entry becomes `bg-*` / `text-*` / `border-*`, and a `--font-*`
  entry becomes `font-*`, so components never hardcode a hex value.
- Recipes that appear on dozens of elements (buttons, inputs, cards, status
  pills) are exported as class strings from `src/shared/ui/styles.ts`. They are
  complete literal class lists, never assembled at runtime, because Tailwind
  only ships classes it can find as literals in the source.

The look is deliberately flat: solid fills, square corners, no gradients.

## Notes

- Auth uses access tokens in memory and refresh tokens via HTTP-only cookies.
- Protected screens are gated by a route guard that performs silent refresh on startup.
- `useAuth()` returns a possibly-signed-out user; screens that only render
  behind `ProtectedRoute` use `useAuthUser()`, which narrows it to a real user.
