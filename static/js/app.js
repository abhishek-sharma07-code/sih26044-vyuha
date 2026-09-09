// SIH26044 Academia - Industry Collaboration Platform Application Logic

let activeUserId = 1;
let currentUser = null;
let currentRole = 'student';
let radarChartInstance = null;
let demandBarChartInstance = null;
let sectorDonutChartInstance = null;
let activeQuizData = null;
let quizTimerInterval = null;
let quizTimeRemaining = 600; // 10 minutes
let currentJobFilter = 'all';

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  await switchPersona(activeUserId);
});

// -------------------------------------------------------------
// PERSONA & ROLE SWITCHER
// -------------------------------------------------------------
async function switchPersona(userId) {
  activeUserId = parseInt(userId);
  try {
    const res = await fetch(`/api/user/${activeUserId}`);
    currentUser = await res.json();
    currentRole = currentUser.role;

    // Update Header Pill
    document.getElementById('activeUserAvatar').innerText = currentUser.avatar_initials || 'U';
    document.getElementById('activeUserName').innerText = currentUser.name;
    document.getElementById('activeUserOrg').innerText = currentUser.organization;
    document.getElementById('roleSelect').value = activeUserId;

    // Hide all main portal views
    document.querySelectorAll('.portal-view').forEach(v => v.classList.remove('active'));

    // Rebuild Navigation Tabs and activate corresponding view
    if (currentRole === 'student') {
      document.getElementById('view-student').classList.add('active');
      document.getElementById('studentHeroName').innerText = currentUser.name.split(' ')[0];
      buildNavTabs([
        { id: 'gap-tab', label: '📊 Skill Gap & Roadmap', onclick: "switchStudentTab('gap-tab')" },
        { id: 'jobs-tab', label: '💼 Internships & Placements', onclick: "switchStudentTab('jobs-tab')" },
        { id: 'quizzes-tab', label: '🏅 Domain Quizzes & Badges', onclick: "switchStudentTab('quizzes-tab')" },
        { id: 'apps-tab', label: '📑 My Applications', onclick: "switchStudentTab('apps-tab')" },
        { id: 'projects-tab', label: '🔬 Joint R&D Capstones', onclick: "switchStudentTab('projects-tab')" }
      ]);
      await initStudentView();
    } else if (currentRole === 'recruiter') {
      document.getElementById('view-recruiter').classList.add('active');
      document.getElementById('recruiterHeroCompany').innerText = currentUser.organization;
      buildNavTabs([
        { id: 'kanban-tab', label: '📋 ATS Kanban Board', onclick: "switchRecruiterTab('kanban-tab')" },
        { id: 'talent-tab', label: '🔎 Verified Candidate Search', onclick: "switchRecruiterTab('talent-tab')" },
        { id: 'postings-tab', label: '📁 My Openings', onclick: "switchRecruiterTab('postings-tab')" }
      ]);
      await initRecruiterView();
    } else if (currentRole === 'tpo') {
      document.getElementById('view-tpo').classList.add('active');
      document.getElementById('tpoHeroInstitute').innerText = currentUser.organization;
      buildNavTabs([
        { id: 'curriculum-tab', label: '📊 Curriculum Alignment Matrix', onclick: "switchTpoTab('curriculum-tab')" },
        { id: 'endorse-tab', label: '🧑‍🏫 Student Endorsements', onclick: "switchTpoTab('endorse-tab')" },
        { id: 'mous-tab', label: '📜 Industry MoUs', onclick: "switchTpoTab('mous-tab')" }
      ]);
      await initTpoView();
    } else if (currentRole === 'admin') {
      document.getElementById('view-admin').classList.add('active');
      buildNavTabs([
        { id: 'admin-macro-tab', label: '🌐 National Skill Mission Overview', onclick: "switchAdminTab('admin-macro-tab')" }
      ]);
      await initAdminView();
    }
  } catch (err) {
    console.error("Error switching persona:", err);
    showToast("Error switching role persona", "error");
  }
}

function buildNavTabs(tabs) {
  const container = document.getElementById('navTabsContainer');
  container.innerHTML = '';
  tabs.forEach((tab, idx) => {
    const btn = document.createElement('button');
    btn.className = `nav-tab-btn ${idx === 0 ? 'active' : ''}`;
    btn.id = tab.id;
    btn.innerHTML = tab.label;
    btn.setAttribute('onclick', tab.onclick);
    container.appendChild(btn);
  });
}

function setActiveNavTab(tabId) {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(tabId);
  if (activeBtn) activeBtn.classList.add('active');
}

