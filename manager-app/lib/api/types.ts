/**
 * API Types
 * 
 * Типы данных, соответствующие контрактам бэкенда.
 * Синхронизированы с Prisma-схемой.
 */

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export type UserRole = 'MANAGER' | 'EMPLOYEE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'IN_PROGRESS' | 'DONE';
export type NotificationType = 'NEW_TASK' | 'DEADLINE' | 'COMMENT' | 'COMPLETED' | 'OVERDUE';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

// ─────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  position: string | null;
  avatar: string | null;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─────────────────────────────────────────────────────────────
// ORGANIZATION
// ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  createdAt?: string;
  _count?: {
    users: number;
    instantTasks: number;
    routineTemplates: number;
  };
}

// ─────────────────────────────────────────────────────────────
// INVITE
// ─────────────────────────────────────────────────────────────

export interface Invite {
  id: string;
  phone: string;
  code: string;
  status: InviteStatus;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  usedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// ─────────────────────────────────────────────────────────────
// EMPLOYEE
// ─────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  position: string | null;
  avatar: string | null;
  completedToday: number;
  totalToday: number;
  overdue: number;
}

export interface EmployeeProfile extends Employee {
  role: UserRole;
  assignedTasks: InstantTask[];
  routineTemplates: RoutineTemplate[];
  activityLogs: ActivityLog[];
  stats: {
    completedToday: number;
    overdue: number;
    totalAssigned: number;
  };
}

// ─────────────────────────────────────────────────────────────
// INSTANT TASK
// ─────────────────────────────────────────────────────────────

export interface InstantTask {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  photos: string[];
  completionPhotos: string[];
  createdAt: string;
  assignee: {
    id: string;
    name: string;
    avatar: string | null;
  };
  creator: {
    id: string;
    name: string;
  };
  _count?: {
    comments: number;
  };
}

export interface InstantTaskDetail extends InstantTask {
  comments: Comment[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  assigneeId: string;
  photos?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  completionPhotos?: string[];
}

// ─────────────────────────────────────────────────────────────
// ROUTINE
// ─────────────────────────────────────────────────────────────

export interface RoutineTask {
  id: string;
  title: string;
  order: number;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  repeatTime: string;
  employee: {
    id: string;
    name: string;
    position: string | null;
  };
  tasks: RoutineTask[];
}

export interface RoutineTaskWithStatus extends RoutineTask {
  completed: boolean;
  completedAt: string | null;
  photos: string[];
}

export interface DailyProgress {
  id: string;
  date: string;
  comments: string | null;
  tasks: RoutineTaskWithStatus[];
}

export interface CreateRoutineInput {
  name: string;
  employeeId: string;
  repeatTime?: string;
  tasks: string[]; // Array of task titles
}

export interface UpdateRoutineInput {
  name?: string;
  repeatTime?: string;
  tasks?: string[];
}

// ─────────────────────────────────────────────────────────────
// COMMENT
// ─────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  message: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
  };
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  taskId: string | null;
}

// ─────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  stats: {
    completedToday: number;
    overdue: number;
    pending: number;
    employeeCount: number;
    routineTemplateCount: number;
  };
  recentActivity: ActivityLog[];
}

export interface EmployeeStats {
  stats: {
    completedToday: number;
    pendingToday: number;
    overdue: number;
  };
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  employee?: string;
  action: string;
  time: string;
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

