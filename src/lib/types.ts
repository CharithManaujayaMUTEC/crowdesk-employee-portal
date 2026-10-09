export type PortalUser = {
  id: number;
  name: string;
  email: string;
  mobile?: string | null;
  is_super_admin: boolean;
  employee: Employee;
};

export type Employee = {
  id: number;
  employee_no?: string | null;
  name: string;
  preferred_name?: string | null;
  profile_photo?: string | null;
  email?: string | null;
  personal_email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  designation?: string | null;
  job_title?: string | null;
  status?: string | null;
  employment_type?: string | null;
  work_location?: string | null;
  work_mode?: string | null;
  join_date?: string | null;
  basic_salary?: string | number | null;
};

export type LeaveType = {
  id: number;
  name: string;
  code?: string;
  allocation?: string | number;
  allocation_period?: string;
  is_paid?: boolean;
  is_active?: boolean;
  description?: string | null;
};

export type LeaveRequest = {
  id: number;
  from_date: string;
  to_date: string;
  days: string | number;
  status: string;
  reason?: string | null;
  approval_notes?: string | null;
  leave_type?: LeaveType;
  leaveType?: LeaveType;
  employee?: Employee;
  created_at?: string;
};

export type Attendance = {
  id: number;
  attendance_date: string;
  check_in?: string | null;
  check_out?: string | null;
  status?: string | null;
  late_minutes?: number | null;
  working_hours?: string | number | null;
  notes?: string | null;
};

export type EmployeeTask = {
  id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  completed_at?: string | null;
  employee?: Employee;
  created_at?: string;
};
