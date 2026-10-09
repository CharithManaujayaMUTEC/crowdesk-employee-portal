"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Circle, Clock3, ListTodo, RotateCcw } from "lucide-react";
import { api, asArray } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { EmployeeTask } from "@/lib/types";

const statuses = ["all", "pending", "in_progress", "completed", "cancelled"] as const;
export default function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  async function load() {
    if (!token) return;
    setLoading(true); setError("");
    try { setTasks(asArray<EmployeeTask>(await api<unknown>("/tasks?per_page=100", {}, token))); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load tasks."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [token]);

  async function update(task: EmployeeTask, status: EmployeeTask["status"]) {
    setBusyId(task.id); setError("");
    try {
      await api(`/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      setTasks((current) => current.map((x) => x.id === task.id ? { ...x, status } : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update task."); }
    finally { setBusyId(null); }
  }
  const shown = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const complete = tasks.filter((t) => t.status === "completed").length;
  const percentage = tasks.length ? Math.round(complete / tasks.length * 100) : 0;

  return <div className="page-stack"><section className="page-intro"><div className="eyebrow"><span className="eyebrow-line" /> ONE THING AT A TIME</div><h1>My tasks</h1><p>Stay focused, make progress, and celebrate the small wins.</p></section>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <section className="task-progress-panel"><div className="task-progress-copy"><div className="progress-icon"><ListTodo size={22} /></div><div><span>YOUR PROGRESS</span><h2>{complete} of {tasks.length} tasks completed</h2><p>{tasks.length ? `${tasks.length - complete} task${tasks.length - complete === 1 ? "" : "s"} left to work on` : "Your assigned tasks will show here."}</p></div></div><div className="progress-number">{percentage}<small>%</small></div><div className="progress-track"><span style={{ width: `${percentage}%` }} /></div></section>
    <section className="panel"><div className="panel-heading"><div><h3>Task board</h3><p>Your assigned work, all in one view.</p></div><button className="secondary-button" onClick={load}><RotateCcw size={15} /> Refresh</button></div><div className="filter-tabs">{statuses.map((s) => <button key={s} className={filter === s ? "filter-tab active" : "filter-tab"} onClick={() => setFilter(s)}>{s === "all" ? "All tasks" : s.replace("_", " ") } <span>{s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length}</span></button>)}</div>
      {loading ? <div className="loading-inline"><span className="spinner" /> Loading tasks…</div> : <div className="task-board">{shown.map((task) => <article className={`task-card ${task.status === "completed" ? "task-card-complete" : ""}`} key={task.id}><div className="task-card-top"><span className={`priority-dot priority-${task.priority}`} /> <span className={`pill pill-${task.status}`}>{task.status.replace("_", " ")}</span></div><h4>{task.title}</h4>{task.description && <p>{task.description}</p>}<div className="task-card-meta"><span className="priority-label"> <span className={`priority-text priority-text-${task.priority}`}>{task.priority} priority</span></span><span><Clock3 size={14} /> {task.due_date ? `Due ${task.due_date}` : "No due date"}</span></div><div className="task-card-actions">{task.status !== "completed" && task.status !== "cancelled" ? <button className="primary-button task-action" disabled={busyId === task.id} onClick={() => update(task, task.status === "pending" ? "in_progress" : "completed")}>{busyId === task.id ? "Saving…" : task.status === "pending" ? <><Clock3 size={15} /> Start task</> : <><Check size={15} /> Mark complete</>}</button> : task.status === "completed" ? <span className="success-note"><CheckCircle2 size={16} /> Nice work — completed</span> : <span className="muted-note">This task was cancelled.</span>}</div></article>)}{shown.length === 0 && <div className="empty-state"><ListTodo size={28} /><strong>Nothing in this view</strong><span>Try another filter or enjoy the breathing room.</span></div>}</div>}
    </section>
  </div>;
}
