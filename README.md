# Crow Desk — Employee Portal

A standalone Next.js employee portal styled to complement the Crow.lk / Crow Business backend. It connects to the existing Laravel API; it does not replace the backend or create a second user database.

## Included

- Sign in / sign out using the Laravel Sanctum personal access token API
- Overview dashboard with attendance, recent tasks, leave activity, and quick actions
- Attendance history, date filters, check-in / check-out, CSV export
- Leave types, leave request submission, cancellation, and status tracking
- Employee tasks with status updates and a progress calculation based on the exact displayed task set
- Leave approvals using the backend's authorization rules
- Employee profile summary
- Responsive desktop/mobile navigation
- Defensive API response normalization for raw arrays and Laravel's nested paginator response shape

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- The Laravel backend in `crow-business-main` deployed and reachable
- Backend routes under `/api/v1`, Sanctum enabled, and CORS configured for the portal origin

## Run locally (PowerShell)

```powershell
Expand-Archive .\crow-desk-employee-portal.zip -DestinationPath .
cd .\crow-desk-employee-portal

Copy-Item .env.example .env.local
# Edit .env.local if your API URL differs.

npm install
npm run dev
```

Open `http://localhost:3000`.

## Build for production

```powershell
npm ci
npm run build
npm run start
```

For production hosting, configure:

```env
NEXT_PUBLIC_API_URL=https://crowdesk.crowdemo.com/api/v1
NEXT_PUBLIC_APP_NAME=Crow Desk
```

Deploy the built Next.js application to a Node.js-capable host. This is a Next.js server application, not a static export. Keep the API URL HTTPS.

## Backend CORS

Allow only the exact deployed frontend origins in `config/cors.php`, for example:

```php
'allowed_origins' => [
    'https://desk.crow.lk',
    'http://localhost:3000',
],
```

Remove temporary Hostinger preview domains when they are no longer used. Clear Laravel's config cache after changing the configuration.

## Security design and limitations

- The bearer token is kept in `sessionStorage`, not `localStorage`, so it is cleared when the browser session ends. This is safer for persistence but **not immune to XSS**; a compromised same-origin script could still access a session token.
- The frontend does not store passwords, log tokens, or include credentials in URLs.
- API requests use HTTPS by default, omit cookies, disable caching, and reject redirects.
- Login redirects are restricted to local relative paths.
- User-visible API errors are bounded and no raw server HTML is rendered.
- Response data is treated as untrusted; text is rendered as React text, not HTML.
- Security headers and a restrictive CSP are configured. Review the CSP against your hosting setup and run a production security scan before launch.
- The current backend API authenticates using bearer tokens. For a higher-security production deployment, prefer a backend-for-frontend with `HttpOnly`, `Secure`, `SameSite` cookies and CSRF protection, rather than exposing a bearer token to browser JavaScript.
- The frontend cannot guarantee that the whole system has zero vulnerabilities. Security also depends on backend authorization, dependency updates, TLS, hosting, CORS, secrets management, and testing.

## Backend API contract used

- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `GET /dashboard`
- `GET /attendance`, `POST /attendance/check-in`, `POST /attendance/check-out`
- `GET /leave-types`, `GET /leaves`, `POST /leaves`, `POST /leaves/{id}/cancel`
- `GET /leave-approvals`, `PATCH /leave-approvals/{id}`
- `GET /tasks`, `PATCH /tasks/{id}`

The portal intentionally does not expose task assignment UI because the current backend `POST /tasks` contract requires a manager-selected employee and applies role checks. The backend's current `/tasks` GET endpoint returns the signed-in employee's tasks.

## Notes

- Dashboard task progress is computed from the same loaded list as the displayed task count, not a separate hard-coded total.
- Leave and attendance responses are normalized to support Laravel's `{data: {data: [...]}}` paginator envelope as well as `{data: [...]}` and direct arrays.
- Approvals visibility in the UI is a convenience only; the API must remain the authority for authorization.
