require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'hassaan_super_secret_jwt_key_2024';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'cv' ? './assets' : './assets';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'cv') cb(null, 'hassaan_cv.pdf');
    else cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Data helpers
const readData = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file), 'utf8'));
const writeData = (file, data) => fs.writeFileSync(path.join(__dirname, 'data', file), JSON.stringify(data, null, 2));

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ======================== PUBLIC ROUTES ========================

// Get portfolio data (no-cache so admin changes always reflect)
app.get('/api/portfolio', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.json(readData('portfolio.json'));
});

// Send contact message
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  
  // Save message
  const messages = readData('messages.json');
  const newMsg = { id: Date.now(), name, email, subject, message, date: new Date().toISOString(), read: false };
  messages.push(newMsg);
  writeData('messages.json', messages);

  // Send email
  let emailSent = false;
  let emailError = null;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipped: EMAIL_USER or EMAIL_PASS not set in .env');
  } else {
    try {
      const admin = readData('admin.json');
      const toEmail = admin.email || process.env.EMAIL_USER;
      console.log(`[Email] Sending to: ${toEmail}`);
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false }
      });
      await transporter.verify();
      await transporter.sendMail({
        from: `"Hassaan Portfolio" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        replyTo: email,
        subject: `[Portfolio] ${name}: ${subject || 'New message'}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:30px;background:#0f0f1a;color:#e2e8f0;border-radius:12px;border:1px solid #1e293b">
            <h2 style="color:#00d4ff;margin-bottom:20px">&#128231; New Contact Message</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#94a3b8;width:80px">From:</td><td style="padding:8px 0"><strong>${name}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8">Email:</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#00d4ff">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8">Subject:</td><td style="padding:8px 0">${subject || '(No subject)'}</td></tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#1a1a2e;border-radius:8px;line-height:1.7">${message}</div>
            <p style="margin-top:20px;color:#94a3b8;font-size:13px">Received: ${new Date().toLocaleString()}</p>
            <a href="mailto:${email}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#00d4ff;color:#000;border-radius:8px;text-decoration:none;font-weight:700">Reply to ${name}</a>
          </div>`
      });
      emailSent = true;
      console.log(`[Email] ✅ Sent successfully to ${toEmail}`);
    } catch (e) {
      emailError = e.message;
      console.error('[Email] ❌ Failed:', e.message);
    }
  }

  res.json({ success: true, message: 'Message received!', emailSent, emailError });
});

// Download CV
app.get('/api/cv', (req, res) => {
  const cvPath = path.join(__dirname, 'assets', 'hassaan_cv.pdf');
  if (fs.existsSync(cvPath)) res.download(cvPath, 'Hassaan_CV.pdf');
  else res.status(404).json({ error: 'CV not found. Please upload from admin panel.' });
});

// ======================== ADMIN ROUTES ========================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = readData('admin.json');
    if (admin.username !== username) return res.status(401).json({ error: 'Invalid credentials' });
    // Support both SHA256 hash and bcrypt (for backward compat)
    const sha256 = crypto.createHash('sha256').update(password).digest('hex');
    let valid = false;
    if (admin.passwordHash && admin.passwordHash.startsWith('$2')) {
      // bcrypt hash — try bcrypt if available, else reject
      try { const bcrypt = require('bcryptjs'); valid = await bcrypt.compare(password, admin.passwordHash); }
      catch { valid = false; }
    } else {
      // SHA256 hash
      valid = (sha256 === admin.passwordHash);
    }
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Login failed' }); }
});

// Get messages
app.get('/api/admin/messages', auth, (req, res) => {
  res.json(readData('messages.json'));
});

// Mark message as read
app.patch('/api/admin/messages/:id/read', auth, (req, res) => {
  const messages = readData('messages.json');
  const msg = messages.find(m => m.id === parseInt(req.params.id));
  if (msg) msg.read = true;
  writeData('messages.json', messages);
  res.json({ success: true });
});

// Delete message
app.delete('/api/admin/messages/:id', auth, (req, res) => {
  let messages = readData('messages.json');
  messages = messages.filter(m => m.id !== parseInt(req.params.id));
  writeData('messages.json', messages);
  res.json({ success: true });
});

// Update portfolio data
app.put('/api/admin/portfolio', auth, (req, res) => {
  writeData('portfolio.json', req.body);
  res.json({ success: true });
});

// Add project
app.post('/api/admin/projects', auth, (req, res) => {
  const portfolio = readData('portfolio.json');
  const newProject = { ...req.body, id: Date.now() };
  portfolio.projects.push(newProject);
  writeData('portfolio.json', portfolio);
  res.json({ success: true, project: newProject });
});

// Update project
app.put('/api/admin/projects/:id', auth, (req, res) => {
  const portfolio = readData('portfolio.json');
  const idx = portfolio.projects.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  portfolio.projects[idx] = { ...portfolio.projects[idx], ...req.body };
  writeData('portfolio.json', portfolio);
  res.json({ success: true });
});

// Delete project
app.delete('/api/admin/projects/:id', auth, (req, res) => {
  const portfolio = readData('portfolio.json');
  portfolio.projects = portfolio.projects.filter(p => p.id !== parseInt(req.params.id));
  writeData('portfolio.json', portfolio);
  res.json({ success: true });
});

// Upload CV
app.post('/api/admin/upload-cv', auth, upload.single('cv'), (req, res) => {
  res.json({ success: true, message: 'CV uploaded successfully!' });
});

// Upload Project Image
const projectImgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './assets/projects'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const projectUpload = multer({ storage: projectImgStorage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/admin/upload-project-image', auth, projectUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `/assets/projects/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

app.use('/assets/projects', express.static(path.join(__dirname, 'assets/projects')));

// Update admin settings (email, password)
app.put('/api/admin/settings', auth, async (req, res) => {
  const { email, password, currentPassword } = req.body;
  const admin = readData('admin.json');
  if (password) {
    // Verify current password
    const currentSha = crypto.createHash('sha256').update(currentPassword).digest('hex');
    let valid = false;
    if (admin.passwordHash && admin.passwordHash.startsWith('$2')) {
      try { const bcrypt = require('bcryptjs'); valid = await bcrypt.compare(currentPassword, admin.passwordHash); } catch { valid = false; }
    } else { valid = (currentSha === admin.passwordHash); }
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
    // Save new password as SHA256
    admin.passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  }
  if (email) admin.email = email;
  writeData('admin.json', admin);
  res.json({ success: true });
});

// Update hero/about/contact
app.put('/api/admin/section/:section', auth, (req, res) => {
  const portfolio = readData('portfolio.json');
  portfolio[req.params.section] = req.body;
  writeData('portfolio.json', portfolio);
  res.json({ success: true });
});

// Serve main pages
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`🚀 Hassaan Portfolio running on http://localhost:${PORT}`));
