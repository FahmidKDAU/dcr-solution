// src/shared/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// ══════════════════════════════════════════════════════════════════════════════
// BRANDING CONFIGURATION — Change these values per client
// ══════════════════════════════════════════════════════════════════════════════
export const BRANDING = {
  primary: '#0F4C81',
  primaryLight: '#1565A8',
  primaryDark: '#0A3A63',
};

// ══════════════════════════════════════════════════════════════════════════════
// RADIUS TOKENS — pick from these instead of hand-picking px values per file
// ══════════════════════════════════════════════════════════════════════════════
export const RADIUS = {
  chip: '4px',      // badges, chips, small tags
  button: '6px',     // standard buttons
  buttonFlat: '2px', // SharePoint-native flat buttons (success banners, headers)
  card: '8px',       // cards, panels, dropdown menus
  modal: '10px',     // dialogs
};

// ══════════════════════════════════════════════════════════════════════════════
// CHIP COLOR PALETTE — single source of truth for every "muted badge" in the app.
// Add a new named color here once; every domain map below just assigns keys to it.
// ══════════════════════════════════════════════════════════════════════════════
export type ChipColor = { bg: string; text: string };

export const CHIP_PALETTE: Record<string, ChipColor> = {
  blue:   { bg: '#E6F1FB', text: '#0F4C81' },
  green:  { bg: '#E6F7F2', text: '#0D7D5F' },
  purple: { bg: '#F3E8FF', text: '#7C3AED' },
  amber:  { bg: '#FEF3E2', text: '#92650A' },
  pink:   { bg: '#FCE8EE', text: '#9E3A5A' },
  cyan:   { bg: '#E0F7FA', text: '#0891B2' },
  red:    { bg: '#FEE2E2', text: '#B91C1C' },
  redDark:{ bg: '#FEE4E2', text: '#7F1D1D' },
  grey:   { bg: '#F1F5F9', text: '#475569' },
};

// ── Domain → palette key maps ──────────────────────────────────────────────────
// Each of these just names which palette color a given value uses. To retheme
// the whole app, edit CHIP_PALETTE above — these maps rarely need to change.

const DOC_TYPE_KEYS: Record<string, keyof typeof CHIP_PALETTE> = {
  policy: 'blue',
  procedure: 'green',
  form: 'pink',
  certificate: 'amber',
  guide: 'grey',
  manual: 'purple',
  checklist: 'cyan',
  template: 'red',
  'work instruction': 'purple',
};

const CLASSIFICATION_KEYS: Record<string, keyof typeof CHIP_PALETTE> = {
  public: 'green',
  internal: 'amber',
  confidential: 'red',
  restricted: 'redDark',
};

const TASK_TYPE_KEYS: Record<string, keyof typeof CHIP_PALETTE> = {
  'ca review': 'blue',
  'change authority review': 'blue',
  'change authority approval': 'green',
  'compliance authority review': 'purple',
  'document controller review': 'purple',
  'final approval': 'green',
  'author review': 'cyan',
  'document change process': 'amber',
  'participant task': 'pink',
  'cr completion': 'grey',
  'cr info required': 'grey',
  'publish document': 'cyan',
  'publishing rejection review': 'red',
  'document review': 'blue',
};

// ── Public getters — use these everywhere instead of hardcoded color objects ──

export const getDocTypeColors = (type?: string): ChipColor => {
  if (!type) return CHIP_PALETTE.grey;
  const key = DOC_TYPE_KEYS[type.toLowerCase().trim()];
  return key ? CHIP_PALETTE[key] : CHIP_PALETTE.grey;
};

export const getClassificationColors = (classification?: string): ChipColor => {
  if (!classification) return CHIP_PALETTE.grey;
  const key = CLASSIFICATION_KEYS[classification.toLowerCase()];
  return key ? CHIP_PALETTE[key] : CHIP_PALETTE.grey;
};

export const getTaskTypeColors = (taskType?: string): ChipColor => {
  if (!taskType) return CHIP_PALETTE.grey;
  const key = TASK_TYPE_KEYS[taskType.toLowerCase().trim()];
  return key ? CHIP_PALETTE[key] : CHIP_PALETTE.grey;
};

// Backwards-compatible solid-color getters (only if something still needs a
// single hex rather than a bg/text pair)
export const getDocTypeColor = (docType?: string): string =>
  getDocTypeColors(docType).text;

export const getClassificationColor = (classification?: string): string =>
  getClassificationColors(classification).text;

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

    // Panel/page-level titles (e.g. webpart headers)
    h6: { fontSize: '18px', fontWeight: 500, lineHeight: 1.4 },

    // Card/document titles (e.g. "Book policy" in DocumentDetail)
    subtitle1: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4, color: '#1E293B' },

    // Section headers (e.g. "OVERVIEW", "DEPARTMENT")
    overline: {
      fontSize: '10px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#94A3B8',
    },

    // Primary readable content — table cells, form values
    body2: { fontSize: '13px', fontWeight: 400, color: '#1E293B' },

    // Secondary/meta text — dates, counts, muted descriptions
    caption: { fontSize: '12px', fontWeight: 400, color: '#64748B' },

    button: { fontSize: '13px', fontWeight: 500, textTransform: 'none' },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: RADIUS.button,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.chip,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: RADIUS.modal,
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