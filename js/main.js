// ===== PORTFOLIO MAIN JS =====

const API = '';

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});
function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();
document.querySelectorAll('a, button, .project-card, .skill-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    cursor.style.opacity = '0.5';
    follower.style.transform = 'translate(-50%,-50%) scale(1.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.opacity = '1';
    follower.style.transform = 'translate(-50%,-50%) scale(1)';
  });
});

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseParticleX = -1000, mouseParticleY = -1000;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', e => {
  mouseParticleX = e.clientX;
  mouseParticleY = e.clientY;
});

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = Math.random() * 2 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '0,212,255' : '124,58,237';
  }
  update() {
    const dx = mouseParticleX - this.x;
    const dy = mouseParticleY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      this.vx -= (dx / dist) * force * 0.3;
      this.vy -= (dy / dist) * force * 0.3;
    }
    this.vx *= 0.99; this.vy *= 0.99;
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,212,255,${0.06 * (1 - dist/100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    startCounters();
  }, 2200);
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
});
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY;
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    const bottom = top + sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== TYPING ANIMATION =====
const typingEl = document.getElementById('typingText');
let typingTexts = ['Full-Stack Developer', 'React Expert', 'Node.js Engineer', 'UI/UX Enthusiast', 'API Architect'];
let tIdx = 0, cIdx = 0, isDeleting = false;
function type() {
  const current = typingTexts[tIdx];
  typingEl.textContent = isDeleting ? current.substring(0, cIdx - 1) : current.substring(0, cIdx + 1);
  isDeleting ? cIdx-- : cIdx++;
  if (!isDeleting && cIdx === current.length) { isDeleting = true; setTimeout(type, 2000); return; }
  if (isDeleting && cIdx === 0) { isDeleting = false; tIdx = (tIdx + 1) % typingTexts.length; }
  setTimeout(type, isDeleting ? 50 : 100);
}
type();

// ===== COUNTER ANIMATION =====
function startCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { el.textContent = target; clearInterval(timer); return; }
      el.textContent = Math.floor(current);
    }, 25);
  });
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// ===== SKILLS BAR ANIMATION =====
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 100);
      });
    }
  });
}, { threshold: 0.2 });

// ===== FETCH PORTFOLIO DATA =====
async function loadPortfolio() {
  try {
    const res = await fetch(`${API}/api/portfolio?v=${Date.now()}`);
    const data = await res.json();
    renderPortfolio(data);
  } catch(e) { console.error('Failed to load portfolio data', e); }
}

function renderPortfolio(data) {
  // About
  if (data.about) {
    const bioEl = document.getElementById('aboutBio');
    if (bioEl) bioEl.textContent = data.about.bio;
  }
  // Typing texts
  if (data.hero?.typingTexts) typingTexts = data.hero.typingTexts;
  // Contact
  if (data.contact) {
    const emailEl = document.getElementById('contactEmail');
    if (emailEl) emailEl.textContent = data.contact.email;
    renderSocials(data.contact);
  }
  // Skills
  if (data.skills) renderSkills(data.skills);
  // Projects
  if (data.projects) renderProjects(data.projects);
  // Certificates
  if (data.certificates) renderCertificates(data.certificates);
}

function renderSocials(contact) {
  const container = document.getElementById('socialLinks');
  if (!container) return;
  const socials = [
    { icon: 'fab fa-github', url: contact.github, label: 'GitHub' },
    { icon: 'fab fa-linkedin', url: contact.linkedin, label: 'LinkedIn' },
    { icon: 'fas fa-envelope', url: `mailto:${contact.email}`, label: 'Email' },
  ];
  container.innerHTML = socials
    .filter(s => s.url && s.url !== '#')
    .map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-link" title="${s.label}"><i class="${s.icon}"></i></a>`).join('');

  // Also update the contact cards
  const emailEl = document.getElementById('contactEmail');
  if (emailEl) {
    emailEl.innerHTML = `<a href="mailto:${contact.email}" style="color:var(--accent);text-decoration:none;word-break:break-all">${contact.email}</a>`;
  }
  const githubEl = document.getElementById('contactGithub');
  if (githubEl) {
    githubEl.innerHTML = `<a href="${contact.github}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:none">github.com/Hassaantahir72</a>`;
  }
  const linkedinEl = document.getElementById('contactLinkedin');
  if (linkedinEl) {
    linkedinEl.innerHTML = `<a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:none">linkedin.com/in/muh-hassaan-tahir</a>`;
  }
}

let allSkills = {};
let activeTab = 'frontend';

function renderSkills(skills) {
  allSkills = skills;
  renderSkillTab('frontend');
  document.querySelectorAll('.skill-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSkillTab(tab.dataset.tab);
    });
  });
}

function renderSkillTab(tab) {
  const container = document.getElementById('skillsContent');
  const skills = allSkills[tab] || [];
  container.innerHTML = skills.map(s => `
    <div class="skill-card reveal">
      <div class="skill-header">
        <div class="skill-name"><span class="skill-icon">${s.icon}</span>${s.name}</div>
        <div class="skill-percent">${s.level}%</div>
      </div>
      <div class="skill-bar"><div class="skill-fill" data-width="${s.level}" style="width:0"></div></div>
    </div>
  `).join('');
  // Animate bars immediately
  setTimeout(() => {
    container.querySelectorAll('.skill-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 80);
    });
    container.querySelectorAll('.skill-card').forEach((card, i) => {
      setTimeout(() => { card.classList.add('visible'); }, i * 60);
    });
  }, 100);
}

