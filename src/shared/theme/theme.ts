// src/shared/theme.ts
import { createTheme } from '@mui/material/styles';

// ══════════════════════════════════════════════════════════════════════════════
// BRANDING CONFIGURATION — Change these values per client
// ══════════════════════════════════════════════════════════════════════════════
export const BRANDING = {
  primary: '#0F4C81',
  primaryLight: '#1565A8',
  primaryDark: '#0A3A63',
  
  docTypes: {
    policy: '#0F4C81',
    procedure: '#0D7D5F',
    form: '#9E3A5A',
    certificate: '#B5850A',
    guide: '#5C6670',
    manual: '#6A4C93',
    checklist: '#0891B2',
    flowchart: '#7C3AED',
    presentation: '#DC2626',
    default: '#5C6670',
  } as Record<string, string>,
  
  classifications: {
    public: '#0D7D5F',
    internal: '#B5850A',
    confidential: '#C75000',
    restricted: '#B91C1C',
  } as Record<string, string>,
};

// ══════════════════════════════════════════════════════════════════════════════
// Helper functions
// ══════════════════════════════════════════════════════════════════════════════
export const getDocTypeColor = (type?: string): string => {
  if (!type) return BRANDING.docTypes.default;
  const key = type.toLowerCase().replace(/\s+/g, '');
  return BRANDING.docTypes[key] ?? BRANDING.docTypes.default;
};

export const getClassificationColor = (classification?: string): string => {
  if (!classification) return '#64748B';
  const key = classification.toLowerCase();
  return BRANDING.classifications[key] ?? '#64748B';
};

// ══════════════════════════════════════════════════════════════════════════════
// Theme
// ══════════════════════════════════════════════════════════════════════════════
const theme = createTheme({
  palette: {
    primary: {
      main: BRANDING.primary,
      light: BRANDING.primaryLight,
      dark: BRANDING.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#64748B',
      light: '#94A3B8',
      dark: '#475569',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
        },
      },
    },
  },
});

export default theme;