// src/webparts/documentPortal/components/DocumentPortal.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import { Document } from "../../../shared/types/Document";
import { useDocuments } from "../../../shared/hooks/useDocuments";
import { BRANDING } from "../../../shared/theme";
import DocumentsTable from "./DocumentsTable";
import DocumentDetail from "./DocumentDetail";

type View = "list" | "detail";

// ── Filter Dropdown ───────────────────────────────────────────────────────────
interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const FilterDropdown = ({ label, options, selected, onChange }: FilterDropdownProps): React.ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleToggle = (option: string): void => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const isActive = selected.length > 0;

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: "14px !important" }} />}
        sx={{
          fontSize: "12px",
          padding: "6px 12px",
          borderRadius: "6px",
          backgroundColor: isActive ? BRANDING.primary : "white",
          color: isActive ? "white" : "#64748B",
          border: isActive ? "none" : "1px solid #E2E8F0",
          textTransform: "none",
          fontWeight: 400,
          minWidth: "auto",
          "&:hover": {
            backgroundColor: isActive ? BRANDING.primaryDark : "#F8FAFC",
          },
        }}
      >
        {label}
        {isActive && (
          <Box
            component="span"
            sx={{
              ml: 0.5,
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: "4px",
              px: 0.5,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {selected.length}
          </Box>
        )}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 200,
            maxHeight: 300,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            border: "1px solid #E2E8F0",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={() => handleToggle(option)}
            sx={{
              fontSize: "13px",
              py: 1,
              backgroundColor: selected.includes(option) ? "rgba(15, 76, 129, 0.08)" : "transparent",
              "&:hover": { backgroundColor: "rgba(15, 76, 129, 0.04)" },
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <span>{option}</span>
              {selected.includes(option) && (
                <span style={{ color: BRANDING.primary, fontWeight: 600 }}>✓</span>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const DocumentPortal = (): React.ReactElement => {
  const { documents, loading, error } = useDocuments();
  const [view, setView] = useState<View>("list");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [functionFilter, setFunctionFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Build filter options
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => d.DocumentType?.Title && set.add(d.DocumentType.Title));
    return Array.from(set).sort();
  }, [documents]);

  const functionOptions = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => d.BusinessFunction?.forEach((f) => set.add(f.Title)));
    return Array.from(set).sort();
  }, [documents]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => d.Category?.forEach((c) => set.add(c.Title)));
    return Array.from(set).sort();
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = !searchQuery || 
        doc.DocumentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter.length === 0 || 
        typeFilter.includes(doc.DocumentType?.Title ?? "");
      
      const matchesFunction = functionFilter.length === 0 || 
        doc.BusinessFunction?.some((f) => functionFilter.includes(f.Title));
      
      const matchesCategory = categoryFilter.length === 0 || 
        doc.Category?.some((c) => categoryFilter.includes(c.Title));

      return matchesSearch && matchesType && matchesFunction && matchesCategory;
    });
  }, [documents, searchQuery, typeFilter, functionFilter, categoryFilter]);

  const hasActiveFilters = searchQuery || typeFilter.length > 0 || functionFilter.length > 0 || categoryFilter.length > 0;

  const clearAllFilters = (): void => {
    setSearchQuery("");
    setTypeFilter([]);
    setFunctionFilter([]);
    setCategoryFilter([]);
  };

  const handleRowClick = (doc: Document): void => {
    setSelectedDocument(doc);
    setView("detail");
  };

  const handleBack = (): void => {
    setSelectedDocument(null);
    setView("list");
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={32} sx={{ color: BRANDING.primary }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Detail view
  if (view === "detail" && selectedDocument) {
    return <DocumentDetail document={selectedDocument} onBack={handleBack} />;
  }

  // List view
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
      {/* ══════════════════════════════════════════════════════════════════════
          Blue Header
          ══════════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${BRANDING.primary} 0%, ${BRANDING.primaryLight} 100%)`,
          padding: "20px 24px",
          color: "white",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 500, color: "white", mb: 0.5 }}>
              Document Repository
            </Typography>
            <Typography sx={{ fontSize: "12px", opacity: 0.85 }}>
              {filteredDocuments.length} of {documents.length} documents
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            placeholder="Search documents..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 260,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: "6px",
                fontSize: "13px",
                "& fieldset": { border: "none" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          Filter Bar
          ══════════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          padding: "12px 24px",
          backgroundColor: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <FilterListIcon sx={{ fontSize: 18, color: "#94A3B8", mr: 0.5 }} />

        {typeOptions.length > 0 && (
          <FilterDropdown
            label="Type"
            options={typeOptions}
            selected={typeFilter}
            onChange={setTypeFilter}
          />
        )}

        {functionOptions.length > 0 && (
          <FilterDropdown
            label="Function"
            options={functionOptions}
            selected={functionFilter}
            onChange={setFunctionFilter}
          />
        )}

        {categoryOptions.length > 0 && (
          <FilterDropdown
            label="Category"
            options={categoryOptions}
            selected={categoryFilter}
            onChange={setCategoryFilter}
          />
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <>
            <Box sx={{ width: "1px", height: "20px", backgroundColor: "#E2E8F0", mx: 1 }} />

            {typeFilter.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                onDelete={() => setTypeFilter(typeFilter.filter((x) => x !== t))}
                deleteIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
                sx={{
                  backgroundColor: "#E6F1FB",
                  color: BRANDING.primary,
                  fontSize: "11px",
                  fontWeight: 500,
                  height: "26px",
                  "& .MuiChip-deleteIcon": {
                    color: BRANDING.primary,
                    opacity: 0.7,
                    "&:hover": { opacity: 1 },
                  },
                }}
              />
            ))}

            {functionFilter.map((f) => (
              <Chip
                key={f}
                label={f}
                size="small"
                onDelete={() => setFunctionFilter(functionFilter.filter((x) => x !== f))}
                deleteIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
                sx={{
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  fontSize: "11px",
                  height: "26px",
                  "& .MuiChip-deleteIcon": { color: "#64748B" },
                }}
              />
            ))}

            {categoryFilter.map((c) => (
              <Chip
                key={c}
                label={c}
                size="small"
                onDelete={() => setCategoryFilter(categoryFilter.filter((x) => x !== c))}
                deleteIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
                sx={{
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  fontSize: "11px",
                  height: "26px",
                  "& .MuiChip-deleteIcon": { color: "#64748B" },
                }}
              />
            ))}

            <Button
              size="small"
              onClick={clearAllFilters}
              sx={{
                fontSize: "11px",
                color: "#64748B",
                textTransform: "none",
                ml: "auto",
                "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
              }}
            >
              Clear all
            </Button>
          </>
        )}
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          Table
          ══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <DocumentsTable documents={filteredDocuments} onRowClick={handleRowClick} />
      </Box>
    </Box>
  );
};

export default DocumentPortal;