let allProjects = [];
function renderProjects(projects) {
  allProjects = projects;
  filterProjects('all');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProjects(btn.dataset.filter);
    });
  });
}

const thumbIcons = {
  ecommerce: '🛒', chat: '💬', analytics: '📊', devops: '⚙️', ai: '🤖', social: '📱'
};
const thumbColors = {
  ecommerce: 'linear-gradient(135deg,#1a1a2e,#16213e)',
  chat: 'linear-gradient(135deg,#0d1b2a,#1b262c)',
  analytics: 'linear-gradient(135deg,#1a0533,#2d1b69)',
  devops: 'linear-gradient(135deg,#0f2027,#203a43)',
  ai: 'linear-gradient(135deg,#1a001a,#2d0060)',
  social: 'linear-gradient(135deg,#0a1628,#1a3a5c)'
};

function filterProjects(filter) {
  const grid = document.getElementById('projectsGrid');
  let filtered = allProjects;
  if (filter === 'featured') filtered = allProjects.filter(p => p.featured);
  else if (filter === 'react') filtered = allProjects.filter(p => p.tags?.some(t => t.toLowerCase().includes('react')));
  else if (filter === 'node') filtered = allProjects.filter(p => p.tags?.some(t => t.toLowerCase().includes('node')));
  grid.innerHTML = filtered.map((p, i) => {
    const img = p.image || 'ecommerce';
    const icon = thumbIcons[img] || '💻';
    const bg = thumbColors[img] || 'linear-gradient(135deg,#1a1a2e,#16213e)';
    // If custom uploaded image exists, show it; otherwise show icon
    const thumbHTML = p.customImage
      ? `<img src="${p.customImage}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.innerHTML='<div class=\'project-thumb-icon\'>${icon}</div>'"/>`
      : `<div class="project-thumb-icon">${icon}</div>`;
    const thumbBg = p.customImage ? '#0d0d1f' : bg;
    return `
    <div class="project-card reveal" style="animation-delay:${i*0.1}s">
      <div class="project-thumb" style="background:${thumbBg}">
        ${thumbHTML}
      </div>
      <div class="project-body">
        ${p.featured ? '<div class="project-featured">⭐ Featured</div>' : ''}
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.description}</div>
        <div class="project-tags">${(p.tags||[]).map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
        <div class="project-links">
          <a href="${p.github||'#'}" target="_blank" class="project-link link-github"><i class="fab fa-github"></i> Code</a>
          <a href="${p.live||'#'}" target="_blank" class="project-link link-live"><i class="fas fa-external-link-alt"></i> Live</a>
        </div>
      </div>
    </div>`;
  }).join('');
  setTimeout(() => {
    grid.querySelectorAll('.project-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  }, 50);
}

// ===== CERTIFICATES =====
function renderCertificates(certs) {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;
  if (!certs || !certs.length) {
    grid.innerHTML = '<p style="color:var(--text2);text-align:center;grid-column:1/-1;padding:2rem">No certificates added yet.</p>';
    return;
  }
  grid.innerHTML = certs.map((c, i) => `
    <a href="${c.link || '#'}" target="_blank" rel="noopener noreferrer" class="cert-card reveal" style="animation-delay:${i*0.1}s;text-decoration:none">
      <div class="cert-img-wrap">
        ${c.image
          ? `<img src="${c.image}" alt="${c.name}" class="cert-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
             <div class="cert-img-fallback" style="display:none"><i class="fas fa-certificate"></i></div>`
          : `<div class="cert-img-fallback"><i class="fas fa-certificate"></i></div>`
        }
        <div class="cert-view-overlay"><i class="fas fa-external-link-alt"></i><span>View Certificate</span></div>
      </div>
      <div class="cert-body">
        <div class="cert-name">${c.name}</div>
        <div class="cert-meta">
          <span class="cert-issuer"><i class="fas fa-building"></i> ${c.issuer}</span>
          <span class="cert-date"><i class="fas fa-calendar"></i> ${c.date}</span>
        </div>
        <div class="cert-link-hint"><i class="fas fa-arrow-right"></i> View Certificate</div>
      </div>
    </a>
  `).join('');
  setTimeout(() => {
    grid.querySelectorAll('.cert-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  }, 50);
}

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('sendBtn');
  const status = document.getElementById('formStatus');
  btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
  btn.disabled = true;
  status.className = 'form-status';
  try {
    const res = await fetch(`${API}/api/contact`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('fname').value,
        email: document.getElementById('femail').value,
        subject: document.getElementById('fsubject').value,
        message: document.getElementById('fmessage').value
      })
    });
    const data = await res.json();
    if (data.success) {
      status.className = 'form-status success';
      status.textContent = '✅ Message sent! I\'ll get back to you soon.';
      e.target.reset();
      showToast('Message sent successfully! 🎉', 'success');
    } else throw new Error(data.error);
  } catch(err) {
    status.className = 'form-status error';
    status.textContent = '❌ Failed to send. Please try again.';
    showToast('Failed to send message.', 'error');
  } finally {
    btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
    btn.disabled = false;
  }
});

// ===== CV DOWNLOAD =====
function downloadCV(e) {
  e.preventDefault();
  window.open(`${API}/api/cv`, '_blank');
  showToast('Downloading Resume... 📄', 'success');
}
window.downloadCV = downloadCV;

// ===== TOAST =====
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== SMOOTH SCROLL NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ===== SCROLL REVEAL OBSERVER =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function observeReveal() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

// ===== INIT =====
loadPortfolio().then(() => observeReveal());
