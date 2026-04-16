// src/shared/theme.ts
import { createTheme } from '@mui/material/styles';

// ══════════════════════════════════════════════════════════════════════════════
// BRANDING CONFIGURATION — Change these values per client
// ══════════════════════════════════════════════════════════════════════════════
export const BRANDING = {
  primary: '#0F4C81',
  primaryLight: '#1565A8',
  primaryDark: '#0A3A63',
  
  // Solid colors (for backwards compatibility)
  docTypes: {
    policy: '#0F4C81',
    procedure: '#0D7D5F',
    form: '#9E3A5A',
    certificate: '#B5850A',
    guide: '#5C6670',
    manual: '#7C3AED',
    checklist: '#0891B2',
    template: '#B91C1C',
    'work instruction': '#6A4C93',
    default: '#5C6670',
  } as Record<string, string>,
  
  classifications: {
    public: '#0D7D5F',
    internal: '#92650A',
    confidential: '#B91C1C',
    restricted: '#7F1D1D',
  } as Record<string, string>,
};

// Muted colors (light bg + dark text) for badges
export const DOC_TYPE_COLORS_MUTED: Record<string, { bg: string; text: string }> = {
  policy: { bg: '#E6F1FB', text: '#0F4C81' },
  procedure: { bg: '#E6F7F2', text: '#0D7D5F' },
  form: { bg: '#FCE8EE', text: '#9E3A5A' },
  certificate: { bg: '#FEF3E2', text: '#92650A' },
  guide: { bg: '#F1F5F9', text: '#475569' },
  manual: { bg: '#F3E8FF', text: '#7C3AED' },
  checklist: { bg: '#E0F7FA', text: '#0891B2' },
  template: { bg: '#FEE2E2', text: '#B91C1C' },
  'work instruction': { bg: '#F3E8FF', text: '#6A4C93' },
  default: { bg: '#F1F5F9', text: '#475569' },
};

export const CLASSIFICATION_COLORS_MUTED: Record<string, { bg: string; text: string }> = {
  public: { bg: '#E6F7F2', text: '#0D7D5F' },
  internal: { bg: '#FEF3E2', text: '#92650A' },
  confidential: { bg: '#FEE4E2', text: '#B91C1C' },
  restricted: { bg: '#FEE2E2', text: '#7F1D1D' },
};

// ══════════════════════════════════════════════════════════════════════════════
// Helper functions
// ══════════════════════════════════════════════════════════════════════════════

// Returns solid color (backwards compatible)
export const getDocTypeColor = (docType?: string): string => {
  if (!docType) return BRANDING.docTypes.default;
  const key = docType.toLowerCase() as keyof typeof BRANDING.docTypes;
  return BRANDING.docTypes[key] ?? BRANDING.docTypes.default;
};

// Returns muted { bg, text } colors for badges
export const getDocTypeColors = (type?: string): { bg: string; text: string } => {
  if (!type) return DOC_TYPE_COLORS_MUTED.default;
  const key = type.toLowerCase().trim();
  return DOC_TYPE_COLORS_MUTED[key] ?? DOC_TYPE_COLORS_MUTED.default;
};

// Returns solid color (backwards compatible)
export const getClassificationColor = (classification?: string): string => {
  if (!classification) return '#5C6670';
  const key = classification.toLowerCase() as keyof typeof BRANDING.classifications;
  return BRANDING.classifications[key] ?? '#5C6670';
};

// Returns muted { bg, text } colors for badges
export const getClassificationColors = (classification?: string): { bg: string; text: string } => {
  if (!classification) return { bg: '#F1F5F9', text: '#475569' };
  const key = classification.toLowerCase();
  return CLASSIFICATION_COLORS_MUTED[key] ?? { bg: '#F1F5F9', text: '#475569' };
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