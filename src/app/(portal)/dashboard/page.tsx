"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CalendarCheck2, CalendarClock, CheckCircle2, Clock3, Coffee, Sunrise, WalletCards } from "lucide-react";
import { api, asArray, unwrapObject } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { Attendance, EmployeeTask, LeaveRequest } from "@/lib/types";

type DashboardData = {
  employee?: { name?: string; preferred_name?: string; department?: string; designation?: string; join_date?: string };
  today?: { date?: string; attendance?: Attendance | null };
  leave_summary?: { pending?: number; approved?: number };
  latest_payroll?: { period?: string; net_salary?: number | string; payment_date?: string } | null;
  can_manage?: boolean;
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!token) return;
    setError("");
    try {
      const [d, t, l] = await Promise.all([
        api<unknown>("/dashboard", {}, token),
        api<unknown>("/tasks?per_page=5", {}, token),
        api<unknown>("/leaves?per_page=5", {}, token)
      ]);
      setDash(unwrapObject<DashboardData>(d) || {});
      setTasks(asArray<EmployeeTask>(t).slice(0, 5));
      setLeaves(asArray<LeaveRequest>(l).slice(0, 4));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load dashboard."); }
  }

  useEffect(() => { load(); }, [token]);

  async function attendanceAction(action: "check-in" | "check-out") {
    if (!token) return;
    setBusy(true); setError("");
    try {
      await api(`/attendance/${action}`, { method: "POST", body: JSON.stringify({}) }, token);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Attendance update failed."); }
    finally { setBusy(false); }
  }

  const today = dash?.today?.attendance;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const greetingName = user?.employee?.preferred_name || user?.employee?.name || user?.name?.split(" ")[0] || "there";
  const dateText = new Intl.DateTimeFormat("en-LK", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return <div className="page-stack">
    <section className="welcome-banner"><div className="welcome-content"><div className="eyebrow welcome-eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL WORKSPACE</div><h1>Good day, {greetingName}<span className="wave">✦</span></h1><p>Make today count. Here's your day at a glance.</p><div className="welcome-date"><CalendarCheck2 size={16} /> {dateText}</div></div><div className="welcome-art"><div className="art-ring art-ring-one" /><div className="art-ring art-ring-two" /><div className="art-card"><Sunrise size={31} /><span>One step at a time.</span><small>You've got this.</small></div></div></section>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <div className="section-heading"><div><h2>Your overview</h2><p>A little snapshot of what's happening.</p></div><span className="section-note"><span className="live-dot" /> Live workspace</span></div>
    <section className="stats-grid">
      <div className="stat-card stat-blue"><div className="stat-top"><span>Attendance today</span><span className="stat-icon"><Activity size={19} /></span></div><div className="stat-value">{today?.check_in ? "Checked in" : "Not checked in"}</div><div className="stat-foot">{today?.check_in ? `Started at ${String(today.check_in).slice(0,5)}` : "Your workday starts here"}</div><div className="stat-progress"><span style={{ width: today?.check_in ? "100%" : "0%" }} /></div></div>
      <div className="stat-card stat-mint"><div className="stat-top"><span>Leave requests</span><span className="stat-icon"><CalendarClock size={19} /></span></div><div className="stat-value">{dash?.leave_summary?.pending ?? 0}</div><div className="stat-foot">Waiting for a decision</div><Link className="stat-link" href="/leaves">View requests <ArrowRight size={14} /></Link></div>
      <div className="stat-card stat-peach"><div className="stat-top"><span>My tasks</span><span className="stat-icon"><CheckCircle2 size={19} /></span></div><div className="stat-value">{completed}<small> / {tasks.length}</small></div><div className="stat-foot">Completed in your recent tasks</div><div className="stat-progress"><span style={{ width: `${tasks.length ? Math.round(completed / tasks.length * 100) : 0}%` }} /></div></div>
      <div className="stat-card stat-lilac"><div className="stat-top"><span>Approved leave</span><span className="stat-icon"><Coffee size={19} /></span></div><div className="stat-value">{dash?.leave_summary?.approved ?? 0}</div><div className="stat-foot">Approved requests</div><Link className="stat-link" href="/leaves">Leave overview <ArrowRight size={14} /></Link></div>
    </section>
    <section className="dashboard-grid">
      <div className="panel attendance-panel"><div className="panel-heading"><div><h3>Today's attendance</h3><p>Keep your day up to date.</p></div><span className="panel-heading-icon"><Clock3 size={19} /></span></div><div className="time-row"><div className="time-block"><span>CHECK IN</span><strong>{today?.check_in ? String(today.check_in).slice(0,5) : "— — : — —"}</strong><small>{today?.check_in ? "You're on the clock" : "Not recorded yet"}</small></div><div className="time-divider" /><div className="time-block"><span>CHECK OUT</span><strong>{today?.check_out ? String(today.check_out).slice(0,5) : "— — : — —"}</strong><small>{today?.check_out ? "Day wrapped up" : "See you later"}</small></div></div><div className="attendance-actions">{!today?.check_in ? <button className="primary-button" disabled={busy} onClick={() => attendanceAction("check-in")}>{busy ? "Recording…" : "Check in now"} <ArrowRight size={16} /></button> : !today?.check_out ? <button className="primary-button" disabled={busy} onClick={() => attendanceAction("check-out")}>{busy ? "Recording…" : "Check out"} <ArrowRight size={16} /></button> : <div className="success-note"><CheckCircle2 size={17} /> Attendance completed for today</div>}<Link href="/attendance" className="text-link">View attendance history <ArrowRight size={15} /></Link></div></div>
      <div className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Jump straight into it.</p></div></div><div className="quick-actions"><Link href="/leaves" className="quick-action"><span className="quick-icon quick-blue"><CalendarCheck2 size={20} /></span><span><strong>Request leave</strong><small>Plan some time away</small></span><ArrowRight size={16} /></Link><Link href="/tasks" className="quick-action"><span className="quick-icon quick-peach"><CheckCircle2 size={20} /></span><span><strong>View my tasks</strong><small>Keep work moving</small></span><ArrowRight size={16} /></Link><Link href="/profile" className="quick-action"><span className="quick-icon quick-mint"><WalletCards size={20} /></span><span><strong>My profile</strong><small>Your work details</small></span><ArrowRight size={16} /></Link></div></div>
    </section>
    <section className="dashboard-grid lower-grid"><div className="panel"><div className="panel-heading"><div><h3>Recent tasks</h3><p>Small steps make big progress.</p></div><Link className="text-link" href="/tasks">All tasks <ArrowRight size={14} /></Link></div><div className="list-rows">{tasks.map((task) => <div className="task-row" key={task.id}><span className={`task-status status-${task.status}`}><CheckCircle2 size={15} /></span><div className="row-main"><strong>{task.title}</strong><small>{task.due_date ? `Due ${task.due_date}` : "No due date"}</small></div><span className={`pill pill-${task.status}`}>{task.status.replace("_", " ")}</span></div>)}{tasks.length === 0 && <div className="empty-state compact"><CheckCircle2 size={24} /><strong>All clear for now</strong><span>No tasks assigned yet.</span></div>}</div></div><div className="panel"><div className="panel-heading"><div><h3>Leave activity</h3><p>Your latest requests.</p></div><Link className="text-link" href="/leaves">View all <ArrowRight size={14} /></Link></div><div className="list-rows">{leaves.map((leave) => <div className="leave-row" key={leave.id}><span className="leave-date-badge"><CalendarCheck2 size={17} /></span><div className="row-main"><strong>{leave.leave_type?.name || leave.leaveType?.name || "Leave request"}</strong><small>{leave.from_date} – {leave.to_date}</small></div><span className={`pill pill-${leave.status}`}>{leave.status}</span></div>)}{leaves.length === 0 && <div className="empty-state compact"><CalendarClock size={24} /><strong>No leave requests</strong><span>Your requests will show up here.</span></div>}</div></div></section>
  </div>;
}
