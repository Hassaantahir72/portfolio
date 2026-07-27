# 🚀 Hassaan Portfolio

A stunning full-stack developer portfolio with an admin panel.

## ✨ Features

### Public Portfolio
- 🎨 **Advanced Animations** — Particle system, typing animation, floating badges, scroll reveals
- 🖼️ **Hero Section** — Your photo with glowing rings, animated stats counter
- 💼 **Projects Showcase** — Filterable project cards with hover effects
- 🛠️ **Skills Section** — Animated progress bars with tab switching (Frontend/Backend/DevOps)
- 📬 **Contact Form** — Sends messages directly to your email
- 📄 **CV Download** — Visitors can download your resume
- 🌐 **Responsive Design** — Works perfectly on all devices
- 🖱️ **Custom Cursor** — Interactive cursor with follower effect

### Admin Panel (`/admin`)
- 🔐 **Secure Login** — JWT authentication (you only can access)
- 📊 **Dashboard** — Overview stats and recent messages
- ➕ **Add/Edit/Remove Projects** — Full CRUD
- 🌟 **Add/Remove Skills** — Frontend, Backend, DevOps categories
- ✏️ **Edit Page Content** — Hero, About, Contact sections
- 📁 **Upload CV** — Upload your PDF resume
- 📥 **View Messages** — All contact form submissions
- 🔔 **Email Notifications** — Get emailed when someone contacts you
- ⚙️ **Settings** — Change password, update notification email

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=3000
JWT_SECRET=your_super_secret_key_change_this
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App passwords → Generate

### 3. Start the Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

### 4. Open in Browser
- **Portfolio:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin

## 🔐 Default Admin Credentials

```
Username: hassaan
Password: admin123
```

> ⚠️ **IMPORTANT:** Change your password immediately from the Admin Panel → Settings!

## 📁 File Structure
```
hassaan-portfolio/
├── index.html          # Main portfolio page
├── server.js           # Backend Express server
├── package.json        # Dependencies
├── .env.example        # Environment template
├── README.md
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # Frontend JavaScript
├── admin/
│   ├── index.html      # Admin dashboard
│   └── login.html      # Admin login page
├── assets/
│   ├── hassaan.jpg     # Your photo
│   └── hassaan_cv.pdf  # Your CV (upload from admin)
└── data/
    ├── portfolio.json  # Portfolio content
    ├── messages.json   # Contact messages
    └── admin.json      # Admin credentials
```

## 🚀 Deployment

### Deploy on VPS / Server
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name hassaan-portfolio
pm2 save
pm2 startup
```

### Deploy on Railway / Render / Heroku
1. Push to GitHub
2. Connect your repo
3. Set environment variables
4. Deploy!

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Go to: Account → Security → App Passwords
3. Create app password for "Mail"
4. Use that 16-character password in `.env` as `EMAIL_PASS`

---
Built with ❤️ by Hassaan
