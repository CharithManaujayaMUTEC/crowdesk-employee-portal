"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, Check, CircleX, Plus, Send } from "lucide-react";
import { api, asArray } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { LeaveRequest, LeaveType } from "@/lib/types";

export default function LeavesPage() {
  const { token } = useAuth();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const [typeResponse, leaveResponse] = await Promise.all([api<unknown>("/leave-types", {}, token), api<unknown>("/leaves?per_page=100", {}, token)]);
      setTypes(asArray<LeaveType>(typeResponse));
      setLeaves(asArray<LeaveRequest>(leaveResponse));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load leave data."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    if (!from || !to || to < from) { setError("Please choose a valid date range."); setSaving(false); return; }
    try {
      await api("/leaves", { method: "POST", body: JSON.stringify({ leave_type_id: Number(type), from_date: from, to_date: to, reason: reason.trim() }) }, token);
      setFrom(""); setTo(""); setReason(""); setType("");
      setSuccess("Your leave request has been submitted.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit leave request."); }
    finally { setSaving(false); }
  }

  async function cancel(id: number) {
    setError(""); setSuccess("");
    try { await api(`/leaves/${id}/cancel`, { method: "POST", body: JSON.stringify({}) }, token); setSuccess("Leave request cancelled."); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not cancel request."); }
  }

  const pending = leaves.filter((x) => x.status === "pending").length;
  const approved = leaves.filter((x) => x.status === "approved").length;

  return <div className="page-stack"><section className="page-intro"><div className="eyebrow"><span className="eyebrow-line" /> TIME TO RECHARGE</div><h1>Leave management</h1><p>Plan time away, submit requests, and see where things stand.</p></section>
    {error && <div className="alert-error" role="alert">{error}</div>}{success && <div className="alert-success" role="status"><Check size={17} />{success}</div>}
    <section className="stats-grid stats-grid-three"><div className="stat-card stat-blue"><div className="stat-top"><span>My requests</span><span className="stat-icon"><CalendarDays size={19} /></span></div><div className="stat-value">{leaves.length}</div><div className="stat-foot">All submitted requests</div></div><div className="stat-card stat-peach"><div className="stat-top"><span>Pending</span><span className="stat-icon"><CalendarPlus size={19} /></span></div><div className="stat-value">{pending}</div><div className="stat-foot">Waiting for review</div></div><div className="stat-card stat-mint"><div className="stat-top"><span>Approved</span><span className="stat-icon"><Check size={19} /></span></div><div className="stat-value">{approved}</div><div className="stat-foot">Approved requests</div></div></section>
    <section className="panel"><div className="panel-heading"><div><h3>Request time off</h3><p>Tell your manager when you need a break.</p></div><span className="panel-heading-icon"><Plus size={19} /></span></div><form className="leave-form" onSubmit={submit}><label><span>Leave type</span><select required value={type} onChange={(e) => setType(e.target.value)}><option value="">Choose a leave type</option>{types.map((x) => <option key={x.id} value={x.id}>{x.name}{x.allocation !== undefined ? ` · ${x.allocation} per ${x.allocation_period || "year"}` : ""}</option>)}</select></label><label><span>Start date</span><input type="date" required value={from} onChange={(e) => setFrom(e.target.value)} /></label><label><span>End date</span><input type="date" min={from || undefined} required value={to} onChange={(e) => setTo(e.target.value)} /></label><label className="leave-reason"><span>Reason <small>(optional)</small></span><textarea maxLength={2000} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Add a short note for your manager…" /></label><div className="form-actions"><span className="form-hint">Requests are sent to your manager for review.</span><button className="primary-button" type="submit" disabled={saving || !types.length}>{saving ? "Submitting…" : "Submit request"} <Send size={16} /></button></div></form>{!loading && types.length === 0 && <p className="inline-warning">No active leave types are configured yet. Please contact your administrator.</p>}</section>
    <section className="panel"><div className="panel-heading"><div><h3>My leave requests</h3><p>Track your submissions and decisions.</p></div><span className="count-chip">{leaves.length} total</span></div>{loading ? <div className="loading-inline"><span className="spinner" /> Loading leave requests…</div> : <div className="leave-request-list">{leaves.map((leave) => { const leaveType = leave.leave_type || leave.leaveType; return <article className="leave-request-card" key={leave.id}><div className="leave-card-icon"><CalendarDays size={20} /></div><div className="leave-card-main"><div className="leave-card-title"><h4>{leaveType?.name || "Leave request"}</h4><span className={`pill pill-${leave.status}`}>{leave.status}</span></div><p>{leave.from_date} <span>→</span> {leave.to_date} <b>·</b> {leave.days} day(s)</p>{leave.reason && <div className="leave-reason-text">{leave.reason}</div>}{leave.approval_notes && <div className="approval-note"><strong>Manager note:</strong> {leave.approval_notes}</div>}</div>{["pending", "approved"].includes(leave.status) && <button className="icon-button cancel-request" onClick={() => cancel(leave.id)} title="Cancel request" aria-label="Cancel leave request"><CircleX size={19} /></button>}</article>; })}{leaves.length === 0 && <div className="empty-state"><CalendarPlus size={28} /><strong>No requests yet</strong><span>Your leave requests will appear here once submitted.</span></div>}</div>}</section>
  </div>;
}
