// src/pages/rooms/RoomFormDialog.tsx
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";

export type RoomFormValues = {
  RType: string;
  TotalRows: number;
  MaxColumns: number;
};

type RoomFormDialogProps = {
  open: boolean;
  title: string;
  initialValues?: RoomFormValues;
  onClose: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void> | void;
};

export default function RoomFormDialog({
  open,
  title,
  initialValues,
  onClose,
  onSubmit,
}: RoomFormDialogProps) {
  // Default values
  const defaultValues = { RType: "", TotalRows: 10, MaxColumns: 12 };

  const [values, setValues] = React.useState<RoomFormValues>(defaultValues);

  // Reset form khi mở dialog hoặc thay đổi initialValues
  React.useEffect(() => {
    if (open) {
      setValues(initialValues || defaultValues);
    }
  }, [initialValues, open]);

  const handleChange =
    (field: keyof RoomFormValues) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number = e.target.value;

        // Convert number inputs
        if (field === "TotalRows" || field === "MaxColumns") {
          value = Number(value);
        }

        setValues((prev) => ({ ...prev, [field]: value }));
      };

  const handleSubmit = async () => {
    // Validate cơ bản
    if (!values.RType || values.TotalRows < 1 || values.MaxColumns < 1) {
      alert("Vui lòng nhập tên phòng và số lượng ghế hợp lệ.");
      return;
    }
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Room Name / Type"
            placeholder="e.g., Premium Hall D"
            value={values.RType}
            onChange={handleChange("RType")}
            fullWidth
            size="small"
          />
          <TextField
            label="Number of Rows"
            type="number"
            value={values.TotalRows}
            onChange={handleChange("TotalRows")}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Seats per Row"
            type="number"
            value={values.MaxColumns}
            onChange={handleChange("MaxColumns")}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: "linear-gradient(135deg,#A855F7,#F97316)",
            fontWeight: 600
          }}
        >
          Save Room
        </Button>
      </DialogActions>
    </Dialog>
  );
}