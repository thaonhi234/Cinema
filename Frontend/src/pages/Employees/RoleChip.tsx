// TRONG src/pages/EmployeesPage/RoleChip.tsx

import { Chip } from "@mui/material";

// SỬA: Định nghĩa kiểu dữ liệu cho Backend Keys (chữ thường)
type EmployeeRoleKey =
  | "manager"
  | "staff"
  | "technician"
  | "security"
  | "accountant"
  | string; 


// MAPPING SỬ DỤNG CHỮ THƯỜNG (keys từ Backend)
const roleMap: Record<
    EmployeeRoleKey, // Key là chữ thường
    { bg: string; color: string; display: string } // Thêm trường display
  > = {
    manager: {
      bg: "rgba(216,180,254,0.35)",
      color: "#7C3AED",
      display: "Manager",
    },
    "ticket seller": { // Thay thế 'staff' bằng 'ticket seller' nếu cần
      bg: "rgba(191,219,254,0.7)",
      color: "#2563EB",
      display: "Ticket Seller",
    },
    staff: { // Thêm mapping cho 'staff' nếu có trong DB
      bg: "rgba(191,219,254,0.7)",
      color: "#2563EB",
      display: "Ticket Seller",
    },
    technician: {
      bg: "rgba(254,215,170,0.7)",
      color: "#EA580C",
      display: "Technician",
    },
    security: {
      bg: "rgba(229,231,235,0.9)",
      color: "#4B5563",
      display: "Security",
    },
    accountant: {
      bg: "rgba(187,247,208,0.8)",
      color: "#16A34A",
      display: "Accountant",
    },
    // Fallback cho bất kỳ role nào khác
    default: {
        bg: "rgba(229,231,235,0.9)",
        color: "#4B5563",
        display: "Staff",
    } as any, // Ép kiểu tạm thời cho TypeScript chấp nhận
  };


export default function RoleChip({ role }: { role: string }) {
  // Chuẩn hóa role về chữ thường (manager, staff)
  const normalizedRole = role.toLowerCase(); 
  
  // Chọn style, sử dụng 'default' nếu không tìm thấy key
  const style = roleMap[normalizedRole] || roleMap['default'];

  return (
    <Chip
      label={style.display} // Hiển thị tên đã format (Manager, Ticket Seller)
      size="small"
      sx={{
        borderRadius: 999,
        px: 1.5,
        fontSize: 12,
        fontWeight: 500,
        bgcolor: style.bg,
        color: style.color,
      }}
    />
  );
}