// -------------------------------------------------------------
// 1. STUDENT VIEW LOGIC
// -------------------------------------------------------------
function switchStudentTab(tabId) {
  setActiveNavTab(tabId);
  document.querySelectorAll('.student-subtab').forEach(el => el.style.display = 'none');
  if (tabId === 'gap-tab') {
    document.getElementById('student-subtab-gap').style.display = 'block';
  } else if (tabId === 'jobs-tab') {
    document.getElementById('student-subtab-jobs').style.display = 'block';
    loadJobs();
  } else if (tabId === 'quizzes-tab') {
    document.getElementById('student-subtab-quizzes').style.display = 'block';
    loadAssessments();
  } else if (tabId === 'apps-tab') {
    document.getElementById('student-subtab-applications').style.display = 'block';
    loadStudentApplications();
  } else if (tabId === 'projects-tab') {
    document.getElementById('student-subtab-projects').style.display = 'block';
    loadStudentProjects();
  }
}

async function initStudentView() {
  await loadTargetRolesDropdown();
  await runSkillGapAnalysis();
  await updateStudentProfileStats();
}

async function updateStudentProfileStats() {
  if (!currentUser) return;
  const verifiedCount = (currentUser.skills || []).filter(s => s.verified).length;
  document.getElementById('studentVerifiedCount').innerText = verifiedCount;
  
  // Count applications
  const res = await fetch(`/api/applications?student_id=${activeUserId}`);
  const apps = await res.json();
  document.getElementById('studentAppCount').innerText = apps.length;
}

async function loadTargetRolesDropdown() {
  const res = await fetch('/api/target-roles');
  const roles = await res.json();
  const select = document.getElementById('targetRoleSelect');
  select.innerHTML = '';
  roles.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.innerText = `${r.title} (${r.sector})`;
    select.appendChild(opt);
  });
}

async function runSkillGapAnalysis() {
  const roleId = document.getElementById('targetRoleSelect').value || 1;
  const res = await fetch(`/api/skill-gap-analysis?student_id=${activeUserId}&target_role_id=${roleId}`);
  const data = await res.json();

  // Update Score & Summary
  document.getElementById('gapScoreValue').innerText = `${data.compatibility_score}%`;
  document.getElementById('studentReadinessStat').innerText = `${data.compatibility_score}%`;

  let summaryText = "";
  if (data.compatibility_score >= 85) {
    summaryText = "Industry-Ready! High candidate match with preferred recruiter interview status.";
  } else if (data.compatibility_score >= 70) {
    summaryText = "Strong foundational baseline with targeted practical lab competencies to close.";
  } else {
    summaryText = "Emerging talent profile. Immediate bridge certifications recommended.";
  }
  document.getElementById('gapScoreSummary').innerText = summaryText;

  // Render Radar Chart
  renderRadarChart(data.radar_data);

  // Render Matched Skills
  document.getElementById('matchedCount').innerText = data.matched_skills.length;
  const matchedContainer = document.getElementById('matchedSkillsList');
  matchedContainer.innerHTML = '';
  if (data.matched_skills.length === 0) {
    matchedContainer.innerHTML = '<span class="text-muted" style="font-size: 0.85rem;">No fully matched competencies yet.</span>';
  } else {
    data.matched_skills.forEach(s => {
      const pill = document.createElement('div');
      pill.className = 'skill-pill matched';
      pill.innerHTML = `<span>✓</span> <strong>${s.name}</strong> (${s.acquired_level}) ${s.verified ? '<span class="verified-icon" title="Accredited Verification">🏅 Verified</span>' : ''}`;
      matchedContainer.appendChild(pill);
    });
  }

  // Render Partial Skills
  document.getElementById('partialCount').innerText = data.partial_skills.length;
  const partialContainer = document.getElementById('partialSkillsList');
  partialContainer.innerHTML = '';
  if (data.partial_skills.length === 0) {
    partialContainer.innerHTML = '<span class="text-muted" style="font-size: 0.85rem;">None</span>';
  } else {
    data.partial_skills.forEach(s => {
      const pill = document.createElement('div');
      pill.className = 'skill-pill partial';
      pill.innerHTML = `<span>▲</span> <strong>${s.name}</strong>: Currently ${s.acquired_level} → Needs ${s.required_level}`;
      partialContainer.appendChild(pill);
    });
  }

  // Render Missing Skills
  document.getElementById('missingCount').innerText = data.missing_skills.length;
  const missingContainer = document.getElementById('missingSkillsList');
  missingContainer.innerHTML = '';
  if (data.missing_skills.length === 0) {
    missingContainer.innerHTML = '<span class="text-muted" style="font-size: 0.85rem;">Zero critical skill gaps detected!</span>';
  } else {
    data.missing_skills.forEach(s => {
      const pill = document.createElement('div');
      pill.className = 'skill-pill missing';
      pill.innerHTML = `<span>✕</span> <strong>${s.name}</strong> (Req: ${s.required_level})`;
      missingContainer.appendChild(pill);
    });
  }

  // Render AI Upskilling Roadmap
  const roadmapContainer = document.getElementById('roadmapGrid');
  roadmapContainer.innerHTML = '';

  const allGaps = [
    ...data.partial_skills.map(s => ({ ...s, isMissing: false })),
    ...data.missing_skills.map(s => ({ ...s, isMissing: true }))
  ];

  if (allGaps.length === 0) {
    roadmapContainer.innerHTML = '<div style="grid-column: 1/-1; padding: 16px; background: #ecfdf5; border-radius: 8px; color: #065f46;">🎉 Your skill set matches 100% of the industry benchmark for this role!</div>';
  } else {
    allGaps.forEach(item => {
      const card = document.createElement('div');
      card.className = `roadmap-card ${item.isMissing ? 'missing-border' : 'partial-border'}`;
      const rec = item.learning_recommendation;
      card.innerHTML = `
        <div class="roadmap-skill-name">
          <span>${item.name}</span>
          <span class="roadmap-badge">${item.isMissing ? 'Missing' : 'Upgrade Needed'}</span>
        </div>
        <div class="roadmap-course">📘 ${rec.course}</div>
        <div class="roadmap-provider">🏛️ ${rec.provider} • ⏱️ ${rec.duration} (${rec.type})</div>
        <div class="roadmap-project"><strong>🧪 Bridge Lab Project:</strong> ${rec.project_recommendation}</div>
      `;
      roadmapContainer.appendChild(card);
    });
  }
}

