# ImmoNIQ

Smarte Immobilien-Verwaltung für private Vermieter — Mietkonto, Mahnwesen,
Anlage V und Marktdaten an einem Ort. Schluss mit Excel und Schuhkarton.

> Aktueller Launch-Fokus: **Landlord** (private Vermieter). Weitere Personas
> (Eigentümer, Steuerberater, Mieter, Wohnungssuchende) sind im Code
> vorhanden, aber im Marketing aktuell nur sekundär sichtbar.

## Tech-Stack

- **Frontend**: Vite 5 + React 18 + TypeScript + Tailwind + shadcn/ui
- **Backend**: Lovable Cloud (Supabase: Postgres, Auth, Storage, Edge Functions)
- **Payments**: Stripe (Embedded Checkout, Sandbox + Live getrennt)
- **AI**: Lovable AI Gateway (Gemini / GPT-Modelle, kein eigener Key nötig)
- **Mail**: Lovable Email-Infra (pgmq-Queue, Auth- und Transaktionsmails)

## Local Development

```bash
# Dependencies
npm install   # oder bun install

# Env-Datei anlegen (siehe .env.example)
cp .env.example .env
# Werte aus dem Lovable-Dashboard → Cloud → Settings einsetzen

# Dev-Server
npm run dev
```

In Lovable selbst läuft das Setup automatisch — die `.env` wird gemanagt
und enthält ausschließlich publishable Keys.

## Environment-Variablen (Frontend)

Alle `VITE_*` Variablen sind publishable und landen im Bundle:

| Variable | Zweck |
|---|---|
| `VITE_SUPABASE_URL` | Supabase-Projekt-URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon-Key (RLS-geschützt) |
| `VITE_SUPABASE_PROJECT_ID` | Projekt-Ref |

## Edge-Function-Secrets (Lovable Cloud → Secrets)

Diese müssen im Lovable Cloud Secrets-Manager gesetzt sein, **nicht in
`.env`**:

| Secret | Zweck |
|---|---|
| `STRIPE_SANDBOX_API_KEY` | Stripe Sandbox |
| `STRIPE_LIVE_API_KEY` | Stripe Live (vor Go-Live) |
| `PAYMENTS_SANDBOX_WEBHOOK_SECRET` | Stripe-Webhook-Signatur Sandbox |
| `PAYMENTS_LIVE_WEBHOOK_SECRET` | Stripe-Webhook-Signatur Live |
| `LOVABLE_API_KEY` | KI-Calls über Lovable AI Gateway |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-seitige DB-Zugriffe (auto-managed) |

## Wichtige Routes

- `/` — Landing
- `/auth` — Login/Signup
- `/app/*` — Authenticated App (Properties, Tenants, Payments, Dunning, …)
- `/advisor/:token` — Read-only Steuerberater-Zugang
- `/portal/:token` — Mieter-Self-Service
- `/markt/*` — Listings (Marktplatz)

## Edge Functions

Liegen in `supabase/functions/<name>/index.ts`. Werden bei jedem Push
automatisch deployed.

- `payments-webhook` — Stripe-Webhooks (Subscriptions, Anzeigen-Käufe)
- `create-checkout`, `create-portal-session`, `create-ad-checkout`
- `ai-copilot`, `ai-dunning-letter`, `ai-listing-from-photos`,
  `ai-score-application`
- `send-transactional-email`, `process-email-queue`, `auth-email-hook`,
  `handle-email-unsubscribe`, `handle-email-suppression`

## Deployment

Wird über Lovable verwaltet. Custom Domain: `immoniq.xyz`.

## Sicherheit / DSGVO

- 33 Tabellen, alle mit RLS aktiv (84 Policies)
- Storage: `receipts`, `vault`, `documents` privat — `listing-photos` public-read
- Advisor- und Tenant-Token mit Expiry, Revoke und Access-Logging
- DSGVO-Pages: Impressum, Datenschutz, AGB, Widerruf als echte Routes
- Cookie-Banner aktiv

## Tests

```bash
npm test    # vitest
```
