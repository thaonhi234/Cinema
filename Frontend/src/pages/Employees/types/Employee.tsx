import type { EmployeeRole } from "./EmployeeRole"

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  salary: string; // số đã format
  role: EmployeeRole;
};