function renderRadarChart(radarData) {
  const ctx = document.getElementById('skillRadarChart').getContext('2d');
  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: radarData.labels,
      datasets: [
        {
          label: 'Student Current Mastery',
          data: radarData.student_scores,
          fill: true,
          backgroundColor: 'rgba(15, 118, 110, 0.25)',
          borderColor: '#0f766e',
          pointBackgroundColor: '#0f766e',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#0f766e'
        },
        {
          label: 'Industry Required Benchmark',
          data: radarData.benchmark_scores,
          fill: true,
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: '#f59e0b',
          borderDash: [5, 5],
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: '#e2e8f0' },
          grid: { color: '#e2e8f0' },
          pointLabels: {
            font: { size: 10, weight: 'bold' },
            color: '#334155'
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { display: false }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      }
    }
  });
}

// Jobs & Internships
async function loadJobs() {
  const search = document.getElementById('jobSearchInput').value.trim();
  let url = `/api/jobs?student_id=${activeUserId}&type=${currentJobFilter}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await fetch(url);
  const jobs = await res.json();

  const grid = document.getElementById('jobsGrid');
  grid.innerHTML = '';

  if (jobs.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; padding: 30px; text-align: center; color: var(--text-muted);">No matching openings found. Try adjusting your search query.</div>';
    return;
  }

  jobs.forEach(j => {
    const card = document.createElement('div');
    card.className = 'job-card';

    const skillsHtml = j.required_skills.map(s => `<span class="skill-pill matched" style="font-size: 0.72rem; padding: 2px 8px;">${s}</span>`).join(' ');

    let actionBtn = '';
    if (j.has_applied) {
      actionBtn = `<button class="btn btn-applied btn-sm" disabled>✓ ${j.application_status}</button>`;
    } else {
      actionBtn = `<button class="btn btn-primary btn-sm" onclick="applyToJob(${j.id})">⚡ 1-Click Apply</button>`;
    }

    card.innerHTML = `
      <div class="job-match-badge">${j.match_score}% Match</div>
      <div>
        <div class="job-type-tag">${j.job_type} • ${j.work_mode}</div>
        <h4 class="job-title">${j.title}</h4>
        <div class="job-company">🏢 ${j.company} • 📍 ${j.location}</div>
        <div class="job-details-meta">
          <span>💰 <strong>${j.stipend_salary}</strong></span>
          <span>⏱️ ${j.duration}</span>
          <span>📅 Deadline: ${j.deadline}</span>
        </div>
        <p class="job-desc">${j.description}</p>
        <div class="job-skills-req">
          <span class="label">Required Skill Competencies:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">${skillsHtml}</div>
        </div>
      </div>
      <div class="job-card-actions">
        <span class="job-stipend">${j.stipend_salary}</span>
        ${actionBtn}
      </div>
    `;
    grid.appendChild(card);
  });
}

function setJobFilter(type, btn) {
  currentJobFilter = type;
  document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadJobs();
}

function filterJobs() {
  loadJobs();
}

async function applyToJob(jobId) {
  try {
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, student_id: activeUserId })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`🎉 ${data.message}`, 'success');
      loadJobs();
      updateStudentProfileStats();
    } else {
      showToast(data.error || 'Failed to submit application', 'error');
    }
  } catch (err) {
    showToast('Network error submitting application', 'error');
  }
}

// Student Applications Tracker
async function loadStudentApplications() {
  const res = await fetch(`/api/applications?student_id=${activeUserId}`);
  const apps = await res.json();
  const tbody = document.getElementById('studentApplicationsTableBody');
  tbody.innerHTML = '';

  if (apps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No applications submitted yet. Browse open jobs to apply!</td></tr>';
    return;
  }

  apps.forEach(a => {
    let badgeClass = 'status-applied';
    if (a.status === 'Shortlisted') badgeClass = 'status-shortlisted';
    if (a.status === 'Interview') badgeClass = 'status-interview';
    if (a.status === 'Offered') badgeClass = 'status-offered';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${a.job_title}</strong></td>
      <td>🏢 ${a.company}</td>
      <td>${a.stipend_salary}</td>
      <td><span class="job-match-badge" style="position: static; display: inline-block;">${a.match_score}% Match</span></td>
      <td>${a.applied_date}</td>
      <td><span class="status-badge ${badgeClass}">${a.status}</span></td>
      <td><span style="font-size: 0.8rem; color: var(--text-muted);">${a.notes || 'In Progress'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// Assessments & Quizzes
async function loadAssessments() {
  const res = await fetch('/api/assessments');
  const tests = await res.json();
  const grid = document.getElementById('assessmentsGrid');
  grid.innerHTML = '';

  tests.forEach(t => {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
      <div>
        <div class="job-type-tag">Ministry Accredited Test</div>
        <h4 class="job-title" style="padding-right: 0;">${t.title}</h4>
        <div class="job-company">🎯 Sector: ${t.sector} • Skill: <strong>${t.skill_name}</strong></div>
        <div class="job-details-meta">
          <span>⏱️ Duration: ${t.duration_minutes} Mins</span>
          <span>📊 Passing Mark: ${t.passing_score}%</span>
          <span>🏅 Official Verifiable Badge</span>
        </div>
        <p class="job-desc">Standardized MCQ evaluation benchmarked to Pharmacopoeial and CDSCO industry norms. Scoring ≥${t.passing_score}% immediately certifies your skill badge.</p>
      </div>
      <div class="job-card-actions">
        <button class="btn btn-primary btn-sm" onclick="startQuiz(${t.id})">📝 Take Assessment Test</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function startQuiz(assessmentId) {
  const res = await fetch(`/api/assessments/${assessmentId}`);
  activeQuizData = await res.json();

  document.getElementById('quizModalTitle').innerText = activeQuizData.title;
  const container = document.getElementById('quizQuestionsContainer');
  container.innerHTML = '';

  activeQuizData.questions.forEach((q, idx) => {
    const qBox = document.createElement('div');
    qBox.className = 'quiz-question-box';
    const optionsHtml = q.options.map((opt, optIdx) => `
      <label class="quiz-option-item">
        <input type="radio" name="quiz_q_${q.id}" value="${optIdx}">
        <span>${opt}</span>
      </label>
    `).join('');

    qBox.innerHTML = `
      <div class="quiz-question-title">Q${idx + 1}. ${q.question}</div>
      <div class="quiz-options-list">${optionsHtml}</div>
    `;
    container.appendChild(qBox);
  });

  // Start Timer
  quizTimeRemaining = (activeQuizData.duration_minutes || 10) * 60;
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    quizTimeRemaining--;
    const mins = Math.floor(quizTimeRemaining / 60);
    const secs = quizTimeRemaining % 60;
    document.getElementById('quizTimer').innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (quizTimeRemaining <= 0) {
      clearInterval(quizTimerInterval);
      submitActiveQuiz();
    }
  }, 1000);

  openModal('quizModal');
}

async function submitActiveQuiz() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  if (!activeQuizData) return;

  const answers = {};
  activeQuizData.questions.forEach(q => {
    const selected = document.querySelector(`input[name="quiz_q_${q.id}"]:checked`);
    if (selected) {
      answers[q.id] = parseInt(selected.value);
    }
  });

  try {
    const res = await fetch('/api/assessments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment_id: activeQuizData.id,
        student_id: activeUserId,
        answers: answers
      })
    });
    const result = await res.json();
    closeModal('quizModal');

    if (result.passed) {
      showToast(`🎉 Passed (${result.percentage}%)! Official Verified Badge Awarded for ${result.skill_name}!`, 'success');
      // Refresh user profile and skill gap
      const userRes = await fetch(`/api/user/${activeUserId}`);
      currentUser = await userRes.json();
      await updateStudentProfileStats();
      await runSkillGapAnalysis();
    } else {
      showToast(`Score: ${result.percentage}%. Passing is ${result.passing_score}%. Review fundamentals and re-attempt!`, 'error');
    }
  } catch (err) {
    showToast('Error grading assessment', 'error');
  }
}

// Student Joint Projects
async function loadStudentProjects() {
  const res = await fetch('/api/joint-projects');
  const projects = await res.json();
  const grid = document.getElementById('studentProjectsGrid');
  grid.innerHTML = '';

  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'job-card';
    const skillsHtml = p.skills.map(s => `<span class="skill-pill matched" style="font-size: 0.72rem; padding: 2px 8px;">${s}</span>`).join(' ');

    card.innerHTML = `
      <div class="job-match-badge" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">R&D Capstone</div>
      <div>
        <div class="job-type-tag">${p.domain} • ${p.status}</div>
        <h4 class="job-title">${p.title}</h4>
        <div class="job-company">🏢 ${p.company} • 🧑‍🏫 Industry Mentor: ${p.mentor_name}</div>
        <div class="job-details-meta">
          <span>💰 Grant: <strong>${p.stipend_or_grant}</strong></span>
          <span>⏱️ Duration: ${p.duration}</span>
        </div>
        <p class="job-desc">${p.description}</p>
        <div class="job-skills-req">
          <span class="label">Target Research Competencies:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">${skillsHtml}</div>
        </div>
      </div>
      <div class="job-card-actions">
        <button class="btn btn-primary btn-sm" onclick="showToast('R&D Collaboration proposal draft submitted to faculty advisor!', 'success')">🤝 Submit Team Proposal</button>
      </div>
    `;
    grid.appendChild(card);
  });
}


// -------------------------------------------------------------
// 2. INDUSTRY RECRUITER VIEW LOGIC
// -------------------------------------------------------------
function switchRecruiterTab(tabId) {
  setActiveNavTab(tabId);
  document.querySelectorAll('.recruiter-subtab').forEach(el => el.style.display = 'none');
  if (tabId === 'kanban-tab') {
    document.getElementById('recruiter-subtab-kanban').style.display = 'block';
    loadRecruiterKanban();
  } else if (tabId === 'talent-tab') {
    document.getElementById('recruiter-subtab-talent').style.display = 'block';
    loadCandidates();
  } else if (tabId === 'postings-tab') {
    document.getElementById('recruiter-subtab-postings').style.display = 'block';
    loadRecruiterJobListings();
  }
}

async function initRecruiterView() {
  await loadRecruiterKanban();
}

async function loadRecruiterKanban() {
  const res = await fetch(`/api/applications?recruiter_id=${activeUserId}`);
  const apps = await res.json();

  document.getElementById('recruiterApplicantsCount').innerText = apps.length;

  const cols = {
    'Applied': document.getElementById('kanbanCol-Applied'),
    'Shortlisted': document.getElementById('kanbanCol-Shortlisted'),
    'Interview': document.getElementById('kanbanCol-Interview'),
    'Offered': document.getElementById('kanbanCol-Offered')
  };

  const counts = { 'Applied': 0, 'Shortlisted': 0, 'Interview': 0, 'Offered': 0 };

  // Clear columns
  Object.values(cols).forEach(col => col.innerHTML = '');

  apps.forEach(a => {
    const status = a.status in cols ? a.status : 'Applied';
    counts[status] = (counts[status] || 0) + 1;

    const card = document.createElement('div');
    card.className = 'kanban-card';

    let actionBtns = '';
    if (status === 'Applied') {
      actionBtns = `<button class="btn btn-secondary btn-sm" onclick="updateAppStatus(${a.id}, 'Shortlisted')">⭐ Shortlist</button>`;
    } else if (status === 'Shortlisted') {
      actionBtns = `<button class="btn btn-secondary btn-sm" onclick="updateAppStatus(${a.id}, 'Interview')">🎙️ Interview</button>`;
    } else if (status === 'Interview') {
      actionBtns = `<button class="btn btn-success btn-sm" onclick="updateAppStatus(${a.id}, 'Offered')">🎉 Offer</button>`;
    }

    card.innerHTML = `
      <div class="kanban-card-name">
        <span>${a.student_name}</span>
        <span class="job-match-badge" style="position: static; font-size: 0.72rem; padding: 2px 6px;">${a.match_score}%</span>
      </div>
      <div class="kanban-card-role">${a.job_title}</div>
      <div class="kanban-card-inst">🏛️ ${a.college || 'AIIA'} • CGPA: ${a.cgpa || '8.8'}</div>
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">Applied: ${a.applied_date}</div>
      <div class="kanban-actions">
        ${actionBtns}
      </div>
    `;
    cols[status].appendChild(card);
  });

  // Update counts
  Object.keys(counts).forEach(k => {
    const el = document.getElementById(`kanbanCount-${k}`);
    if (el) el.innerText = counts[k];
  });
}

async function updateAppStatus(appId, newStatus) {
  try {
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Candidate status moved to ${newStatus}`, 'success');
      loadRecruiterKanban();
    }
  } catch (err) {
    showToast('Failed to update candidate status', 'error');
  }
}

