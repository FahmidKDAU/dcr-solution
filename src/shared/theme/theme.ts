import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0078D4', // SharePoint blue
      light: '#2B88D8',
      dark: '#005A9E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6C757D',
      light: '#8C959D',
      dark: '#4C555D',
    },
    background: {
      default: '#F3F2F1', // Light gray page background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#323130',
      secondary: '#605E5C',
    },
    grey: {
      50: '#F3F2F1',
      100: '#EDEBE9',
      200: '#E1DFDD',
      300: '#D2D0CE',
      400: '#C8C6C4',
      500: '#A19F9D',
    },
  },

  typography: {
    fontFamily: [
      '"Segoe UI"',
      '-apple-system',
      'BlinkMacSystemFont',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#323130',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#323130',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#323130',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#323130',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      color: '#605E5C',
    },
  },

  spacing: 8, // Base spacing unit (1 = 8px)

  shape: {
    borderRadius: 4, // Increased from 2px to 4px
  },

  components: {
    // TextField customization
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {
          shrink: true,
          disableAnimation: true,
        },
      },
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            position: 'static',
            display: 'block',
            transform: 'none !important',
            marginBottom: '8px', // Increased from 4px to 8px
            color: '#323130',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'none !important',
            '&.Mui-focused': {
              color: '#323130',
              transform: 'none !important',
            },
            '&.MuiInputLabel-shrink': {
              transform: 'none !important',
            },
            '&.Mui-error': {
              color: '#A4262C',
            },
          },
        },
      },
    },

    // OutlinedInput customization
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '4px', // Increased from 2px to 4px
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#323130',
            },
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0078D4',
              borderWidth: '2px', // Increased from 1px to 2px for better focus visibility
            },
          },
          '&.Mui-disabled': {
            backgroundColor: '#F3F2F1',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#C8C6C4',
            borderWidth: '1px',
            '& legend': {
              display: 'none',
            },
          },
        },
        input: {
          padding: '10px 14px', // Increased from 8px 12px for more comfortable spacing
          fontSize: '0.875rem',
          color: '#323130',
          '&::placeholder': {
            color: '#A19F9D',
            opacity: 1,
          },
        },
        multiline: {
          padding: '10px 14px', // Increased from 8px 12px
        },
        notchedOutline: {
          '& legend': {
            display: 'none',
          },
        },
      },
    },

    // Select customization
    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: '#FFFFFF',
          borderRadius: '4px', // Increased from 2px to 4px
          padding: '10px 14px', // Increased from 8px 12px
          '&:focus': {
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },

    // FormControl customization
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: '20px', // Changed from 0px - adds spacing between fields
        },
      },
    },

    // FormLabel customization
    MuiFormLabel: {
      styleOverrides: {
        root: {
          position: 'static',
          display: 'block',
          transform: 'none !important',
          marginBottom: '8px', // Increased from 4px to 8px
          color: '#323130',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'none !important',
          '&.Mui-focused': {
            color: '#323130',
            transform: 'none !important',
          },
        },
      },
    },

    // InputLabel customization
    MuiInputLabel: {
      defaultProps: {
        disableAnimation: true,
      },
      styleOverrides: {
        root: {
          position: 'static',
          display: 'block',
          transform: 'none !important',
          marginBottom: '8px', // Increased from 4px to 8px
          color: '#323130',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'none !important',
          '&.Mui-focused': {
            color: '#323130',
            transform: 'none !important',
          },
          '&.MuiInputLabel-shrink': {
            transform: 'none !important',
          },
        },
        shrink: {
          transform: 'none !important',
        },
      },
    },

    // FormHelperText customization - for better guidance
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: '6px',
          marginLeft: '0px',
          fontSize: '0.75rem',
          color: '#605E5C',
          lineHeight: 1.4,
        },
      },
    },

    // Button customization
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px', // Increased from 2px to 4px
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 24px', // Increased padding for better click target
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#0078D4',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#106EBE',
          },
        },
        outlined: {
          borderColor: '#8A8886',
          color: '#323130',
          '&:hover': {
            borderColor: '#323130',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '0.9375rem',
        },
      },
    },

    // Autocomplete customization (for PeoplePicker)
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '4px 14px', // Increased from 2px 12px
          },
        },
        inputRoot: {
          backgroundColor: '#FFFFFF',
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
          },
        },
        paper: {
          borderRadius: '4px', // Increased from 2px to 4px
          boxShadow: '0 3.2px 7.2px rgba(0, 0, 0, 0.132), 0 0.6px 1.8px rgba(0, 0, 0, 0.108)',
        },
        option: {
          fontSize: '0.875rem',
          padding: '10px 14px', // Increased from 8px 12px
          '&[aria-selected="true"]': {
            backgroundColor: '#EDEBE9',
          },
          '&:hover': {
            backgroundColor: '#F3F2F1',
          },
        },
      },
    },

    // Chip customization
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px', // Increased from 2px to 4px
          fontSize: '0.8125rem',
          height: '26px', // Slightly increased from 24px
          backgroundColor: '#EDEBE9',
          color: '#323130',
        },
        deleteIcon: {
          color: '#605E5C',
          '&:hover': {
            color: '#323130',
          },
        },
      },
    },

    // Tab customization
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: '48px',
          padding: '12px 20px', // Added horizontal padding
          color: '#605E5C',
          '&.Mui-selected': {
            color: '#0078D4',
          },
          '&:hover': {
            color: '#323130',
          },
        },
      },
    },

    // Tabs customization
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #EDEBE9',
          marginBottom: '24px', // Added spacing between tabs and content
        },
        indicator: {
          backgroundColor: '#0078D4',
          height: '3px', // Increased from 2px for better visibility
        },
      },
    },

    // Radio button customization
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#605E5C',
          padding: '8px', // Slightly reduced for tighter spacing
          '&.Mui-checked': {
            color: '#0078D4',
          },
        },
      },
    },

    // RadioGroup customization
    MuiFormGroup: {
      styleOverrides: {
        root: {
          gap: '4px', // Adds spacing between radio options
        },
      },
    },
  },
});

export default theme;