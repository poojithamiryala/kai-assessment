import { createTheme } from "@mui/material/styles";

// Extending the theme to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      button: {
        active: string;
        hover: string;
        border: string;
      };
    };
  }
  interface PaletteOptions {
    custom?: {
      button: {
        active: string;
        hover: string;
        border: string;
      };
    };
  }
}

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
    // Custom colors for buttons and overlays
    custom: {
      button: {
        active: "rgba(255, 255, 255, 0.2)",
        hover: "rgba(255, 255, 255, 0.15)",
        border: "rgba(255, 255, 255, 0.3)",
      },
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", sans-serif', //roboto is the default font of material ui
  },
});