async function loadCandidates() {
  const skill = document.getElementById('candidateSkillFilter').value.trim();
  const college = document.getElementById('candidateCollegeFilter').value.trim();
  const res = await fetch(`/api/candidates?skill=${encodeURIComponent(skill)}&college=${encodeURIComponent(college)}`);
  const candidates = await res.json();

  const grid = document.getElementById('candidatesGrid');
  grid.innerHTML = '';

  if (candidates.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-muted);">No candidates matching the criteria.</div>';
    return;
  }

  candidates.forEach(c => {
    const card = document.createElement('div');
    card.className = 'job-card';

    const skillsHtml = c.skills.map(s => `
      <span class="skill-pill ${s.verified ? 'matched' : 'partial'}" style="font-size: 0.75rem;">
        ${s.skill_name} (${s.proficiency}) ${s.verified ? '🏅' : ''}
      </span>
    `).join(' ');

    card.innerHTML = `
      <div class="job-match-badge" style="background: #0f766e;">${c.verified_badge_count} Badges</div>
      <div>
        <h4 class="job-title" style="padding-right: 0;">${c.name}</h4>
        <div class="job-company">🏛️ ${c.college} • ${c.degree}</div>
        <div class="job-details-meta">
          <span>🎓 CGPA: <strong>${c.cgpa}</strong></span>
          <span>📅 Class of ${c.graduation_year}</span>
          <span>✉️ ${c.email}</span>
        </div>
        <p class="job-desc">${c.resume_summary}</p>
        <div class="job-skills-req">
          <span class="label">Verified Skill Competencies:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">${skillsHtml}</div>
        </div>
      </div>
      <div class="job-card-actions">
        <button class="btn btn-primary btn-sm" onclick="showToast('Direct interview invite sent to ${c.name}!', 'success')">✉️ Invite to Drive</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function loadRecruiterJobListings() {
  const res = await fetch('/api/jobs');
  const jobs = await res.json();
  const tbody = document.getElementById('recruiterJobsTableBody');
  tbody.innerHTML = '';

  jobs.forEach(j => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${j.title}</strong></td>
      <td>${j.job_type}</td>
      <td>${j.location}</td>
      <td>${j.stipend_salary}</td>
      <td><span style="font-size: 0.78rem;">${j.required_skills.join(', ')}</span></td>
      <td>${j.deadline}</td>
      <td><span class="status-badge status-active">Open</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function openPostJobModal() {
  openModal('postJobModal');
}

async function submitNewJob() {
  const title = document.getElementById('newJobTitle').value.trim();
  const job_type = document.getElementById('newJobType').value;
  const work_mode = document.getElementById('newJobMode').value;
  const location = document.getElementById('newJobLocation').value.trim();
  const stipend_salary = document.getElementById('newJobStipend').value.trim();
  const duration = document.getElementById('newJobDuration').value.trim();
  const deadline = document.getElementById('newJobDeadline').value;
  const skillsInput = document.getElementById('newJobSkills').value.trim();
  const description = document.getElementById('newJobDescription').value.trim();

  if (!title || !location || !stipend_salary || !skillsInput || !description) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recruiter_id: activeUserId,
        company: currentUser.organization,
        title, job_type, work_mode, location, stipend_salary, duration, deadline,
        required_skills: skills,
        description
      })
    });
    if (res.ok) {
      showToast('🎉 Opening successfully published to student portal!', 'success');
      closeModal('postJobModal');
      loadRecruiterJobListings();
    }
  } catch (err) {
    showToast('Failed to post opening', 'error');
  }
}

function openPostProjectModal() {
  openModal('postProjectModal');
}

async function submitNewProject() {
  const title = document.getElementById('newProjTitle').value.trim();
  const domain = document.getElementById('newProjDomain').value.trim();
  const mentor_name = document.getElementById('newProjMentor').value.trim();
  const stipend_or_grant = document.getElementById('newProjGrant').value.trim();
  const duration = document.getElementById('newProjDuration').value.trim();
  const skillsInput = document.getElementById('newProjSkills').value.trim();
  const description = document.getElementById('newProjDesc').value.trim();

  if (!title || !domain || !stipend_or_grant || !description) {
    showToast('Please fill all fields', 'error');
    return;
  }

  const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

  try {
    const res = await fetch('/api/joint-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: currentUser.organization,
        title, domain, mentor_name, stipend_or_grant, duration, description, skills
      })
    });
    if (res.ok) {
      showToast('Industry R&D Problem posted to university network!', 'success');
      closeModal('postProjectModal');
    }
  } catch (err) {
    showToast('Failed to post project', 'error');
  }
}


// -------------------------------------------------------------
// 3. ACADEMIA / TPO VIEW LOGIC
// -------------------------------------------------------------
function switchTpoTab(tabId) {
  setActiveNavTab(tabId);
  document.querySelectorAll('.tpo-subtab').forEach(el => el.style.display = 'none');
  if (tabId === 'curriculum-tab') {
    document.getElementById('tpo-subtab-curriculum').style.display = 'block';
    loadCurriculumGap();
  } else if (tabId === 'endorse-tab') {
    document.getElementById('tpo-subtab-endorsements').style.display = 'block';
    loadTpoEndorsements();
  } else if (tabId === 'mous-tab') {
    document.getElementById('tpo-subtab-mous').style.display = 'block';
    loadTpoMous();
  }
}

async function initTpoView() {
  await loadCurriculumGap();
}

async function loadCurriculumGap() {
  const res = await fetch('/api/curriculum-gap');
  const data = await res.json();

  // Render Demand Bar Chart
  const topSkills = data.industry_demand_ranking.slice(0, 6);
  const ctx = document.getElementById('tpoDemandBarChart').getContext('2d');
  if (demandBarChartInstance) demandBarChartInstance.destroy();

  demandBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topSkills.map(s => s.skill),
      datasets: [{
        label: 'Active Industry Vacancies Requiring Skill',
        data: topSkills.map(s => s.demand_jobs),
        backgroundColor: '#0f766e',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { stepSize: 1 } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // Render Deficiencies Table
  const defTbody = document.getElementById('tpoDeficienciesTableBody');
  defTbody.innerHTML = '';
  data.priority_deficiencies.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${d.skill}</strong></td>
      <td><span class="status-badge status-shortlisted">${d.industry_demand}</span></td>
      <td>${d.academic_status}</td>
      <td><span style="color: var(--primary); font-weight: 600;">${d.action}</span></td>
    `;
    defTbody.appendChild(tr);
  });

  // Render University Modules
  const modGrid = document.getElementById('tpoModulesGrid');
  modGrid.innerHTML = '';
  data.modules.forEach(m => {
    const card = document.createElement('div');
    card.className = 'roadmap-card';
    card.innerHTML = `
      <div class="roadmap-skill-name">
        <span>${m.course_name}</span>
        <span class="roadmap-badge" style="background: #ccfbf1; color: #0f766e;">${m.industry_alignment_score}% Aligned</span>
      </div>
      <div class="roadmap-provider">🏛️ ${m.institution_name} • ${m.program}</div>
      <div style="font-size: 0.8rem; color: #475569; margin: 6px 0;"><strong>Taught Topics:</strong> ${m.syllabus_topics.join(', ')}</div>
      <div class="roadmap-project" style="color: #92400e; background: #fffbeb;"><strong>💡 TPO Note:</strong> ${m.gap_recommendations}</div>
    `;
    modGrid.appendChild(card);
  });
}

