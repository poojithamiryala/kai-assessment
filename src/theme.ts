import { createTheme } from "@mui/material/styles";

// Extending the theme to include custom colors, gradients, and shadows
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      button: {
        active: string;
        hover: string;
        border: string;
      };
      gradients: {
        analysis: string;
        aiAnalysis: string;
        analysisHover: string;
        aiAnalysisHover: string;
        analysisInactive: string;
        aiAnalysisInactive: string;
      };
      shadows: {
        button: {
          default: string;
          active: string;
          hover: string;
        };
        analysis: {
          active: string;
          hover: string;
        };
        aiAnalysis: {
          active: string;
          hover: string;
        };
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
      gradients: {
        analysis: string;
        aiAnalysis: string;
        analysisHover: string;
        aiAnalysisHover: string;
        analysisInactive: string;
        aiAnalysisInactive: string;
      };
      shadows: {
        button: {
          default: string;
          active: string;
          hover: string;
        };
        analysis: {
          active: string;
          hover: string;
        };
        aiAnalysis: {
          active: string;
          hover: string;
        };
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
      gradients: {
        analysis: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        aiAnalysis: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        analysisHover: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
        aiAnalysisHover: "linear-gradient(135deg, #e882f0 0%, #f3455a 100%)",
        analysisInactive: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
        aiAnalysisInactive: "linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)",
      },
      shadows: {
        button: {
          default: "0 2px 8px rgba(0,0,0,0.1)",
          active: "0 4px 12px rgba(0,0,0,0.15)",
          hover: "0 6px 16px rgba(0,0,0,0.2)",
        },
        analysis: {
          active: "0 8px 25px rgba(102, 126, 234, 0.3)",
          hover: "0 12px 35px rgba(102, 126, 234, 0.4)",
        },
        aiAnalysis: {
          active: "0 8px 25px rgba(240, 147, 251, 0.3)",
          hover: "0 12px 35px rgba(240, 147, 251, 0.4)",
        },
      },
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", sans-serif', //roboto is the default font of material ui
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // removing as on focus the outline is shown as black which is not necessary
          '&:focus': {
            outline: 'none',
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          // removing as on focus the outline is shown as black which is not necessary
          '&:focus': {
            outline: 'none',
          },
        },
      },
    },
  },
});
