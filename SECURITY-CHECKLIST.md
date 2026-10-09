# Production security checklist

Before public launch:

- [ ] Use `https://desk.crow.lk` and HTTPS for the API.
- [ ] Set Laravel CORS to exact trusted frontend origins only.
- [ ] Confirm API endpoints enforce authorization per employee / manager on every request.
- [ ] Confirm `APP_DEBUG=false` in production and rotate any exposed credentials.
- [ ] Use a supported Node.js LTS version and update dependencies regularly.
- [ ] Run `npm audit` and resolve high/critical advisories with tested dependency updates.
- [ ] Run `npm run build` in the target environment.
- [ ] Validate CSP headers and hosting compatibility using browser devtools.
- [ ] Configure HTTPS/HSTS at the hosting/reverse-proxy layer.
- [ ] Consider a BFF + HttpOnly Secure SameSite cookies to reduce JavaScript token exposure.
- [ ] Set rate limiting on login and review Laravel auth/token expiry/revocation policy.
- [ ] Test cross-employee access, manager approvals, task ownership, and leave cancellation using separate test accounts.
- [ ] Avoid real employee data in screenshots, logs, sample files, or development fixtures.
