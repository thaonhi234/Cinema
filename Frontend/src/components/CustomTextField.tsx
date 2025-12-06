import type { TextFieldProps } from "@mui/material";
import TextField from "@mui/material/TextField";

export default function CustomTextField(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      variant={props.variant ?? "outlined"}
      sx={{
        // Bo góc
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
        },

        // Màu chữ trong ô input
        "& .MuiInputBase-input": {
          color: "#fff",
        },

        // Label mặc định
        "& .MuiInputLabel-root": {
          color: "rgba(255,255,255,0.6)",
        },

        // Label khi focus
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#fff",
        },

        // ⭐ Viền mặc định
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(255,255,255,0.4)",
        },

        // ⭐ Viền khi hover
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#fff",
        },

        // ⭐ Viền khi focus
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#ffffffff",
        },

        ...props.sx, // cho phép override thêm nếu cần
      }}
    />
  );
}
