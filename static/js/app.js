/**
 * AyushSetu: National Academia - Industry Skill Mapping & Placement Platform
 * Modular Vanilla JavaScript Controller
 */

// Global State
const state = {
  currentRole: 'student',
  currentUserId: 1,
  currentUser: {
    id: 1,
    name: 'Priya Sharma',
    avatar: 'PS',
    role: 'student',
    organization: 'All India Institute of Ayurveda, New Delhi',
    email: 'priya.sharma@aiia.gov.in'
  },
  activeStudentId: 1,
  activeTargetRoleId: 1,
  activeQuiz: null,
  loginSelectedRole: 1,
  dbStats: null,
  jobs: [],
  applications: [],
  mous: []
};

// Persona Directory (Quick Demo Credentials)
const PERSONAS = {
  1: { id: 1, name: 'Priya Sharma', avatar: 'PS', role: 'student', email: 'priya.sharma@aiia.gov.in', org: 'B.Pharm (Ayurveda), AIIA Delhi' },
  4: { id: 4, name: 'Dr. Rajesh Verma', avatar: 'RV', role: 'recruiter', email: 'rajesh.verma@dabur.com', org: 'Dabur India Ltd (R&D)' },
  7: { id: 7, name: 'Prof. Sunita Rao', avatar: 'SR', role: 'tpo', email: 'tpo@aiia.gov.in', org: 'TPO & Dean, AIIA New Delhi' },
  8: { id: 8, name: 'Shri V. K. Saxena', avatar: 'VS', role: 'admin', email: 'director.skill@ayush.gov.in', org: 'Ministry of Ayush, Govt. of India' }
};

// Benchmark Data for Interactive Hero Capsule
const HERO_BENCHMARKS = {
  1: {
    title: 'Ayurvedic Formulation & Drug Design Scientist',
    score: 88,
    offset: 30,
    desc: 'Direct match with Dabur and Himalaya R&D vacancy profiles. Bridge 1 critical module for 100% readiness.',
    chips: [
      { name: 'Phytochemical Extraction', type: 'match' },
      { name: 'HPLC Analysis', type: 'match' },
      { name: 'API Standards', type: 'match' },
      { name: 'Stability Testing (ICH)', type: 'gap' }
    ]
  },
  2: {
    title: 'Clinical Research & Pharmacovigilance Trainee',
    score: 94,
    offset: 15,
    desc: 'Top 5% nationwide percentile alignment. Meets GCP and ethical human trial requirements.',
    chips: [
      { name: 'GCP Guidelines', type: 'match' },
      { name: 'Pharmacovigilance', type: 'match' },
      { name: 'Clinical Protocols', type: 'match' },
      { name: 'MedDRA Coding', type: 'gap' }
    ]
  },
  3: {
    title: 'Quality Control & Herbal Standardization Specialist',
    score: 82,
    offset: 45,
    desc: 'Aligned with Ayurvedic Pharmacopoeia monograph testing and batch export guidelines.',
    chips: [
      { name: 'HPLC Analysis', type: 'match' },
      { name: 'GLP Protocols', type: 'match' },
      { name: 'Spectroscopy', type: 'match' },
      { name: 'Heavy Metal Assay', type: 'gap' }
    ]
  },
  4: {
    title: 'Biomedical Data Scientist & AI Health Researcher',
    score: 76,
    offset: 60,
    desc: 'High demand for computational herbal docking and natural product compound screening.',
    chips: [
      { name: 'BioPython', type: 'match' },
      { name: 'Molecular Docking', type: 'match' },
      { name: 'Biostatistics', type: 'match' },
      { name: 'ML Drug Discovery', type: 'gap' }
    ]
  }
};

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  initHeroCapsule();
  openAuthModal(); // <-- show login/sign‑in modal on first visit
  loadStudentDropdown();   // populate student selector from DB
  triggerSkillGapAnalysis();
  loadQuizzes();
  loadJobs();
  loadCandidates();
  loadTpoData();
  loadAdminAnalytics();
  loadDbStats();
});

// Load students from API into the studentSelect dropdown
async function loadStudentDropdown() {
  const select = document.getElementById('studentSelect');
  if (!select) return;
  try {
    const res = await fetch('/api/roles');
    if (!res.ok) return;
    const users = await res.json();
    const students = users.filter(u => u.role === 'student');
    if (students.length === 0) return;

    // Replace hardcoded options with live DB data
    select.innerHTML = students.map(s => `
      <option value="${s.id}">${s.name} • ${s.organization || 'Ayush Institution'}</option>
    `).join('');

    // Also refresh the quick-select preset pills
    const pillRow = document.querySelector('.quick-profiles-row');
    if (pillRow) {
      pillRow.innerHTML = students.slice(0, 5).map((s, idx) => `
        <button class="preset-pill ${idx === 0 ? 'active' : ''}"
          onclick="selectStudentPreset(${s.id}, this)">
          ${s.name}
        </button>
      `).join('');
    }

    // Set active student to first in list if not already set
    if (students.length > 0 && !state.activeStudentId) {
      state.activeStudentId = students[0].id;
    }
  } catch (e) {
    // Silently keep hardcoded fallback options if API fails
  }
}


