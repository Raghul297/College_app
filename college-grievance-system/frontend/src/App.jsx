
import { useMemo, useState } from "react";
import {
  LayoutDashboard, FileText, MessageSquare, Settings,
  LogOut, Plus, Search, Bell, Menu, X, Clock,
  CheckCircle2, AlertCircle, Users, ClipboardList,
  BarChart3, ArrowUpRight, Paperclip, ShieldCheck,
  ChevronDown, Send, Eye, Filter, GraduationCap
} from "lucide-react";
import "./App.css";

const initialGrievances = [
  {
    id: "GRV-2026-001",
    subject: "Laboratory computers not working",
    category: "Laboratory",
    description: "Several computers in the programming lab are not working.",
    date: "2026-10-22",
    status: "In Progress",
    student: "Arun Kumar",
    assignedTo: "Dr. Priya",
    confidential: false,
    response: "The technical team has been informed.",
    history: ["Complaint submitted", "Assigned to Dr. Priya", "Status changed to In Progress"]
  },
  {
    id: "GRV-2026-002",
    subject: "Hostel water supply issue",
    category: "Hostel",
    description: "Water supply is irregular in the hostel block.",
    date: "2026-10-23",
    status: "Submitted",
    student: "Arun Kumar",
    assignedTo: "Unassigned",
    confidential: true,
    response: "",
    history: ["Complaint submitted"]
  },
  {
    id: "GRV-2026-003",
    subject: "Request for additional library hours",
    category: "Infrastructure",
    description: "Please consider extending library hours during examinations.",
    date: "2026-10-18",
    status: "Resolved",
    student: "Arun Kumar",
    assignedTo: "Dr. Priya",
    confidential: false,
    response: "Extended hours will be announced by the library.",
    history: ["Complaint submitted", "Assigned to Dr. Priya", "Resolved"]
  }
];

const initialFeedback = [
  { id: 1, category: "Teaching", rating: 4, comments: "Good teaching experience." },
  { id: 2, category: "Laboratory", rating: 2, comments: "Some systems need maintenance." },
  { id: 3, category: "Library", rating: 5, comments: "Very useful resources." }
];

const navItems = {
  Student: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "grievances", label: "My Grievances", icon: FileText },
    { id: "submit", label: "Submit Grievance", icon: Plus },
    { id: "feedback", label: "Feedback", icon: MessageSquare }
  ],
  Faculty: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "grievances", label: "Assigned Grievances", icon: ClipboardList }
  ],
  Admin: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "grievances", label: "All Grievances", icon: FileText },
    { id: "feedback", label: "Feedback Summary", icon: MessageSquare },
    { id: "reports", label: "Reports", icon: BarChart3 }
  ]
};

const statusClass = (status) =>
  status.toLowerCase().replaceAll(" ", "-");

