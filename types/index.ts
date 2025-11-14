export type UserRole = 'manager' | 'employee';

export interface Employee {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  completedToday: number;
  totalToday: number;
  overdue: number;
}

export interface RoutineTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  photos?: string[];
  completionPhotos?: string[];
}

export interface RoutineTemplate {
  id: string;
  name: string;
  employeeId: string;
  tasks: RoutineTask[];
  repeatTime: string;
}

export interface InstantTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  employeeId: string;
  status: 'in-progress' | 'done';
  comments?: string[];
  photos?: string[];
  completionPhotos?: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  taskId?: string;
}