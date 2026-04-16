// src/webparts/documentPortal/components/DocumentPortal.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { Document } from "../../../shared/types/Document";
import { useDocuments } from "../../../shared/hooks/useDocuments";
import { BRANDING } from "../../../shared/theme/theme";
import FilterDropdown from "./FilterDropdown";
import DocumentsTable from "./DocumentsTable";
import DocumentDetail from "./DocumentDetail";

type View = "list" | "detail";

// Maximum chips to show before collapsing
const MAX_VISIBLE_CHIPS = 3;

// ── Chip Component ────────────────────────────────────────────────────────────
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "11px",
      padding: "5px 8px 5px 10px",
      backgroundColor: "#F1F5F9",
      color: "#475569",
      borderRadius: "4px",
    }}
  >
    <span>{label}</span>
    <Box
      component="span"
      onClick={onRemove}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        opacity: 0.5,
        "&:hover": { opacity: 1 },
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M3 3L9 9M9 3L3 9"
          stroke="#475569"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────
const DocumentPortal: React.FC = () => {
  const { documents, loading, error } = useDocuments();
  const [view, setView] = useState<View>("list");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [functionFilter, setFunctionFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showAllChips, setShowAllChips] = useState(false);

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
      const matchesSearch =
        !searchQuery ||
        doc.DocumentTitle?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter.length === 0 ||
        typeFilter.includes(doc.DocumentType?.Title ?? "");

      const matchesFunction =
        functionFilter.length === 0 ||
        doc.BusinessFunction?.some((f) => functionFilter.includes(f.Title));

      const matchesCategory =
        categoryFilter.length === 0 ||
        doc.Category?.some((c) => categoryFilter.includes(c.Title));

      return matchesSearch && matchesType && matchesFunction && matchesCategory;
    });
  }, [documents, searchQuery, typeFilter, functionFilter, categoryFilter]);

  // Build all active filter chips
  const allChips = useMemo(() => {
    const chips: { label: string; type: "type" | "function" | "category"; value: string }[] = [];
    
    typeFilter.forEach((t) => chips.push({ label: t, type: "type", value: t }));
    functionFilter.forEach((f) => chips.push({ label: f, type: "function", value: f }));
    categoryFilter.forEach((c) => chips.push({ label: c, type: "category", value: c }));
    
    return chips;
  }, [typeFilter, functionFilter, categoryFilter]);

  const visibleChips = showAllChips ? allChips : allChips.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = allChips.length - MAX_VISIBLE_CHIPS;
  const hasActiveFilters = allChips.length > 0 || searchQuery;

  const removeChip = (type: "type" | "function" | "category", value: string): void => {
    switch (type) {
      case "type":
        setTypeFilter(typeFilter.filter((t) => t !== value));
        break;
      case "function":
        setFunctionFilter(functionFilter.filter((f) => f !== value));
        break;
      case "category":
        setCategoryFilter(categoryFilter.filter((c) => c !== value));
        break;
    }
  };

  const clearAllFilters = (): void => {
    setSearchQuery("");
    setTypeFilter([]);
    setFunctionFilter([]);
    setCategoryFilter([]);
    setShowAllChips(false);
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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
      }}
    >
      {/* Flat Blue Header */}
      <Box
        sx={{
          backgroundColor: BRANDING.primary,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 500,
              color: "white",
              marginBottom: "4px",
            }}
          >
            Document Repository
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
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
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <CloseIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filter Bar */}
      <Box
        sx={{
          padding: "12px 24px",
          backgroundColor: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <FilterListIcon sx={{ fontSize: 18, color: "#94A3B8" }} />

        {/* Filter dropdowns */}
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
        {allChips.length > 0 && (
          <>
            <Box
              sx={{
                width: "1px",
                height: "20px",
                backgroundColor: "#E2E8F0",
                margin: "0 4px",
              }}
            />

            {visibleChips.map((chip) => (
              <FilterChip
                key={`${chip.type}-${chip.value}`}
                label={chip.label}
                onRemove={() => removeChip(chip.type, chip.value)}
              />
            ))}

            {/* +N more button */}
            {hiddenCount > 0 && !showAllChips && (
              <Box
                onClick={() => setShowAllChips(true)}
                sx={{
                  fontSize: "11px",
                  padding: "5px 10px",
                  backgroundColor: "#E2E8F0",
                  color: BRANDING.primary,
                  borderRadius: "4px",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#CBD5E1" },
                }}
              >
                +{hiddenCount} more
              </Box>
            )}

            {/* Show less button */}
            {showAllChips && allChips.length > MAX_VISIBLE_CHIPS && (
              <Box
                onClick={() => setShowAllChips(false)}
                sx={{
                  fontSize: "11px",
                  padding: "5px 10px",
                  backgroundColor: "#E2E8F0",
                  color: BRANDING.primary,
                  borderRadius: "4px",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#CBD5E1" },
                }}
              >
                Show less
              </Box>
            )}
          </>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={clearAllFilters}
            sx={{
              fontSize: "11px",
              color: "#64748B",
              textTransform: "none",
              marginLeft: "auto",
              "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
            }}
          >
            Clear all
          </Button>
        )}
      </Box>

      {/* Table */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {filteredDocuments.length > 0 ? (
          <DocumentsTable documents={filteredDocuments} onRowClick={handleRowClick} />
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            flex={1}
            py={8}
          >
            <Typography sx={{ fontSize: "14px", color: "#64748B", mb: 1 }}>
              No documents found
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#94A3B8", mb: 2 }}>
              Try adjusting your search or filters
            </Typography>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                onClick={clearAllFilters}
                sx={{
                  textTransform: "none",
                  borderColor: "#E2E8F0",
                  color: "#64748B",
                  "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8FAFC" },
                }}
              >
                Clear all filters
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DocumentPortal;