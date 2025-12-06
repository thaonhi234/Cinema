import { Chip } from "@mui/material";
import type { EmployeeRole } from "./types/EmployeeRole"


// ================== ROLECHIP COMPONENTS ==================

export default function RoleChip({ role }: { role: EmployeeRole }) {
  const map: Record<
    EmployeeRole,
    { bg: string; color: string }
  > = {
    Manager: {
      bg: "rgba(216,180,254,0.35)",
      color: "#7C3AED",
    },
    "Ticket Seller": {
      bg: "rgba(191,219,254,0.7)",
      color: "#2563EB",
    },
    Technician: {
      bg: "rgba(254,215,170,0.7)",
      color: "#EA580C",
    },
    Security: {
      bg: "rgba(229,231,235,0.9)",
      color: "#4B5563",
    },
    Accountant: {
      bg: "rgba(187,247,208,0.8)",
      color: "#16A34A",
    },
  };

  const style = map[role];

  return (
    <Chip
      label={role}
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
