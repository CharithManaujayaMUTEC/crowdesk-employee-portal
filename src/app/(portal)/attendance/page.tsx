"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarDays, Clock3, Download, Filter } from "lucide-react";
import { api, asArray } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { Attendance } from "@/lib/types";

export default function AttendancePage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Attendance[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const query = new URLSearchParams({ per_page: "100" });
      if (from) query.set("from", from);
      if (to) query.set("to", to);
      const result = await api<unknown>(`/attendance?${query.toString()}`, {}, token);
      setItems(asArray<Attendance>(result));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load attendance."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [token]);

  function exportCsv() {
    const header = ["Date", "Check in", "Check out", "Status", "Late minutes", "Working hours"];
    const rows = items.map((x) => [x.attendance_date, x.check_in || "", x.check_out || "", x.status || "", String(x.late_minutes ?? ""), String(x.working_hours ?? "")]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "crow-desk-attendance.csv"; a.click(); URL.revokeObjectURL(url);
  }

  const present = items.filter((x) => ["present", "late"].includes((x.status || "").toLowerCase())).length;
  const late = items.filter((x) => (x.status || "").toLowerCase() === "late").length;
  const hours = items.reduce((sum, x) => sum + Number(x.working_hours || 0), 0);

  return <div className="page-stack"><section className="page-intro"><div className="eyebrow"><span className="eyebrow-line" /> YOUR TIME, YOUR RECORD</div><h1>Attendance</h1><p>Keep track of your workday, one check-in at a time.</p></section>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <section className="stats-grid stats-grid-three"><div className="stat-card stat-blue"><div className="stat-top"><span>Days present</span><span className="stat-icon"><Activity size={19} /></span></div><div className="stat-value">{present}</div><div className="stat-foot">In the selected period</div></div><div className="stat-card stat-peach"><div className="stat-top"><span>Late arrivals</span><span className="stat-icon"><Clock3 size={19} /></span></div><div className="stat-value">{late}</div><div className="stat-foot">Recorded late check-ins</div></div><div className="stat-card stat-mint"><div className="stat-top"><span>Working hours</span><span className="stat-icon"><CalendarDays size={19} /></span></div><div className="stat-value">{hours.toFixed(1)}<small> hrs</small></div><div className="stat-foot">Sum of recorded hours</div></div></section>
    <section className="panel"><div className="panel-heading"><div><h3>Attendance history</h3><p>Review your recorded workdays.</p></div><button className="secondary-button" onClick={exportCsv} disabled={!items.length}><Download size={16} /> Export CSV</button></div><form className="filter-bar" onSubmit={(e) => { e.preventDefault(); load(); }}><label><span>From date</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label><span>To date</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label><button className="primary-button filter-button" type="submit"><Filter size={16} /> Apply filters</button></form>
      {loading ? <div className="loading-inline"><span className="spinner" /> Loading attendance…</div> : <div className="table-scroll"><table className="data-table"><thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th><th>Late by</th><th>Hours</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.attendance_date}</strong></td><td>{item.check_in ? String(item.check_in).slice(0,5) : "—"}</td><td>{item.check_out ? String(item.check_out).slice(0,5) : "—"}</td><td><span className={`pill pill-${(item.status || "unknown").toLowerCase()}`}>{item.status || "Not set"}</span></td><td>{item.late_minutes ? `${item.late_minutes} min` : "—"}</td><td>{item.working_hours ? `${item.working_hours} h` : "—"}</td></tr>)}</tbody></table>{items.length === 0 && <div className="empty-state"><CalendarDays size={28} /><strong>No attendance records found</strong><span>Try another date range or check back after your next check-in.</span></div>}</div>}
    </section>
  </div>;
}