async function loadTpoEndorsements() {
  const tbody = document.getElementById('tpoEndorsementsTableBody');
  tbody.innerHTML = '';

  // Sample student skills pending endorsement
  const pendingSkills = [
    { id: 5, student_name: 'Priya Sharma', college: 'AIIA', skill: 'Formulation Development', level: 'Intermediate', verified: 0 },
    { id: 6, student_name: 'Priya Sharma', college: 'AIIA', skill: 'Spectroscopy (UV-Vis)', level: 'Intermediate', verified: 0 },
    { id: 10, student_name: 'Rohan Deshmukh', college: 'NIPER', skill: 'Regulatory Affairs (USFDA/AYUSH)', level: 'Intermediate', verified: 0 }
  ];

  pendingSkills.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.student_name}</strong> (${item.college})</td>
      <td>${item.skill}</td>
      <td>${item.level}</td>
      <td><span class="status-badge status-shortlisted">Pending Faculty Review</span></td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="endorseStudentSkill(${item.id}, '${item.skill}')">✓ Verify & Endorse</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function endorseStudentSkill(skillId, skillName) {
  try {
    const res = await fetch('/api/endorse-skill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_skill_id: skillId,
        faculty_name: currentUser.name
      })
    });
    if (res.ok) {
      showToast(`Verified & endorsed ${skillName} for student portfolio!`, 'success');
      loadTpoEndorsements();
    }
  } catch (err) {
    showToast('Endorsement failed', 'error');
  }
}

