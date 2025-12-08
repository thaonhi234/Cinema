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
  const [values, setValues] = React.useState<RoomFormValues>(
    initialValues || { RType: "", TotalRows: 10, MaxColumns: 12 }
  );

  React.useEffect(() => {
    if (initialValues) setValues(initialValues);
    else setValues({ RType: "", TotalRows: 10, MaxColumns: 12 });
  }, [initialValues, open]);

  const handleChange =
    (field: keyof RoomFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "RType" ? e.target.value : Number(e.target.value || 0);
      setValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async () => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Room type / name"
            value={values.RType}
            onChange={handleChange("RType")}
            fullWidth
            size="small"
          />
          <TextField
            label="Rows"
            type="number"
            value={values.TotalRows}
            onChange={handleChange("TotalRows")}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Seats per row"
            type="number"
            value={values.MaxColumns}
            onChange={handleChange("MaxColumns")}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