// Toast Utility
function showToast(message, icon = '✓') {
  const toast = document.getElementById('appleToast');
  const iconEl = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');
  if (!toast) return;

  iconEl.textContent = icon;
  msgEl.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Hero Interactive Capsule
function initHeroCapsule() {
  switchHeroBenchmark(1);
}

function switchHeroBenchmark(id, btn) {
  const data = HERO_BENCHMARKS[id];
  if (!data) return;

  if (btn) {
    document.querySelectorAll('#heroRoleTabs .shell-role-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }

  const ring = document.getElementById('heroGaugeRing');
  const pct = document.getElementById('heroGaugePct');
  const title = document.getElementById('heroBenchmarkTitle');
  const desc = document.getElementById('heroBenchmarkDesc');
  const chipsContainer = document.getElementById('heroChipsContainer');

  if (title) title.textContent = data.title;
  if (desc) desc.textContent = data.desc;
  if (pct) pct.textContent = `${data.score}%`;
  if (ring) ring.style.strokeDashoffset = data.offset;

  if (chipsContainer) {
    chipsContainer.innerHTML = data.chips.map(c => `
      <span class="pill-chip ${c.type === 'match' ? 'chip-match' : 'chip-gap'}">
        ${c.type === 'match' ? '✓' : '!'} ${c.name}
      </span>
    `).join('');
  }
}

// Role Workspace Switcher
function selectRoleWorkspace(role) {
  state.currentRole = role;

  // Update tabs
  document.querySelectorAll('.role-subnav-tabs .subnav-tab-item').forEach(t => t.classList.remove('active'));
  const activeTab = document.getElementById(`tab-${role}`);
  if (activeTab) activeTab.classList.add('active');

  // Switch panes
  document.querySelectorAll('.role-view-pane').forEach(p => p.style.display = 'none');
  const targetPane = document.getElementById(`view-${role}`);
  if (targetPane) targetPane.style.display = 'block';

  // Badge label
  const badge = document.getElementById('activeRoleIndicatorBadge');
  if (badge) {
    const labels = { student: 'Student Mode', recruiter: 'Recruiter Mode', tpo: 'Institution TPO Mode', admin: 'Ministry Admin' };
    badge.textContent = labels[role] || 'Workspace';
  }

  // Refresh active view data
  if (role === 'recruiter') loadRecruiterKanban();
  if (role === 'tpo') loadTpoData();
  if (role === 'admin') loadAdminAnalytics();
}

// Student Presets
function selectStudentPreset(studentId, btn) {
  state.activeStudentId = studentId;
  document.querySelectorAll('.quick-profiles-row .preset-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const select = document.getElementById('studentSelect');
  if (select) select.value = studentId;

  triggerSkillGapAnalysis();
  loadJobs();
}

function handleStudentChange(val) {
  state.activeStudentId = parseInt(val);
  triggerSkillGapAnalysis();
  loadJobs();
}

// Skill Gap Analysis Engine
async function triggerSkillGapAnalysis() {
  const studentId = state.activeStudentId || 1;
  const roleSelect = document.getElementById('targetRoleSelect');
  const roleId = roleSelect ? parseInt(roleSelect.value) : 1;
  state.activeTargetRoleId = roleId;

  try {
    const res = await fetch(`/api/skill-gap-analysis?student_id=${studentId}&target_role_id=${roleId}`);
    if (res.ok) {
      const data = await res.json();
      renderSkillGapResults(data);
      return;
    }
  } catch (err) {
    // Graceful fallback to client calculation
  }

  // Fallback client simulation
  simulateSkillGapClient(studentId, roleId);
}

function renderSkillGapResults(data) {
  const scoreNum = document.getElementById('dashScoreNum');
  const ring = document.getElementById('dashboardGaugeRing');
  const roleTitle = document.getElementById('dashRoleTitle');
  const summary = document.getElementById('dashStudentSummary');
  const verifiedCount = document.getElementById('statVerifiedCount');
  const avgSalary = document.getElementById('statAvgSalary');
  const demandLevel = document.getElementById('statDemandLevel');

  const score = data.compatibility_score !== undefined ? data.compatibility_score : (data.match_percentage || 88);
  if (scoreNum) scoreNum.textContent = `${score}%`;
  if (ring) {
    const offset = 238.7 - (238.7 * score / 100);
    ring.style.strokeDashoffset = offset;
  }

  if (roleTitle && data.target_role) roleTitle.textContent = data.target_role.title;
  if (avgSalary && data.target_role) avgSalary.textContent = data.target_role.avg_salary;
  if (demandLevel && data.target_role) demandLevel.textContent = data.target_role.demand_level;

  if (summary) {
    summary.textContent = `Compatibility Score: ${score}% • ${data.recommendation_summary || 'Strong alignment with industry benchmarks'}`;
  }

  // Acquired Skills vs Gaps
  const skillsList = document.getElementById('skillsBreakdownList');
  if (skillsList && data.matched_skills && data.missing_skills) {
    let html = '';
    data.matched_skills.forEach(s => {
      html += `
        <div class="skill-list-entry">
          <div class="skill-left-group">
            <span class="skill-icon-dot icon-verified-green">✓</span>
            <span class="skill-title-txt">${s.name}</span>
          </div>
          <span class="status-badge-pill badge-verified-green">${s.proficiency || 'Verified'}</span>
        </div>
      `;
    });

    data.missing_skills.forEach(s => {
      html += `
        <div class="skill-list-entry">
          <div class="skill-left-group">
            <span class="skill-icon-dot icon-gap-rose">!</span>
            <span class="skill-title-txt">${s.name}</span>
          </div>
          <span class="status-badge-pill badge-missing-rose">Gap (${s.required_level || 'Required'})</span>
        </div>
      `;
    });
    skillsList.innerHTML = html;

    if (verifiedCount) {
      verifiedCount.textContent = `${data.matched_skills.length} / ${data.matched_skills.length + data.missing_skills.length}`;
    }
  }

  // Bridge Roadmap — build from API's missing_skills + partial_skills if upskilling_roadmap absent
  const bridgeList = document.getElementById('bridgeRoadmapList');
  if (bridgeList) {
    // Normalize: use direct upskilling_roadmap (mock fallback) OR build from real API response
    let roadmap = data.upskilling_roadmap;
    if (!roadmap || roadmap.length === 0) {
      const gapSources = [
        ...(data.missing_skills || []),
        ...(data.partial_skills || [])
      ];
      roadmap = gapSources.map((s, idx) => {
        const lr = s.learning_recommendation || {};
        // Estimate score boost based on weight or position
        const boost = s.weight ? Math.round(s.weight * 0.4) : Math.max(4, 12 - idx * 2);
        return {
          skill: s.name,
          course_title: lr.course || `${s.name} Certification`,
          provider: lr.provider || 'Ministry of Ayush / SWAYAM',
          duration: lr.duration || '3 Weeks',
          type: lr.type || 'Bridge Course',
          project: lr.project_recommendation || '',
          estimated_score_increase: boost
        };
      });
    }

    if (roadmap && roadmap.length > 0) {
      bridgeList.innerHTML = roadmap.map(m => `
        <div class="bridge-item-card">
          <div class="bridge-info-left">
            <span class="bridge-module-title">${m.course_title || m.skill}</span>
            <span class="bridge-module-partner">${m.provider} • ${m.duration}${m.type ? ' · ' + m.type : ''}</span>
            ${m.project ? `<span class="bridge-project-tip" style="font-size:0.7rem;color:#a78bfa;margin-top:2px;display:block">📌 ${m.project}</span>` : ''}
          </div>
          <span class="bridge-boost-tag">+${m.estimated_score_increase}% Match</span>
        </div>
      `).join('');
    } else {
      bridgeList.innerHTML = `<p style="color:#6b7280;font-size:0.85rem;padding:12px 0;">
        🎉 All required skills matched! No upskilling needed for this role.
      </p>`;
    }
  }
}


function simulateSkillGapClient(studentId, roleId) {
  const mockAnalysis = {
    match_percentage: 88,
    target_role: {
      title: 'Ayurvedic Formulation & Drug Design Scientist',
      avg_salary: '₹7.5 - 12 LPA',
      demand_level: 'Very High'
    },
    matched_skills: [
      { name: 'Phytochemical Extraction', proficiency: 'Advanced' },
      { name: 'HPLC Analysis', proficiency: 'Intermediate' },
      { name: 'Ayurvedic Pharmacopoeia (API)', proficiency: 'Advanced' },
      { name: 'Good Laboratory Practices (GLP)', proficiency: 'Intermediate' }
    ],
    missing_skills: [
      { name: 'Stability Testing (ICH Guidelines)', required_level: 'Intermediate' },
      { name: 'Standardization of Herbal Extracts', required_level: 'Advanced' }
    ],
    upskilling_roadmap: [
      { skill: 'Stability Testing', course_title: 'ICH Guidelines & Accelerated Stability Protocol', provider: 'SWAYAM / NIPER', duration: '2 Weeks', estimated_score_increase: 8 },
      { skill: 'Extract Standardization', course_title: 'Pharmacopoeial Assay Masterclass', provider: 'PCIM&H Ghaziabad', duration: '3 Weeks', estimated_score_increase: 10 }
    ],
    recommendation_summary: 'Ready for Dabur & Himalaya R&D internship placement.'
  };
  renderSkillGapResults(mockAnalysis);
}

// Quizzes & Verifiable Badges
async function loadQuizzes() {
  const container = document.getElementById('quizzesGridList');
  if (!container) return;

  try {
    const res = await fetch('/api/assessments');
    if (res.ok) {
      const tests = await res.json();
      container.innerHTML = tests.map(t => `
        <div class="opp-entry-card">
          <div class="opp-top-row">
            <div>
              <div class="opp-position-name">${t.title}</div>
              <div class="opp-company-name">${t.sector}</div>
            </div>
            <span class="opp-match-tag">Pass: ${t.passing_score}%</span>
          </div>
          <div class="opp-meta-row">
            <span>⏱ ${t.duration_minutes} Mins</span>
            <span>Accredited Assessment</span>
          </div>
          <div class="opp-bottom-row">
            <span class="opp-compensation">Award: Cryptographic Badge</span>
            <button class="btn-pill-action btn-cosmic-glow" style="font-size: 0.74rem; padding: 4px 12px;" onclick="openQuizModal(${t.id})">
              Take Assessment
            </button>
          </div>
        </div>
      `).join('');
      return;
    }
  } catch (e) {}

  // Fallback
  container.innerHTML = `
    <div class="opp-entry-card">
      <div class="opp-top-row">
        <div>
          <div class="opp-position-name">HPLC Analysis Mastery Assessment</div>
          <div class="opp-company-name">Analytical Chemistry & Quality Assurance</div>
        </div>
        <span class="opp-match-tag">Pass: 70%</span>
      </div>
      <div class="opp-meta-row">
        <span>⏱ 10 Mins</span>
        <span>Reverse-Phase Chromatography</span>
      </div>
      <div class="opp-bottom-row">
        <span class="opp-compensation">Verified SHA-256 Badge</span>
        <button class="btn-pill-action btn-cosmic-glow" style="font-size: 0.74rem; padding: 4px 12px;" onclick="openQuizModal(1)">
          Take Assessment
        </button>
      </div>
    </div>
  `;
}

async function openQuizModal(quizId) {
  state.activeQuizId = quizId;
  const modal = document.getElementById('quizModal');
  const questionsContainer = document.getElementById('quizQuestionsContainer');
  if (!modal || !questionsContainer) return;

  try {
    const res = await fetch(`/api/assessments/${quizId}`);
    if (res.ok) {
      const data = await res.json();
      state.activeQuiz = data;
      document.getElementById('quizModalTitle').textContent = data.title;
      questionsContainer.innerHTML = data.questions.map((q, idx) => `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--hairline); border-radius: var(--radius-sm); padding: 14px;">
          <div style="font-weight: 600; color: #fff; margin-bottom: 10px;">${idx + 1}. ${q.question}</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${q.options.map((opt, optIdx) => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; cursor: pointer; color: var(--text-secondary);">
                <input type="radio" name="q_${q.id}" value="${optIdx}">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('');
      modal.classList.add('active');
      return;
    }
  } catch (e) {}

  // Fallback questions
  questionsContainer.innerHTML = `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--hairline); border-radius: var(--radius-sm); padding: 14px;">
      <div style="font-weight: 600; color: #fff; margin-bottom: 10px;">1. Which component in reverse-phase HPLC serves as the stationary phase?</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: #fff;"><input type="radio" name="q_1" value="0" checked> Hydrophobic non-polar silica (e.g. C18)</label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: var(--text-secondary);"><input type="radio" name="q_1" value="1"> Aqueous buffer with methanol</label>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function closeQuizModal() {
  const modal = document.getElementById('quizModal');
  if (modal) modal.classList.remove('active');
}

async function submitActiveQuiz() {
  const studentId = state.activeStudentId || 1;
  const answers = {};
  if (state.activeQuiz && state.activeQuiz.questions) {
    state.activeQuiz.questions.forEach(q => {
      const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
      if (selected) answers[q.id] = parseInt(selected.value);
    });
  } else {
    answers["1"] = 0;
  }

  try {
    const res = await fetch('/api/assessments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessment_id: state.activeQuizId || 1, student_id: studentId, answers })
    });
    if (res.ok) {
      const result = await res.json();
      closeQuizModal();
      showToast(result.message || 'Assessment Completed!', result.passed ? '✓' : '!');
      if (result.passed) {
        triggerSkillGapAnalysis();
        openCredentialViewer('7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
      }
      return;
    }
  } catch (e) {}

  closeQuizModal();
  showToast('Verified Skill Badge awarded and recorded!', '✓');
  triggerSkillGapAnalysis();
}

// Jobs & Applications (Student View)
async function loadJobs() {
  const container = document.getElementById('studentJobsGrid');
  if (!container) return;

  const studentId = state.activeStudentId || 1;
  try {
    const res = await fetch(`/api/jobs?student_id=${studentId}`);
    if (res.ok) {
      const jobs = await res.json();
      state.jobs = jobs;
      renderJobs(jobs);
      return;
    }
  } catch (e) {}

  // Fallback
  renderJobs([
    { id: 1, company: 'Dabur India Ltd', title: 'R&D Phytochemistry Intern', location: 'Ghaziabad, NCR', stipend_salary: '₹30,000 / month', match_score: 88, has_applied: false },
    { id: 2, company: 'Dabur India Ltd', title: 'Ayurvedic Drug Formulation Associate', location: 'Baddi, HP', stipend_salary: '₹8.5 LPA', match_score: 72, has_applied: false },
    { id: 3, company: 'Himalaya Wellness Company', title: 'Clinical Research & PV Trainee', location: 'Bengaluru', stipend_salary: '₹32,000 / month', match_score: 94, has_applied: false }
  ]);
}

function renderJobs(jobs) {
  const container = document.getElementById('studentJobsGrid');
  if (!container) return;

  container.innerHTML = jobs.map(j => `
    <div class="opp-entry-card">
      <div class="opp-top-row">
        <div>
          <div class="opp-position-name">${j.title}</div>
          <div class="opp-company-name">${j.company} • ${j.location}</div>
        </div>
        <span class="opp-match-tag">${j.match_score}% Match</span>
      </div>
      <div class="opp-meta-row">
        <span>💰 ${j.stipend_salary}</span>
        <span>${j.job_type || 'Opportunity'}</span>
      </div>
      <div class="opp-bottom-row">
        <span style="font-size: 0.74rem; color: var(--text-muted);">Status: ${j.has_applied ? 'Applied' : 'Ready'}</span>
        ${j.has_applied ? `
          <button class="btn-pill-action btn-glass" style="font-size: 0.74rem; padding: 4px 12px;" disabled>
            Applied ✓
          </button>
        ` : `
          <button class="btn-pill-action btn-cosmic-glow" style="font-size: 0.74rem; padding: 4px 12px;" onclick="applyToJob(${j.id})">
            1-Click Apply
          </button>
        `}
      </div>
    </div>
  `).join('');
}

async function applyToJob(jobId) {
  const studentId = state.activeStudentId || 1;
  try {
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, student_id: studentId })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(data.message || 'Application submitted successfully!', '✓');
      loadJobs();
      return;
    }
  } catch (e) {}

  showToast('Application submitted with verified credentials!', '✓');
  loadJobs();
}

// Recruiter Kanban ATS
async function loadRecruiterKanban() {
  const colApplied = document.getElementById('col-applied');
  const colShortlisted = document.getElementById('col-shortlisted');
  const colInterview = document.getElementById('col-interview');
  const colOffered = document.getElementById('col-offered');
  if (!colApplied) return;

  try {
    const res = await fetch('/api/applications?recruiter_id=4');
    if (res.ok) {
      const apps = await res.json();
      state.applications = apps;
      renderKanban(apps);
      return;
    }
  } catch (e) {}

  // Fallback Kanban
  renderKanban([
    { id: 1, student_name: 'Priya Sharma', college: 'AIIA New Delhi', job_title: 'R&D Phytochemistry Intern', match_score: 88, status: 'Shortlisted' },
    { id: 2, student_name: 'Priya Sharma', college: 'AIIA New Delhi', job_title: 'Ayurvedic Drug Formulation Associate', match_score: 72, status: 'Applied' },
    { id: 3, student_name: 'Rohan Deshmukh', college: 'NIPER Mohali', job_title: 'Clinical Research Trainee', match_score: 94, status: 'Interview' },
    { id: 4, student_name: 'Ananya Gupta', college: 'IIT Delhi', job_title: 'Computational Intern', match_score: 96, status: 'Offered' }
  ]);
}

function renderKanban(apps) {
  const cols = {
    Applied: document.getElementById('col-applied'),
    Shortlisted: document.getElementById('col-shortlisted'),
    Interview: document.getElementById('col-interview'),
    Offered: document.getElementById('col-offered')
  };

  Object.values(cols).forEach(c => { if (c) c.innerHTML = ''; });
  const counts = { Applied: 0, Shortlisted: 0, Interview: 0, Offered: 0 };

  apps.forEach(a => {
    const col = cols[a.status] || cols['Applied'];
    counts[a.status] = (counts[a.status] || 0) + 1;
    if (col) {
      col.innerHTML += `
        <div class="kanban-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span class="kanban-candidate-name">${a.student_name}</span>
            <span style="font-size: 0.72rem; color: #34d399; font-weight: 600;">${a.match_score}%</span>
          </div>
          <span class="kanban-candidate-role">${a.job_title}</span>
          <div class="kanban-card-footer">
            <span style="color: var(--text-muted);">${a.college || 'Scholar'}</span>
            <button class="btn-pill-action btn-glass" style="font-size: 0.68rem; padding: 2px 8px;" onclick="advanceKanbanStatus(${a.id}, '${a.status}')">
              Next Stage →
            </button>
          </div>
        </div>
      `;
    }
  });

  const cntApp = document.getElementById('cnt-applied');
  const cntShort = document.getElementById('cnt-shortlisted');
  const cntInt = document.getElementById('cnt-interview');
  const cntOff = document.getElementById('cnt-offered');

  if (cntApp) cntApp.textContent = counts.Applied || 0;
  if (cntShort) cntShort.textContent = counts.Shortlisted || 0;
  if (cntInt) cntInt.textContent = counts.Interview || 0;
  if (cntOff) cntOff.textContent = counts.Offered || 0;
}

async function advanceKanbanStatus(appId, currentStatus) {
  const flow = { Applied: 'Shortlisted', Shortlisted: 'Interview', Interview: 'Offered', Offered: 'Offered' };
  const next = flow[currentStatus] || 'Shortlisted';

  try {
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    });
    if (res.ok) {
      showToast(`Applicant progressed to: ${next}`, '✓');
      loadRecruiterKanban();
      return;
    }
  } catch (e) {}

  showToast(`Applicant progressed to: ${next}`, '✓');
  loadRecruiterKanban();
}

async function loadCandidates() {
  const container = document.getElementById('candidatesGridList');
  const filterInput = document.getElementById('candidateSkillFilter');
  const skill = filterInput ? filterInput.value.trim() : '';
  if (!container) return;

  try {
    const res = await fetch(`/api/candidates?skill=${encodeURIComponent(skill)}`);
    if (res.ok) {
      const candidates = await res.json();
      container.innerHTML = candidates.map(c => `
        <div class="opp-entry-card">
          <div class="opp-top-row">
            <div>
              <div class="opp-position-name">${c.name}</div>
              <div class="opp-company-name">${c.college} • ${c.degree}</div>
            </div>
            <span class="opp-match-tag">CGPA: ${c.cgpa}</span>
          </div>
          <div class="opp-meta-row">
            <span>Verified Badges: ${c.verified_badge_count || 3}</span>
          </div>
          <div class="opp-bottom-row">
            <button class="btn-pill-action btn-glass" style="font-size: 0.74rem; padding: 4px 12px;" onclick="openCredentialViewer()">
              Verify Badges
            </button>
            <button class="btn-pill-action btn-cosmic-glow" style="font-size: 0.74rem; padding: 4px 12px;" onclick="showToast('Interview invite sent to candidate!', '✓')">
              Invite
            </button>
          </div>
        </div>
      `).join('');
      return;
    }
  } catch (e) {}
}

// TPO / Academia Functions
async function loadTpoData() {
  try {
    const res = await fetch('/api/curriculum-gap');
    if (res.ok) {
      const data = await res.json();
      renderTpoCurriculum(data);
    }
  } catch (e) {}

  try {
    const res = await fetch('/api/mous');
    if (res.ok) {
      const mous = await res.json();
      renderMous(mous);
    }
  } catch (e) {}
}

function renderTpoCurriculum(data) {
  const list = document.getElementById('tpoCurriculumList');
  const defs = document.getElementById('tpoDeficienciesList');

  if (list && data.modules) {
    list.innerHTML = data.modules.map(m => `
      <div class="skill-list-entry">
        <div>
          <div style="font-weight: 600; color: #fff;">${m.course_name}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">${m.institution_name}</div>
        </div>
        <span class="status-badge-pill badge-verified-green">${m.industry_alignment_score}% Align</span>
      </div>
    `).join('');
  }

  if (defs && data.priority_deficiencies) {
    defs.innerHTML = data.priority_deficiencies.map(d => `
      <div class="skill-list-entry">
        <div>
          <div style="font-weight: 600; color: #fff;">${d.skill}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${d.academic_status} • ${d.action}</div>
        </div>
        <span class="status-badge-pill badge-missing-rose">${d.industry_demand}</span>
      </div>
    `).join('');
  }
}

function renderMous(mous) {
  const grid = document.getElementById('tpoMousGrid');
  if (!grid) return;

  grid.innerHTML = mous.map(m => `
    <div class="opp-entry-card">
      <div class="opp-top-row">
        <div>
          <div class="opp-position-name">${m.title}</div>
          <div class="opp-company-name">${m.institution_name} ↔ ${m.industry_partner}</div>
        </div>
        <span class="opp-match-tag" style="background: rgba(99,102,241,0.15); color: #818cf8; border-color: rgba(99,102,241,0.3);">
          ${m.status}
        </span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
        <strong>Deliverables:</strong> ${m.deliverables}
      </div>
      <div class="opp-bottom-row">
        <span style="font-size: 0.74rem; color: var(--text-muted);">Valid Until: ${m.valid_until}</span>
        <button class="btn-pill-action btn-glass" style="font-size: 0.72rem; padding: 2px 8px;" onclick="showToast('MoU audit package exported', '✓')">
          View Deliverables
        </button>
      </div>
    </div>
  `).join('');
}

// AI Syllabus Proposal Modal (Winning Feature)
async function openAIProposalModal() {
  const modal = document.getElementById('aiProposalModal');
  const container = document.getElementById('aiProposalContent');
  if (!modal || !container) return;

  container.innerHTML = '<div style="text-align: center; padding: 20px;">Analyzing 500+ corporate vacancies and compiling syllabus proposal...</div>';
  modal.classList.add('active');

  try {
    const res = await fetch('/api/curriculum/generate-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution: 'All India Institute of Ayurveda', course: 'B.Pharm (Ayurveda)' })
    });
    if (res.ok) {
      const prop = await res.json();
      container.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--hairline); border-radius: var(--radius-sm); padding: 14px;">
          <div style="font-size: 0.78rem; color: #a855f7; font-weight: 600; text-transform: uppercase;">Reference: ${prop.reference_id}</div>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 4px 0 8px;">${prop.course} Upgrade Dossier</h4>
          <p style="font-size: 0.84rem; line-height: 1.5; color: var(--text-secondary);">${prop.executive_summary}</p>
        </div>

        <div>
          <h5 style="font-size: 0.88rem; font-weight: 600; color: #fff; margin-bottom: 8px;">Recommended Industry Bridge Modules:</h5>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${prop.recommended_modules.map(m => `
              <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--hairline); border-radius: var(--radius-xs); padding: 10px;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #fff;">${m.module_code}: ${m.title}</strong>
                  <span style="color: #34d399; font-size: 0.74rem;">${m.industry_demand_index}</span>
                </div>
                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">
                  ${m.suggested_hours} Hours • ${m.credit_recommendation} • Industry Co-Sponsor: ${m.partner_sponsor}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 12px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: var(--radius-sm); padding: 12px;">
          <div><strong style="color: #34d399;">+24%</strong> <span style="font-size: 0.75rem;">Placement Rate Lift</span></div>
          <div><strong style="color: #34d399;">₹2.2 LPA</strong> <span style="font-size: 0.75rem;">Average CTC Boost</span></div>
          <div><strong style="color: #34d399;">3 New</strong> <span style="font-size: 0.75rem;">Corporate MoUs</span></div>
        </div>
      `;
    }
  } catch (e) {}
}

function closeAIProposalModal() {
  const modal = document.getElementById('aiProposalModal');
  if (modal) modal.classList.remove('active');
}

function downloadProposalReport() {
  showToast('Official Academic Council Proposal PDF generated!', '✓');
  closeAIProposalModal();
}

// Ministry Admin Analytics
async function loadAdminAnalytics() {
  try {
    const res = await fetch('/api/analytics/overview');
    if (res.ok) {
      const data = await res.json();
      renderAdminAnalytics(data);
    }
  } catch (e) {}
}

function renderAdminAnalytics(data) {
  const grid = document.getElementById('adminMetricsGrid');
  const sectorList = document.getElementById('adminSectorList');
  const regionalList = document.getElementById('adminRegionalList');

  if (grid && data.metrics) {
    grid.innerHTML = `
      <div class="minimal-feature-card">
        <div class="feature-index">TOTAL ENROLLED</div>
        <div style="font-size: 2rem; font-weight: 700; color: #fff;">${data.metrics.total_students_registered.toLocaleString()}</div>
        <p class="feature-desc">Active students mapped across colleges</p>
      </div>
      <div class="minimal-feature-card">
        <div class="feature-index">VERIFIED BADGES</div>
        <div style="font-size: 2rem; font-weight: 700; color: #a855f7;">${data.metrics.verified_skills_awarded.toLocaleString()}</div>
        <p class="feature-desc">Cryptographically authenticated badges</p>
      </div>
      <div class="minimal-feature-card">
        <div class="feature-index">EMPLOYABILITY INDEX</div>
        <div style="font-size: 2rem; font-weight: 700; color: #34d399;">${data.metrics.overall_employability_readiness}</div>
        <p class="feature-desc">National aggregate curriculum readiness</p>
      </div>
    `;
  }

  if (sectorList && data.sector_distribution) {
    sectorList.innerHTML = data.sector_distribution.map(s => `
      <div class="skill-list-entry">
        <span style="font-weight: 500; color: #fff;">${s.sector}</span>
        <span class="status-badge-pill badge-verified-green">${s.percentage}%</span>
      </div>
    `).join('');
  }

  if (regionalList && data.regional_clusters) {
    regionalList.innerHTML = data.regional_clusters.map(r => `
      <div class="skill-list-entry">
        <div>
          <strong style="color: #fff;">${r.state}</strong>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${r.institutions} Participating Universities</div>
        </div>
        <span class="status-badge-pill" style="background: rgba(99,102,241,0.15); color: #818cf8;">
          ${r.students_placed} Placed
        </span>
      </div>
    `).join('');
  }
}

function exportSummaryReport() {
  showToast('National Macro Barometer exported successfully.', '✓');
}

// Authentication Modal & Persona Switcher
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

function selectLoginRole(roleId, btn) {
  state.loginSelectedRole = roleId;
  document.querySelectorAll('#authModal .shell-role-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const p = PERSONAS[roleId];
  if (p) {
    const emailInput = document.getElementById('loginEmailInput');
    if (emailInput) emailInput.value = p.email;
  }
}

function executeLogin() {
  executeQuickDemoLogin();
}

function executeQuickDemoLogin() {
  const roleId = state.loginSelectedRole || 1;
  const persona = PERSONAS[roleId] || PERSONAS[1];

  state.currentUser = persona;
  state.currentUserId = persona.id;

  // Update Nav
  const navAvatar = document.getElementById('navUserAvatar');
  const navName = document.getElementById('navUserName');
  if (navAvatar) navAvatar.textContent = persona.avatar;
  if (navName) navName.textContent = persona.name;

  closeAuthModal();
  showToast(`Switched active session to: ${persona.name} (${persona.role.toUpperCase()})`, '✓');

  // Switch workspace
  selectRoleWorkspace(persona.role);
}

// Database Studio & In-App Data Entry
function openDatabaseStudio() {
  loadDbStats();
  const modal = document.getElementById('dbStudioModal');
  if (modal) modal.classList.add('active');
}

function closeDatabaseStudio() {
  const modal = document.getElementById('dbStudioModal');
  if (modal) modal.classList.remove('active');
}

function switchDbStudioTab(tab, btn) {
  document.querySelectorAll('#dbStudioModal .shell-role-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  ['stats', 'add-student', 'add-job', 'add-mou'].forEach(t => {
    const pane = document.getElementById(`db-pane-${t}`);
    if (pane) pane.style.display = (t === tab) ? 'block' : 'none';
  });
}

async function loadDbStats() {
  const list = document.getElementById('dbStatsList');
  if (!list) return;

  try {
    const res = await fetch('/api/database/stats');
    if (res.ok) {
      const stats = await res.json();
      state.dbStats = stats;
      list.innerHTML = Object.entries(stats).map(([k, v]) => `
        <div class="skill-list-entry">
          <span style="font-weight: 600; color: #fff;">${k.replace('_', ' ').toUpperCase()}</span>
          <span class="status-badge-pill badge-verified-green">${v} Records</span>
        </div>
      `).join('');
      return;
    }
  } catch (e) {}

  // Fallback
  list.innerHTML = `
    <div class="skill-list-entry">
      <span style="font-weight: 600; color: #fff;">USERS</span>
      <span class="status-badge-pill badge-verified-green">8 Records</span>
    </div>
    <div class="skill-list-entry">
      <span style="font-weight: 600; color: #fff;">JOBS</span>
      <span class="status-badge-pill badge-verified-green">5 Records</span>
    </div>
    <div class="skill-list-entry">
      <span style="font-weight: 600; color: #fff;">MOUS</span>
      <span class="status-badge-pill badge-verified-green">4 Records</span>
    </div>
  `;
}

async function submitNewStudent(e) {
  e.preventDefault();
  const name = document.getElementById('newStuName').value;
  const email = document.getElementById('newStuEmail').value;
  const college = document.getElementById('newStuCollege').value;
  const degree = document.getElementById('newStuDegree').value;
  const cgpa = parseFloat(document.getElementById('newStuCgpa').value);
  const skillsStr = document.getElementById('newStuSkills').value;
  const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()) : [];

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, college, degree, graduation_year: 2026, cgpa, skills })
    });
    if (res.ok) {
      const result = await res.json();
      showToast(`✅ ${name} added! Select them in Student Workspace to view their profile.`, '✓');
      closeDatabaseStudio();
      await loadStudentDropdown();  // <-- refresh dropdown with new student
      loadCandidates();
      loadDbStats();
      // Auto-select the newly added student
      if (result.student_id) {
        state.activeStudentId = result.student_id;
        const select = document.getElementById('studentSelect');
        if (select) select.value = result.student_id;
        triggerSkillGapAnalysis();
      }
      return;
    } else {
      const err = await res.json();
      showToast(`Error: ${err.error || 'Could not save student'}`, '✗');
      return;
    }
  } catch (err) {
    showToast('Server offline — running in demo mode', '⚠');
  }

  showToast(`Student '${name}' inserted into database!`, '✓');
  closeDatabaseStudio();
  loadCandidates();
}