async function loadTpoMous() {
  const res = await fetch('/api/mous');
  const mous = await res.json();
  const grid = document.getElementById('tpoMousGrid');
  grid.innerHTML = '';

  mous.forEach(m => {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
      <div class="job-match-badge" style="background: #0369a1;">Active MoU</div>
      <div>
        <div class="job-type-tag">${m.focus_area}</div>
        <h4 class="job-title" style="padding-right: 70px;">${m.title}</h4>
        <div class="job-company">🏛️ ${m.institution_name} ↔️ 🏢 ${m.industry_partner}</div>
        <div class="job-details-meta">
          <span>📅 Signed: ${m.signed_date}</span>
          <span>⏳ Valid Until: ${m.valid_until}</span>
          <span>⚡ Joint Initiatives: ${m.joint_initiatives_count}</span>
        </div>
        <p class="job-desc"><strong>Key Deliverables:</strong> ${m.deliverables}</p>
      </div>
      <div class="job-card-actions">
        <span class="status-badge status-active">Operational</span>
        <button class="btn btn-secondary btn-sm" onclick="showToast('MoU Audit Record downloaded!', 'success')">📄 View Agreement</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openAddMouModal() {
  openModal('addMouModal');
}

async function submitNewMou() {
  const institution_name = document.getElementById('newMouInstitution').value.trim();
  const industry_partner = document.getElementById('newMouIndustry').value.trim();
  const title = document.getElementById('newMouTitle').value.trim();
  const focus_area = document.getElementById('newMouFocus').value.trim();
  const deliverables = document.getElementById('newMouDeliverables').value.trim();

  if (!industry_partner || !title || !focus_area || !deliverables) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  try {
    const res = await fetch('/api/mous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_name, industry_partner, title, focus_area, deliverables })
    });
    if (res.ok) {
      showToast('🎉 Formal Industry-Academia MoU Registered!', 'success');
      closeModal('addMouModal');
      loadTpoMous();
    }
  } catch (err) {
    showToast('Failed to register MoU', 'error');
  }
}


// -------------------------------------------------------------
// 4. MINISTRY ADMIN VIEW LOGIC
// -------------------------------------------------------------
function switchAdminTab(tabId) {
  setActiveNavTab(tabId);
}

async function initAdminView() {
  const res = await fetch('/api/analytics/overview');
  const data = await res.json();

  document.getElementById('adminTotalStudents').innerText = data.metrics.total_students_registered.toLocaleString();
  document.getElementById('adminTotalBadges').innerText = data.metrics.verified_skills_awarded.toLocaleString();
  document.getElementById('adminTotalRecruiters').innerText = data.metrics.active_industry_partners;
  document.getElementById('adminTotalMous').innerText = data.metrics.active_mous_signed;

  // Donut Chart for Sector Distribution
  const ctx = document.getElementById('adminSectorDonutChart').getContext('2d');
  if (sectorDonutChartInstance) sectorDonutChartInstance.destroy();

  sectorDonutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.sector_distribution.map(s => s.sector),
      datasets: [{
        data: data.sector_distribution.map(s => s.percentage),
        backgroundColor: ['#0f766e', '#0369a1', '#f59e0b', '#8b5cf6']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
      }
    }
  });

  // Regional Clusters Table
  const tbody = document.getElementById('adminRegionalClustersTableBody');
  tbody.innerHTML = '';
  data.regional_clusters.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.state}</strong></td>
      <td>${c.institutions} Participating Colleges</td>
      <td>${c.students_placed} Placed</td>
      <td><span class="status-badge status-active">High Alignment</span></td>
      <td><span style="color: var(--success); font-weight: 700;">Active Hub</span></td>
    `;
    tbody.appendChild(tr);
  });
}


// -------------------------------------------------------------
// UI HELPERS (MODALS & TOASTS)
// -------------------------------------------------------------
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
  if (id === 'quizModal' && quizTimerInterval) {
    clearInterval(quizTimerInterval);
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
