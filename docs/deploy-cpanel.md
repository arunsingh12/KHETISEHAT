# Deploying to cPanel

Kheti Sehat runs on cPanel's **Setup Node.js App** (Phusion Passenger). You
build a self-contained bundle on your own computer and upload it — the
server never runs `npm install` or a build, which shared hosting often
can't do (memory limits).

Requirements: a cPanel plan with **Setup Node.js App** and **Node.js 20.9 or
newer** (pick 22 if offered), and your MongoDB Atlas database.

## 1. Build the bundle (on your computer)

```bash
npm install
npm run build:cpanel
```

This creates `deploy/khetisehat-cpanel.zip` (~90 MB). It contains the app,
its `node_modules`, the Linux database engines, and a `server.js` start
file. It never contains your `.env` — secrets go into cPanel (step 4).

## 2. Create the Node.js app in cPanel

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | 22.x (or 20.x — at least 20.9) |
| Application mode | Production |
| Application root | `khetisehat` (a folder in your home directory) |
| Application URL | your domain, e.g. `khetisehat.in` |
| Application startup file | `server.js` |

Click **Create**, then **Stop App** for now.

## 3. Upload the bundle

cPanel → **File Manager** → open the application root (`khetisehat`):

1. Delete anything cPanel put there (a sample `app.js`, `public/`, etc.).
2. **Upload** `khetisehat-cpanel.zip`.
3. Right-click it → **Extract** into the same folder. You should now see
   `server.js`, `package.json`, `.next/`, `node_modules/`, `public/`, `src/`
   directly in `khetisehat/` (turn on **Show Hidden Files** to see `.next`).
4. Delete the zip.

Do **not** click "Run NPM Install" — the bundle already has everything.

## 4. Environment variables

Back in **Setup Node.js App** → edit the app → **Environment variables** →
add each of these (use the production values from your private env file):

| Name | Value |
|---|---|
| `DATABASE_URL` | MongoDB Atlas URL (with `/khetisehat` database name) |
| `AUTH_SECRET` | long random string (production value) |
| `APP_URL` | `https://your-domain` — no trailing slash |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | live keys |
| `RAZORPAY_WEBHOOK_SECRET` | from step 7 |
| `CRON_SECRET` | long random string, used in step 6 |
| `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`, `TWILIO_FROM_NUMBER` | for SMS — leave all blank to only log SMS |
| `ANTHROPIC_API_KEY` | optional (coordinator AI intake) |

Click **Save**, then **Start App** (or **Restart**). Open your domain.

## 5. Let the server reach MongoDB

MongoDB Atlas → **Network Access** → **Add IP Address** → add your cPanel
server's IP (cPanel home → *General Information* → *Shared IP Address*). If
the site shows a database error, this is usually why.

## 6. Auto-confirm cron job

Jobs the farmer doesn't confirm are auto-confirmed after 72 hours by
`/api/cron/auto-release`. cPanel → **Cron Jobs** → every 15 minutes
(`*/15 * * * *`):

```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain/api/cron/auto-release > /dev/null
```

## 7. Razorpay webhook

Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**:

- URL: `https://your-domain/api/payments/razorpay/webhook`
- Secret: make one up and put the same value in `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`

Restart the app after adding the secret.

## Updating the site later

1. `git pull`, then `npm run build:cpanel`.
2. **Stop App**, upload the new zip to the app root, **Extract** and
   overwrite, delete the zip.
3. **Start App**.

If you changed `prisma/schema.prisma`, also run `npm run db:push` once from
your computer with the production `DATABASE_URL`.

## Troubleshooting

- **Errors / blank page:** check `stderr.log` in the application root.
- **`Prisma … could not locate the Query Engine`:** the server's OpenSSL
  doesn't match the bundled engines (`rhel-openssl-1.0.x/1.1.x/3.0.x`). Add
  the right target to `binaryTargets` in `prisma/schema.prisma` (the error
  names it) and rebuild.
- **Login fails / redirects to localhost:** check `APP_URL` and `AUTH_SECRET`.
- **"Untrusted host" auth errors:** `trustHost: true` is already set in
  `src/lib/auth.ts`; make sure you uploaded a bundle built after that change.