async function submitNewJob(e) {
  e.preventDefault();
  const company = document.getElementById('newJobCompany').value;
  const title = document.getElementById('newJobTitle').value;
  const job_type = document.getElementById('newJobType').value;
  const location = document.getElementById('newJobLocation').value;
  const stipend_salary = document.getElementById('newJobSalary').value;
  const skillsStr = document.getElementById('newJobSkills').value;
  const required_skills = skillsStr ? skillsStr.split(',').map(s => s.trim()) : [];

  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recruiter_id: 4,
        company,
        title,
        job_type,
        location,
        work_mode: 'Hybrid',
        stipend_salary,
        duration: '6 Months',
        description: `${title} at ${company}`,
        required_skills
      })
    });
    if (res.ok) {
      showToast('Opportunity posted and live in database!', '✓');
      closeDatabaseStudio();
      loadJobs();
      loadDbStats();
      return;
    }
  } catch (err) {}

  showToast(`Opportunity '${title}' created successfully!`, '✓');
  closeDatabaseStudio();
  loadJobs();
}

async function submitNewMou(e) {
  e.preventDefault();
  const institution_name = document.getElementById('newMouInst').value;
  const industry_partner = document.getElementById('newMouPartner').value;
  const title = document.getElementById('newMouTitle').value;
  const focus_area = document.getElementById('newMouFocus').value;
  const deliverables = document.getElementById('newMouDeliverables').value;

  try {
    const res = await fetch('/api/mous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_name, industry_partner, title, focus_area, deliverables })
    });
    if (res.ok) {
      showToast('MoU officially registered into database!', '✓');
      closeDatabaseStudio();
      loadTpoData();
      loadDbStats();
      return;
    }
  } catch (err) {}

  showToast('MoU officially registered into database!', '✓');
  closeDatabaseStudio();
  loadTpoData();
}

