import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CssBaseline from '@mui/material/CssBaseline'; // Using MUI CssBaseline for consistent styling instead of Tailwind base styles
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
