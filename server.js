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
  try {
    const admin = readData('admin.json');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: `[Portfolio] New message from ${name}: ${subject || 'No subject'}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f0f1a;color:#fff;padding:30px;border-radius:12px"><h2 style="color:#00d4ff">New Portfolio Message</h2><p><strong>From:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject || 'N/A'}</p><p><strong>Message:</strong></p><div style="background:#1a1a2e;padding:15px;border-radius:8px;margin-top:10px">${message}</div></div>`
    });
  } catch (e) { console.log('Email error:', e.message); }

  res.json({ success: true, message: 'Message sent successfully!' });
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
    const sha256 = crypto.createHash('sha256').update(password).digest('hex');
    const valid = (sha256 === admin.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username });
  } catch(e) { res.status(500).json({ error: 'Login failed' }); }
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
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
    admin.passwordHash = await bcrypt.hash(password, 10);
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
