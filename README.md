# Secret Santa 2025

A festive Next.js app for Secret Santa gift reveals with admin panel for member management.

## Features

- 🎁 **Secret Santa Reveal** - Users enter their unique code + guess the giver's name to reveal the wishlist
- 🔐 **Admin Panel** - Manage members, add/edit/delete with secure login
- ⏰ **Lockout Protection** - 6-hour lockout after incorrect name guess
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Local JSON files for data storage

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deploying to Render.com

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New > Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `secret-santa-2025`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for persistent disk)

### 3. Add Persistent Disk (Required for data persistence)

1. In your Render service, go to **Disks**
2. Add a new disk:
   - **Name**: `data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB
3. This ensures your JSON files persist across deployments

### 4. Environment Variables (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |

## Admin Access

- **URL**: `/admin`
- **User ID**: `shoghi07`
- **Password**: `shoghisanta`

## Project Structure

```
secret-santa-app/
├── app/
│   ├── page.js              # Main reveal page
│   ├── admin/page.js        # Admin panel
│   └── api/
│       ├── verify/route.js  # Verification API
│       └── admin/           # Admin APIs
├── data/
│   ├── secrets.json         # Member data
│   ├── lockouts.json        # Lockout tracking
│   └── admin.json           # Admin credentials
└── public/                  # Static assets
```

## License

MIT