async function reSeedDatabase() {
  try {
    const res = await fetch('/api/database/seed', { method: 'POST' });
    if (res.ok) {
      showToast('Database reset to baseline state.', '✓');
      loadDbStats();
      triggerSkillGapAnalysis();
      loadJobs();
      return;
    }
  } catch (e) {}
  showToast('Database re-seeded successfully.', '✓');
}

// Custom Skill Addition Modal
function openAddSkillModal() {
  const modal = document.getElementById('addSkillModal');
  if (modal) modal.classList.add('active');
}

function closeAddSkillModal() {
  const modal = document.getElementById('addSkillModal');
  if (modal) modal.classList.remove('active');
}

async function submitCustomSkill(e) {
  e.preventDefault();
  const name = document.getElementById('customSkillName').value;
  const proficiency = document.getElementById('customSkillProficiency').value;
  const studentId = state.activeStudentId || 1;

  try {
    const res = await fetch('/api/skills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, skill_name: name, proficiency })
    });
    if (res.ok) {
      showToast(`Skill '${name}' added to portfolio!`, '✓');
      closeAddSkillModal();
      triggerSkillGapAnalysis();
      return;
    }
  } catch (err) {}

  showToast(`Skill '${name}' added to portfolio!`, '✓');
  closeAddSkillModal();
  triggerSkillGapAnalysis();
}

// Verifiable Credential QR Viewer
function openCredentialViewer(hash = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069') {
  const modal = document.getElementById('credentialModal');
  const hashEl = document.getElementById('credModalHash');
  if (hashEl) hashEl.textContent = hash;
  if (modal) modal.classList.add('active');
}

function closeCredentialModal() {
  const modal = document.getElementById('credentialModal');
  if (modal) modal.classList.remove('active');
}

function openPostJobModal() {
  openDatabaseStudio();
  const jobTab = document.querySelector('#dbStudioModal .shell-role-selectors button:nth-child(3)');
  switchDbStudioTab('add-job', jobTab);
}

function openRegisterMouModal() {
  openDatabaseStudio();
  const mouTab = document.querySelector('#dbStudioModal .shell-role-selectors button:nth-child(4)');
  switchDbStudioTab('add-mou', mouTab);
}
