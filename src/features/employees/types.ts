import { AsyncStatus } from '@/shared/redux/enums';

export interface Employee {
  id: string;
  name: string;
  firstName: string;
  surname: string;
  avatarImageUrl?: string;
  department: string;
  office: string;
  teams: string[];
  age: number | string; // Age or '-' if unknown
  supervisor?: string; // Supervisor name or '-' if unknown
}

export interface EmployeesState {
  employees: Employee[];
  status: AsyncStatus;
  error: string | null;
}

