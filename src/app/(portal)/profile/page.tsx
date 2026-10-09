"use client";

import { BriefcaseBusiness, CalendarDays, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function Detail({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: typeof UserRound }) {
  return <div className="profile-detail"><div className="detail-icon">{Icon ? <Icon size={17} /> : <UserRound size={17} />}</div><div><span>{label}</span><strong>{value || "Not provided"}</strong></div></div>;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const employee = user?.employee;
  const displayName = employee?.preferred_name || employee?.name || user?.name || "Employee";
  return <div className="page-stack"><section className="page-intro"><div className="eyebrow"><span className="eyebrow-line" /> YOUR CROW PROFILE</div><h1>My profile</h1><p>Your work information in one convenient place.</p></section>
    <section className="profile-hero"><div className="profile-avatar-large">{displayName.slice(0,1).toUpperCase()}</div><div className="profile-hero-main"><span className="pill pill-approved"><span className="live-dot" /> {employee?.status || "Active"}</span><h2>{displayName}</h2><p>{employee?.designation || employee?.position || employee?.job_title || "Team member"}{employee?.department ? ` · ${employee.department}` : ""}</p><div className="profile-id">{employee?.employee_no ? `Employee ID: ${employee.employee_no}` : "Crow.lk employee"}</div></div><div className="profile-shield"><ShieldCheck size={20} /><span>Account linked</span></div></section>
    <div className="profile-sections"><section className="panel"><div className="panel-heading"><div><h3>Contact information</h3><p>How your team can reach you.</p></div></div><div className="profile-detail-grid"><Detail label="Work email" value={employee?.email || user?.email} icon={Mail} /><Detail label="Personal email" value={employee?.personal_email} icon={Mail} /><Detail label="Phone number" value={employee?.phone || user?.mobile} icon={Phone} /><Detail label="Work location" value={employee?.work_location} icon={MapPin} /></div></section><section className="panel"><div className="panel-heading"><div><h3>Employment details</h3><p>Your role and work arrangement.</p></div></div><div className="profile-detail-grid"><Detail label="Department" value={employee?.department} icon={BriefcaseBusiness} /><Detail label="Designation" value={employee?.designation || employee?.position || employee?.job_title} icon={BriefcaseBusiness} /><Detail label="Employment type" value={employee?.employment_type} icon={UserRound} /><Detail label="Joining date" value={employee?.join_date} icon={CalendarDays} /><Detail label="Work mode" value={employee?.work_mode} icon={MapPin} /><Detail label="Account email" value={user?.email} icon={ShieldCheck} /></div></section></div>
    <div className="info-banner"><ShieldCheck size={18} /> For changes to your personal or employment details, contact your Crow.lk administrator. Sensitive employee information is not editable in this portal.</div>
  </div>;
}
