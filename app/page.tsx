export default function Dashboard() {
  return (
    <div className="app">
      {/* ══ TOP NAV ══════════════════════════════ */}
      <nav className="topnav">
        <div className="nav-logo">
          <div className="nav-logo-dot"></div>
          SyncTeam
        </div>
        <div className="nav-center">
          <div className="nav-project-pill">
            <span>CS Capstone · Sprint 3</span>
            &nbsp;/&nbsp; Task Board
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-avatar">KM</div>
          <div className="nav-avatar" style={{ borderColor: 'transparent' }}>JS</div>
          <div className="nav-avatar" style={{ borderColor: 'transparent' }}>AT</div>
        </div>
      </nav>

      {/* ══ SIDEBAR ══════════════════════════════ */}
      <aside className="sidebar">
        <div className="sidebar-section-label">Workspace</div>
        <ul className="sidebar-nav">
          <li className="active">
            <a href="#">
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
              Task Board
              <span className="sidebar-badge">14</span>
            </a>
          </li>
          <li>
            <a href="#">
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" />
              </svg>
              Timeline
            </a>
          </li>
        </ul>

        <div className="wood-divider"></div>

        <div className="sidebar-section-label">Team</div>
        <div className="team-mini">
          <div className="team-row">
            <div className="team-avatar-sm" style={{ background: '#2a3a4a', color: '#7fb3d3' }}>KM</div>
            <span className="team-name">Kofi M.</span>
            <div className="status-dot" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }}></div>
          </div>
          <div className="team-row">
            <div className="team-avatar-sm" style={{ background: '#3a2a3a', color: '#c49fd3' }}>JS</div>
            <span className="team-name">Jana S.</span>
            <div className="status-dot" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }}></div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN BOARD ═════════════════════════════════ */}
      <main className="main">
        <div className="project-header">
          <div className="project-eyebrow">Sprint 3 · Week 2 of 4</div>
          <h1 className="project-title">CS Capstone Project</h1>
          <div className="project-meta">
            <span>14 tasks active</span><div className="meta-sep"></div>
            <span>4 members</span><div className="meta-sep"></div>
            <span className="ai-badge"><span className="ai-badge-dot"></span>AI Active</span>
          </div>
        </div>

        {/* Glassmorphism Progress Bar */}
        <div className="progress-module">
          <div className="progress-header">
            <span className="progress-label">Sprint Progress</span>
            <div>
              <span className="progress-pct">67</span>
              <span className="progress-pct-sub">% complete</span>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill"></div>
          </div>
        </div>

        <div className="wood-accent-wide"></div>

        {/* Task Board */}
        <div className="board-header">
          <span className="board-title">Task Board</span>
          <div className="board-actions">
            <button className="btn-ghost">Filter</button>
            <button className="btn-gold">+ Add Task</button>
          </div>
        </div>

        <div className="kanban">
          {/* Kolom TODO */}
          <div className="column">
            <div className="col-header">
              <div className="col-indicator" style={{ background: 'var(--grey-muted)' }}></div>
              <span className="col-name">Backlog</span>
              <span className="col-count">2</span>
            </div>
            <div className="task-card prio-mid">
              <div className="task-title">Define evaluation metrics for ML model accuracy benchmarking</div>
              <div className="task-meta-row">
                <span className="task-tag" style={{ background: 'var(--amber-dim)', color: '#e0a050' }}>Research</span>
                <span className="task-estimate">4h</span>
              </div>
            </div>
          </div>

          {/* Kolom IN PROGRESS */}
          <div className="column">
            <div className="col-header">
              <div className="col-indicator" style={{ background: 'var(--amber)' }}></div>
              <span className="col-name">In Progress</span>
              <span className="col-count">3</span>
            </div>
            <div className="task-card prio-high">
              <div className="task-title">Implement AI prompt-chaining orchestrator</div>
              <div className="task-meta-row">
                <span className="task-tag" style={{ background: 'var(--rose-dim)', color: '#d07080' }}>Backend</span>
                <span className="task-estimate">8h</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ══ RIGHT PANEL (AI) ════════════════════════════ */}
      <aside className="right-panel">
        <div className="panel-section-head">
          <span className="panel-title">AI Suggestions</span>
        </div>
        <div className="ai-card">
          <div className="ai-card-header">
            <span className="ai-chip">Reorder</span>
            <span className="ai-card-type">Priority shift</span>
          </div>
          <p className="ai-card-text">
            <strong>Move "Unit Tests"</strong> before the ML metrics task to unblock the pipeline.
          </p>
          <div className="ai-card-actions">
            <button className="btn-accept">Accept</button>
            <button className="btn-dismiss">Dismiss</button>
          </div>
        </div>
      </aside>
    </div>
  );
}