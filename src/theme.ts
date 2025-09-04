import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4A7B9D",
    },
    secondary: {
      main: "#E88B6F",
    },
    background: {
      default: "#F3F7F0",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#5D6D7E",
    },
    error: {
      main: "#D16B5F",
    },
    success: {
      main: "#7BAE7F",
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", sans-serif', //roboto is the default font of material ui
  },
});
