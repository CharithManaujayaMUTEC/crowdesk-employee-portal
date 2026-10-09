"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CheckCheck, ClipboardCheck, Clock3, X } from "lucide-react";
import { api, asArray } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { LeaveRequest } from "@/lib/types";

export default function ApprovalsPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try { setItems(asArray<LeaveRequest>(await api<unknown>("/leave-approvals?per_page=100", {}, token))); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load approvals."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  async function decide(item: LeaveRequest, status: "approved" | "rejected") {
    setBusy(item.id); setError(""); setSuccess("");
    try {
      await api(`/leave-approvals/${item.id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      setItems((current) => current.filter((x) => x.id !== item.id));
      setSuccess(`Leave request ${status}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not process approval."); }
    finally { setBusy(null); }
  }

  return <div className="page-stack"><section className="page-intro"><div className="eyebrow"><span className="eyebrow-line" /> KEEP YOUR TEAM MOVING</div><h1>Leave approvals</h1><p>Review requests from your team and help them plan ahead.</p></section>
    {error && <div className="alert-error" role="alert">{error}</div>}{success && <div className="alert-success" role="status"><Check size={17} />{success}</div>}
    {!user?.is_super_admin && <div className="info-banner"><ClipboardCheck size={18} /> You can review requests submitted by your direct reports. Access is controlled by the Crow Desk API.</div>}
    <section className="panel"><div className="panel-heading"><div><h3>Requests waiting for review</h3><p>Only pending requests are shown here.</p></div><span className="count-chip">{items.length} pending</span></div>
      {loading ? <div className="loading-inline"><span className="spinner" /> Loading requests…</div> : <div className="approval-list">{items.map((item) => <article className="approval-card" key={item.id}><div className="approval-avatar">{(item.employee?.preferred_name || item.employee?.name || "E").slice(0,1).toUpperCase()}</div><div className="approval-main"><div className="approval-title-row"><h4>{item.employee?.preferred_name || item.employee?.name || "Employee"}</h4><span className="pill pill-pending">Pending</span></div><p className="approval-type">{item.leave_type?.name || item.leaveType?.name || "Leave request"} <span>·</span> {item.days} day(s)</p><div className="approval-dates"><Clock3 size={14} /> {item.from_date} <span>→</span> {item.to_date}</div>{item.reason && <p className="approval-reason">{item.reason}</p>}</div><div className="approval-actions"><button className="approve-button" disabled={busy === item.id} onClick={() => decide(item, "approved")}><CheckCheck size={16} /> Approve</button><button className="reject-button" disabled={busy === item.id} onClick={() => decide(item, "rejected")}><X size={16} /> Reject</button></div></article>)}{items.length === 0 && <div className="empty-state"><ClipboardCheck size={28} /><strong>You&apos;re all caught up</strong><span>No pending leave approvals right now.</span></div>}</div>}
    </section>
  </div>;
}
