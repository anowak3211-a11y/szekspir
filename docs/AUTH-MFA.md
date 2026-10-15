# Personal accounts and mandatory MFA

Owner requested mandatory two-factor authentication for Szekspir on 15 October 2026. Meta Business security is outside this change.

## Architecture

- Supabase Auth supplies individual email/password accounts, TOTP enrollment, challenge verification and token refresh. A fresh server-only client uses the existing publishable project key, not the service role key. There is no public application signup endpoint.
- `AUTH_ALLOWED_EMAILS` is an exact, case-insensitive server allowlist, checked after provider identity validation. Confirmed email is required. Invite an allowed owner using the authenticated `/api/auth/invite` interface; the service role key is used only for that administrator operation. Do not commit the owner's email, passwords, invitation links, QR secrets or recovery codes.
- Provider tokens are encrypted with AES-256-GCM and a domain-separated key derived from the existing private encryption key. Browser receives only a host-only Secure/HttpOnly/SameSite=Lax cookie. No tokens in localStorage/IndexedDB or client status payloads. Invitation fragments are erased before exchange. First-factor/invitation cookies expire after 15 minutes; successful MFA creates an absolute eight-hour session. Refresh cannot extend that deadline.
- `proxy.ts` (Next 16 Node runtime) validates the exact access token through Auth, user allowlist, matching subject, token expiry, AAL2 and a still-verified factor before serving pages/APIs. A password-only session never accesses application data. Existing route guards receive their legacy credential internally only after MFA succeeds. Unknown modes and missing production configuration fail closed. Unsafe browser requests require an exact Origin match.
- Standalone Python endpoints independently reject Basic Auth in MFA mode. Only the separate server machine credential can call those routes. Existing cron scope and private queue triggers remain intact; the cron token cannot access arbitrary app APIs. No VMake migration.
- Auth attempts use encrypted shared CAS storage, with per-source, per-email and per-user limits. A provider/store outage denies access. Supabase's own Auth limits also apply. Lockout windows may temporarily inconvenience the owner during malicious attempts.
- Logout clears the browser cookie and asks Auth to revoke this refresh session. Already issued access JWTs can remain valid until provider expiry; do not promise immediate revocation of a stolen token. Incident recovery includes provider session revocation and rotating the application encryption key when justified.

## Safe rollout

1. Keep `APP_AUTH_MODE` unset (existing Basic login) while deploying the tested login page and setting `AUTH_ALLOWED_EMAILS` privately. Configure Supabase Auth redirect allowlist to include exactly the production `/login` URL; retain unrelated valid existing URLs.
2. Open `/login` using the current authenticated browser, enter the allowed owner email and send the invitation. Confirm provider acceptance. An existing Auth account should sign in with its existing credentials instead of being overwritten.
3. The owner opens the invitation, sets their own password, scans their own authenticator QR and submits their own code. Agents must not read/copy those credentials or enroll their own device. Confirm `/api/auth` reports `complete:true` without reading cookies or QR data.
4. Set `APP_AUTH_MODE=supabase-mfa` in Production and redeploy the committed release. Confirm the owner can open application pages, and unauthenticated/legacy-password-only API access fails. Confirm cron and Python auth tests. Do not silently activate the gate before the owner completes enrollment.
5. Recovery-code support is experimental in this SDK and depends on the deployed Auth server. The UI only offers codes returned by the provider and explicitly reports when unsupported. Store returned codes privately; they are shown once. Without native codes, keep a secure authenticator backup and use identity-verified administrator recovery. There is no password-only factor reset endpoint or hidden bypass.

Adding a team member requires a separate explicit allowlist change and invitation. All currently allowed users have the existing workspace powers; fine-grained workspace roles are not part of this change. Protect the allowlisted inbox, Supabase, Vercel and GitHub accounts separately.

## Verification

`node tests/auth-mfa.cjs`, `python3 tests/auth-python.py`, `node tests/vmake-status-transport.cjs`, `npm run test:meta`, `npm test`, `npm run typecheck`, production build. Offline tests use real gateway/route/cookie/SDK code with fixture-only Auth HTTP and private storage boundaries. They cannot prove live email delivery or the owner's authenticator enrollment.

References: [Supabase TOTP](https://supabase.com/docs/guides/auth/auth-mfa/totp), [MFA assurance](https://supabase.com/docs/guides/auth/auth-mfa), bundled Next 16 proxy/authentication guides.
