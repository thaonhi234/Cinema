// SỬA: Đổi tên các role thành chữ thường để khớp với Backend
export type EmployeeRole =
  | "manager"
  | "staff" // Hoặc 'ticket seller' nếu bạn dùng từ đó
  | "technician"
  | "security"
  | "accountant";
  
// Sau đó, bạn cần cập nhật RoleChip.tsx để mapping lại chữ thường sang style hiển thị.