function StatCard({ label, value, icon: Icon, color, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${color}`}><Icon size={19} /></div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${statusClass(status)}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function App() {
  const [role, setRole] = useState("Student");
  const [page, setPage] = useState("overview");
  const [grievances, setGrievances] = useState(initialGrievances);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginView, setLoginView] = useState(false);

  const [form, setForm] = useState({
    category: "Academic",
    subject: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    confidential: false,
    attachment: ""
  });

  const [feedbackForm, setFeedbackForm] = useState({
    category: "Teaching",
    rating: "5",
    comments: ""
  });

  const [responseDraft, setResponseDraft] = useState("");
  const [assignDraft, setAssignDraft] = useState("Dr. Priya");

  const visibleGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const roleMatch =
        role === "Admin" ||
        (role === "Student" && g.student === "Arun Kumar") ||
        (role === "Faculty" && g.assignedTo === "Dr. Priya");

      const searchMatch =
        `${g.id} ${g.subject} ${g.category} ${g.student}`
          .toLowerCase().includes(search.toLowerCase());

      const statusMatch =
        statusFilter === "All" || g.status === statusFilter;

      return roleMatch && searchMatch && statusMatch;
    });
  }, [grievances, role, search, statusFilter]);

  const counts = {
    total: visibleGrievances.length,
    pending: visibleGrievances.filter(g =>
      ["Submitted", "Under Review", "In Progress"].includes(g.status)
    ).length,
    progress: visibleGrievances.filter(g => g.status === "In Progress").length,
    resolved: visibleGrievances.filter(g => g.status === "Resolved").length
  };

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function changeRole(nextRole) {
    setRole(nextRole);
    setPage("overview");
    setSelected(null);
    setSearch("");
    setStatusFilter("All");
    setMobileOpen(false);
  }

  function updateGrievance(id, updates, historyEntry) {
    setGrievances(old => old.map(g =>
      g.id === id
        ? {
            ...g,
            ...updates,
            history: historyEntry ? [...g.history, historyEntry] : g.history
          }
        : g
    ));

    setSelected(old =>
      old?.id === id
        ? {
            ...old,
            ...updates,
            history: historyEntry ? [...old.history, historyEntry] : old.history
          }
        : old
    );
  }

  function submitGrievance(event) {
    event.preventDefault();

    const newGrievance = {
      id: `GRV-2026-${String(grievances.length + 1).padStart(3, "0")}`,
      ...form,
      student: "Arun Kumar",
      status: "Submitted",
      assignedTo: "Unassigned",
      response: "",
      history: ["Complaint submitted"]
    };

    setGrievances(old => [newGrievance, ...old]);
    setForm({
      category: "Academic",
      subject: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      confidential: false,
      attachment: ""
    });
    setPage("grievances");
    notify(`Grievance ${newGrievance.id} submitted successfully`);
  }

  function submitFeedback(event) {
    event.preventDefault();

    setFeedback(old => [
      {
        id: Date.now(),
        ...feedbackForm,
        rating: Number(feedbackForm.rating)
      },
      ...old
    ]);

    setFeedbackForm({ category: "Teaching", rating: "5", comments: "" });
    notify("Feedback submitted successfully");
  }

  function addResponse(event) {
    event.preventDefault();
    if (!selected || !responseDraft.trim()) return;

    updateGrievance(
      selected.id,
      { response: responseDraft.trim() },
      `Response added by ${role === "Faculty" ? "Dr. Priya" : "Administrator"}`
    );

    setResponseDraft("");
    notify("Response added");
  }

  function updateStatus(id, nextStatus) {
    const g = grievances.find(item => item.id === id);
    if (!g) return;

    updateGrievance(
      id,
      { status: nextStatus },
      `Status changed from ${g.status} to ${nextStatus}`
    );

    notify("Grievance status updated");
  }

  function assignGrievance(id) {
    updateGrievance(
      id,
      { assignedTo: assignDraft },
      `Assigned to ${assignDraft}`
    );
    notify("Grievance assigned");
  }

  const currentNav = navItems[role];
  const currentTitle =
    currentNav.find(item => item.id === page)?.label || "Overview";

  if (loginView) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={e => {
          e.preventDefault();
          setLoginView(false);
          notify("Demo login successful");
        }}>
          <div className="brand-mark"><GraduationCap size={30} /></div>
          <h1>Welcome back</h1>
          <p>Sign in to your college grievance portal.</p>

          <label>College email</label>
          <input type="email" placeholder="student@college.edu" required />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" required />

          <label>Demo role</label>
          <select value={role} onChange={e => changeRole(e.target.value)}>
            <option>Student</option>
            <option>Faculty</option>
            <option>Admin</option>
          </select>

          <button className="primary-button full-button">Sign in</button>
          <p className="demo-note">
            Prototype only. Real authentication will be connected to the backend.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={25} /></div>
          <div>
            <strong>CampusCare</strong>
            <small>Grievance Portal</small>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {currentNav.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? "nav-active" : ""}`}
                onClick={() => {
                  setPage(item.id);
                  setSelected(null);
                  setMobileOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.id === "grievances" && role !== "Student" &&
                  <span className="nav-count">{counts.pending}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-note">
            <ShieldCheck size={19} />
            <div>
              <strong>Secure portal</strong>
              <small>College grievance management</small>
            </div>
          </div>
          <button className="nav-item" onClick={() => setLoginView(true)}>
            <LogOut size={18} /><span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-button" onClick={() => setMobileOpen(true)}>
              <Menu size={21} />
            </button>
            <div className="breadcrumb">CampusCare <span>/</span> {currentTitle}</div>
          </div>

          <div className="topbar-right">
            <label className="role-switcher">
              <span>View as</span>
              <select value={role} onChange={e => changeRole(e.target.value)}>
                <option>Student</option>
                <option>Faculty</option>
                <option>Admin</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <button className="icon-button notification-button" title="Notifications">
              <Bell size={19} />
              <span />
            </button>
            <div className="avatar">{role === "Student" ? "AK" : role === "Faculty" ? "DP" : "AD"}</div>
            <div className="profile-name">
              <strong>{role === "Student" ? "Arun Kumar" : role === "Faculty" ? "Dr. Priya" : "Administrator"}</strong>
              <small>{role}</small>
            </div>
          </div>
        </header>

        <div className="page-content">
          {page === "overview" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR WORKSPACE</div>
                  <h1>{role === "Student" ? "Student Dashboard" : role === "Faculty" ? "Faculty Dashboard" : "Administration"}</h1>
                  <p>
                    {role === "Student"
                      ? "Track your grievances and share feedback with your college."
                      : role === "Faculty"
                      ? "Review assigned grievances and help resolve student concerns."
                      : "Monitor grievance resolution and college feedback."}
                  </p>
                </div>
                {role === "Student" && (
                  <button className="primary-button" onClick={() => setPage("submit")}>
                    <Plus size={18} /> New grievance
                  </button>
                )}
              </div>

              <div className="stats-grid">
                <StatCard label="Total grievances" value={counts.total} icon={FileText} color="blue" detail="Recorded complaints" />
                <StatCard label="Pending" value={counts.pending} icon={Clock} color="amber" detail="Awaiting resolution" />
                <StatCard label="In progress" value={counts.progress} icon={AlertCircle} color="purple" detail="Being addressed" />
                <StatCard label="Resolved" value={counts.resolved} icon={CheckCircle2} color="green" detail="Completed cases" />
              </div>

              {role === "Admin" && (
                <div className="insight-grid">
                  <div className="panel insight-panel">
                    <div className="panel-heading">
                      <div><h3>Resolution overview</h3><p>Current grievance status distribution</p></div>
                      <BarChart3 size={20} />
                    </div>
                    {["Submitted", "Under Review", "In Progress", "Resolved"].map(s => {
                      const count = grievances.filter(g => g.status === s).length;
                      const pct = grievances.length ? count / grievances.length * 100 : 0;
                      return (
                        <div className="bar-row" key={s}>
                          <div><span>{s}</span><strong>{count}</strong></div>
                          <div className="bar-track"><div className={`bar-fill ${statusClass(s)}`} style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="panel insight-panel">
                    <div className="panel-heading">
                      <div><h3>Feedback snapshot</h3><p>Average rating across submissions</p></div>
                      <MessageSquare size={20} />
                    </div>
                    <div className="rating-number">
                      {feedback.length
                        ? (feedback.reduce((sum, f) => sum + Number(f.rating), 0) / feedback.length).toFixed(1)
                        : "—"}
                      <span>/ 5</span>
                    </div>
                    <div className="rating-stars">{"★".repeat(Math.round(feedback.length ? feedback.reduce((s, f) => s + Number(f.rating), 0) / feedback.length : 0))}{"☆".repeat(5 - Math.round(feedback.length ? feedback.reduce((s, f) => s + Number(f.rating), 0) / feedback.length : 0))}</div>
                    <p className="muted-text">{feedback.length} feedback submissions in this demo</p>
                    <button className="text-button" onClick={() => setPage("feedback")}>View feedback <ArrowUpRight size={16} /></button>
                  </div>
                </div>
              )}

              {role === "Student" && (
                <div className="panel quick-panel">
                  <div className="quick-icon"><ShieldCheck size={23} /></div>
                  <div>
                    <h3>Your voice matters</h3>
                    <p>Submit concerns confidentially where permitted by college policy. Only authorized personnel should access confidential details.</p>
                  </div>
                  <button className="secondary-button" onClick={() => setPage("feedback")}>Share feedback</button>
                </div>
              )}

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>{role === "Student" ? "Recent grievances" : role === "Faculty" ? "Assigned grievances" : "Recent complaints"}</h3>
                    <p>Review complaint details and current progress.</p>
                  </div>
                  <button className="text-button" onClick={() => setPage("grievances")}>View all <ArrowUpRight size={16} /></button>
                </div>
                <GrievanceTable
                  items={visibleGrievances.slice(0, 4)}
                  role={role}
                  onOpen={setSelected}
                />
              </div>
            </>
          )}

          {page === "grievances" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">CASE MANAGEMENT</div>
                  <h1>{currentTitle}</h1>
                  <p>Search complaints, review progress and open a case for details.</p>
                </div>
                {role === "Student" && <button className="primary-button" onClick={() => setPage("submit")}><Plus size={18} /> New grievance</button>}
              </div>

              <div className="panel">
                <div className="toolbar">
                  <div className="search-box">
                    <Search size={18} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, subject or category..." />
                  </div>
                  <div className="filter-box">
                    <Filter size={17} />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option>All</option>
                      <option>Submitted</option>
                      <option>Under Review</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </div>
                <GrievanceTable items={visibleGrievances} role={role} onOpen={setSelected} />
                {visibleGrievances.length === 0 && <div className="empty-state">No grievances match your search.</div>}
              </div>
            </>
          )}

          {page === "submit" && role === "Student" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">NEW COMPLAINT</div>
                  <h1>Submit a grievance</h1>
                  <p>Describe the issue clearly so the appropriate team can investigate.</p>
                </div>
              </div>
              <form className="panel form-panel" onSubmit={submitGrievance}>
                <div className="form-section-title"><FileText size={19} /><div><h3>Grievance details</h3><p>Fields marked with * are required.</p></div></div>
                <div className="form-grid">
                  <div className="field">
                    <label>Category *</label>
                    <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {["Academic", "Infrastructure", "Examinations", "Hostel", "Laboratory", "Teaching", "Library", "Other"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Submission date *</label>
                    <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  </div>
                  <div className="field full-field">
                    <label>Subject *</label>
                    <input required minLength={5} maxLength={150} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Briefly describe the issue" />
                  </div>
                  <div className="field full-field">
                    <label>Description *</label>
                    <textarea required minLength={10} maxLength={5000} rows={6} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Explain what happened, where it occurred, and what resolution you expect." />
                    <span className="field-hint">{form.description.length}/5000 characters</span>
                  </div>
                  <div className="field full-field">
                    <label>Supporting document (optional)</label>
                    <label className="upload-box">
                      <Paperclip size={19} />
                      <span>{form.attachment || "Choose a file to attach"}</span>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={e => setForm({...form, attachment: e.target.files?.[0]?.name || ""})} />
                    </label>
                    <span className="field-hint">Prototype records the filename only. Actual file upload will be implemented in the backend.</span>
                  </div>
                </div>
                <div className="confidential-option">
                  <div className="confidential-icon"><ShieldCheck size={20} /></div>
                  <div className="confidential-copy">
                    <strong>Request confidential handling</strong>
                    <p>Your identity and complaint details should only be accessible to authorized personnel, subject to college policy.</p>
                  </div>
                  <input type="checkbox" checked={form.confidential} onChange={e => setForm({...form, confidential: e.target.checked})} />
                </div>
                <div className="form-actions">
                  <button type="button" className="secondary-button" onClick={() => setPage("grievances")}>Cancel</button>
                  <button type="submit" className="primary-button"><Send size={17} /> Submit grievance</button>
                </div>
              </form>
            </>
          )}

          {page === "feedback" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">STUDENT VOICE</div>
                  <h1>{role === "Admin" ? "Feedback Summary" : "College feedback"}</h1>
                  <p>{role === "Admin" ? "Review feedback and identify areas for improvement." : "Rate college services to help improve the campus experience."}</p>
                </div>
              </div>

              {role === "Student" && (
                <form className="panel form-panel" onSubmit={submitFeedback}>
                  <div className="form-section-title"><MessageSquare size={19} /><div><h3>Share your feedback</h3><p>Your feedback helps improve campus services.</p></div></div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Service category *</label>
                      <select value={feedbackForm.category} onChange={e => setFeedbackForm({...feedbackForm, category: e.target.value})}>
                        {["Teaching", "Laboratory", "Library", "Hostel", "Infrastructure", "Examinations", "Cafeteria", "Other"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Rating *</label>
                      <select value={feedbackForm.rating} onChange={e => setFeedbackForm({...feedbackForm, rating: e.target.value})}>
                        <option value="5">5 — Excellent</option>
                        <option value="4">4 — Good</option>
                        <option value="3">3 — Average</option>
                        <option value="2">2 — Poor</option>
                        <option value="1">1 — Very poor</option>
                      </select>
                    </div>
                    <div className="field full-field">
                      <label>Comments (optional)</label>
                      <textarea rows={4} maxLength={2000} value={feedbackForm.comments} onChange={e => setFeedbackForm({...feedbackForm, comments: e.target.value})} placeholder="Tell us what is working well or what could improve." />
                    </div>
                  </div>
                  <div className="form-actions"><button className="primary-button"><Send size={17} /> Submit feedback</button></div>
                </form>
              )}

              <div className="stats-grid feedback-stats">
                <StatCard label="Submissions" value={feedback.length} icon={MessageSquare} color="blue" detail="Feedback received" />
                <StatCard label="Average rating" value={feedback.length ? (feedback.reduce((s, f) => s + Number(f.rating), 0) / feedback.length).toFixed(1) : "—"} icon={BarChart3} color="green" detail="Out of 5 points" />
                <StatCard label="Service categories" value={new Set(feedback.map(f => f.category)).size} icon={ClipboardList} color="purple" detail="Categories covered" />
                <StatCard label="Needs attention" value={feedback.filter(f => f.rating <= 2).length} icon={AlertCircle} color="amber" detail="Ratings of 1 or 2" />
              </div>

              <div className="panel">
                <div className="panel-heading"><div><h3>Feedback submissions</h3><p>Ratings and comments submitted in this demo.</p></div></div>
                <div className="feedback-list">
                  {feedback.map(f => (
                    <div className="feedback-item" key={f.id}>
                      <div className="feedback-category-icon"><MessageSquare size={18} /></div>
                      <div className="feedback-body">
                        <strong>{f.category}</strong>
                        <div className="rating-stars">{"★".repeat(Number(f.rating))}{"☆".repeat(5 - Number(f.rating))} <span className="rating-label">{f.rating}/5</span></div>
                        <p>{f.comments || "No written comment provided."}</p>
                      </div>
                      <span className="feedback-tag">{Number(f.rating) >= 4 ? "Positive" : Number(f.rating) === 3 ? "Average" : "Needs attention"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {page === "reports" && role === "Admin" && (
            <>
              <div className="page-heading">
                <div><div className="eyebrow">ANALYTICS</div><h1>Grievance reports</h1><p>Review current complaint statistics and export a simple report.</p></div>
                <button className="primary-button" onClick={() => {
                  const csv = [
                    ["Complaint ID", "Subject", "Category", "Status", "Submitted", "Assigned To"].join(","),
                    ...grievances.map(g => [g.id, g.subject, g.category, g.status, g.date, g.assignedTo].map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
                  ].join("\n");
                  const url = URL.createObjectURL(new Blob([csv], {type: "text/csv"}));
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "grievance-report.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                  notify("Report exported");
                }}><ArrowUpRight size={17} /> Export CSV</button>
              </div>
              <div className="stats-grid">
                <StatCard label="Total cases" value={grievances.length} icon={FileText} color="blue" detail="All recorded grievances" />
                <StatCard label="Pending" value={grievances.filter(g => g.status !== "Resolved" && g.status !== "Rejected").length} icon={Clock} color="amber" detail="Require follow-up" />
                <StatCard label="Resolved" value={grievances.filter(g => g.status === "Resolved").length} icon={CheckCircle2} color="green" detail="Resolved cases" />
                <StatCard label="Confidential" value={grievances.filter(g => g.confidential).length} icon={ShieldCheck} color="purple" detail="Restricted-access cases" />
              </div>
              <div className="panel"><div className="panel-heading"><div><h3>Category breakdown</h3><p>Number of complaints by category.</p></div></div>
                {Array.from(new Set(grievances.map(g => g.category))).map(category => {
                  const count = grievances.filter(g => g.category === category).length;
                  return <div className="bar-row" key={category}><div><span>{category}</span><strong>{count}</strong></div><div className="bar-track"><div className="bar-fill" style={{width: `${count / Math.max(grievances.length, 1) * 100}%`}} /></div></div>;
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {notice && <div className="toast"><CheckCircle2 size={18} />{notice}</div>}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="eyebrow">{selected.id}</span><h2>{selected.subject}</h2></div>
              <button className="icon-button" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="modal-meta"><StatusBadge status={selected.status} /><span>{selected.category}</span><span>{selected.date}</span></div>
            {selected.confidential && <div className="confidential-banner"><ShieldCheck size={17} /> Confidential grievance</div>}
            <h4>Description</h4><p className="detail-description">{selected.description}</p>
            <div className="detail-info-grid">
              <div><small>Submitted by</small><strong>{selected.confidential && role !== "Admin" && role !== "Faculty" ? "Confidential" : selected.student}</strong></div>
              <div><small>Assigned to</small><strong>{selected.assignedTo}</strong></div>
            </div>
            <h4>Response / resolution</h4>
            <div className="response-box">{selected.response || "No response has been added yet."}</div>
            {(role === "Faculty" || role === "Admin") && (
              <>
                {role === "Admin" && (
                  <div className="field modal-field">
                    <label>Assign to officer</label>
                    <div className="inline-controls">
                      <select value={assignDraft} onChange={e => setAssignDraft(e.target.value)}>
                        <option>Dr. Priya</option><option>Prof. Kumar</option><option>Dr. Meena</option>
                      </select>
                      <button className="secondary-button" onClick={() => assignGrievance(selected.id)}>Assign</button>
                    </div>
                  </div>
                )}
                <div className="field modal-field">
                  <label>Update status</label>
                  <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}>
                    {["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <form className="field modal-field" onSubmit={addResponse}>
                  <label>Add response or remarks</label>
                  <textarea rows={3} value={responseDraft} onChange={e => setResponseDraft(e.target.value)} placeholder="Enter response or resolution notes..." required />
                  <button className="primary-button"><Send size={16} /> Save response</button>
                </form>
              </>
            )}
            <h4>Status and activity history</h4>
            <div className="timeline">
              {selected.history.map((entry, index) => (
                <div className="timeline-item" key={`${entry}-${index}`}><span /><p>{entry}</p></div>
              ))}
            </div>
            <div className="form-actions"><button className="secondary-button" onClick={() => setSelected(null)}>Close</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

function GrievanceTable({ items, role, onOpen }) {
  return (
    <div className="table-wrap">
      <table className="grievance-table">
        <thead>
          <tr>
            <th>Complaint</th>
            {role !== "Student" && <th>Student</th>}
            <th>Category</th>
            <th>Submitted</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map(g => (
            <tr key={g.id}>
              <td>
                <div className="complaint-cell">
                  <strong>{g.subject}</strong>
                  <small>{g.id}{g.confidential ? " · Confidential" : ""}</small>
                </div>
              </td>
              {role !== "Student" && <td>{g.confidential && role === "Faculty" ? "Restricted" : g.student}</td>}
              <td><span className="category-pill">{g.category}</span></td>
              <td>{g.date}</td>
              <td><StatusBadge status={g.status} /></td>
              <td><button className="icon-button view-button" title="View details" onClick={() => onOpen(g)}><Eye size={17} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <div className="empty-state">No complaints found.</div>}
    </div>
  );
}

export default App;
