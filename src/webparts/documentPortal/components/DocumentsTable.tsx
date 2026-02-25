// src/webparts/documentPortal/components/DocumentsTable.tsx
import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import { alpha, useTheme } from "@mui/material/styles";
import { Document } from "../../../shared/types/Document";

interface DocumentsTableProps {
  documents: Document[];
  onRowClick: (doc: Document) => void;
}

// ── Type config — add your real document types here ──────────────────────────
const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactElement }> = {
  policy: {
    color: "#1565C0",
    bg: "#E3F2FD",
    icon: <PolicyOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  form: {
    color: "#2E7D32",
    bg: "#E8F5E9",
    icon: <AssignmentOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  procedure: {
    color: "#E65100",
    bg: "#FFF3E0",
    icon: <ArticleOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  "work instruction": {
    color: "#6A1B9A",
    bg: "#F3E5F5",
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
  },
};

const getTypeConfig = (type?: string) =>
  TYPE_CONFIG[(type ?? "").toLowerCase()] ?? {
    color: "#455A64",
    bg: "#ECEFF1",
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
  };

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateString?: string): string => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

type SortKey = "DocumentTitle" | "DocumentType" | "PublishedDate";

const sortDocuments = (docs: Document[], orderBy: SortKey, order: "asc" | "desc"): Document[] =>
  [...docs].sort((a, b) => {
    const aVal = orderBy === "DocumentType" ? (a.DocumentType?.Title ?? "") : ((a[orderBy] ?? "") as string);
    const bVal = orderBy === "DocumentType" ? (b.DocumentType?.Title ?? "") : ((b[orderBy] ?? "") as string);
    return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

// ─────────────────────────────────────────────────────────────────────────────

const DocumentsTable = ({ documents, onRowClick }: DocumentsTableProps): React.ReactElement => {
  const theme = useTheme();
  const PRIMARY = theme.palette.primary.main; // #0078D4

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [orderBy, setOrderBy] = useState<SortKey>("DocumentTitle");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (col: SortKey): void => {
    setOrder(orderBy === col && order === "asc" ? "desc" : "asc");
    setOrderBy(col);
  };

  // Unique type options for filter dropdown
  const typeOptions = useMemo(() => {
    const types = [...new Set(documents.map((d) => d.DocumentType?.Title).filter(Boolean))] as string[];
    return types.sort();
  }, [documents]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return documents.filter((d) => {
      const matchesSearch =
        d.DocumentTitle?.toLowerCase().includes(term) ||
        d.DocumentType?.Title?.toLowerCase().includes(term) ||
        d.CoreFunctionality?.Title?.toLowerCase().includes(term) ||
        d.Category?.some((c) => c.Title.toLowerCase().includes(term));
      const matchesType = typeFilter === "all" || d.DocumentType?.Title === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, search, typeFilter]);

  const sorted = useMemo(() => sortDocuments(filtered, orderBy, order), [filtered, orderBy, order]);

  // ── Column header style ───────────────────────────────────────────────────
  const th = {
    backgroundColor: "#F8F9FA",
    color: "#42526E",
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    borderBottom: "2px solid #DFE1E6",
    py: 1.25,
    px: 2,
    whiteSpace: "nowrap" as const,
  };

  const sortLabelSx = {
    color: "#42526E !important",
    fontWeight: 600,
    fontSize: "0.75rem",
    "& .MuiTableSortLabel-icon": { color: "#42526E !important", fontSize: "1rem" },
    "&.Mui-active": {
      color: `${PRIMARY} !important`,
      "& .MuiTableSortLabel-icon": { color: `${PRIMARY} !important` },
    },
    "&:hover": { color: `${PRIMARY} !important` },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #DFE1E6",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(9,30,66,0.08), 0 0 1px rgba(9,30,66,0.08)",
      }}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #DFE1E6",
          backgroundColor: "white",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search documents..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 280,
            "& .MuiOutlinedInput-root": {
              height: 32,
              fontSize: "0.875rem",
              borderRadius: "4px",
              backgroundColor: "#F4F5F7",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "#DFE1E6" },
              "&.Mui-focused fieldset": { borderColor: PRIMARY, borderWidth: "2px" },
              "&.Mui-focused": { backgroundColor: "white" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#7A869A" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Type filter */}
        <Box display="flex" alignItems="center" gap={0.75}>
          <FilterListIcon sx={{ fontSize: 16, color: "#7A869A" }} />
          <Select
            size="small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{
              height: 32,
              fontSize: "0.8125rem",
              color: typeFilter === "all" ? "#7A869A" : PRIMARY,
              fontWeight: typeFilter === "all" ? 400 : 600,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#DFE1E6" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#B3BAC5" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
              "& .MuiSelect-select": { py: 0.5, px: 1.5 },
            }}
          >
            <MenuItem value="all">All types</MenuItem>
            {typeOptions.map((t) => (
              <MenuItem key={t} value={t} sx={{ fontSize: "0.8125rem" }}>{t}</MenuItem>
            ))}
          </Select>
        </Box>

        {/* Clear filters */}
        {(search || typeFilter !== "all") && (
          <Button
            size="small"
            onClick={() => { setSearch(""); setTypeFilter("all"); }}
            sx={{
              fontSize: "0.8125rem",
              color: PRIMARY,
              textTransform: "none",
              fontWeight: 500,
              height: 32,
              px: 1,
              minWidth: "unset",
              "&:hover": { backgroundColor: alpha(PRIMARY, 0.06) },
            }}
          >
            Clear
          </Button>
        )}

        {/* Result count — pushed right */}
        <Typography
          sx={{ ml: "auto", color: "#7A869A", fontWeight: 500, fontSize: "0.8125rem" }}
        >
          {sorted.length} of {documents.length} documents
        </Typography>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <TableContainer sx={{ flex: 1, overflow: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...th, width: "38%" }}>
                <TableSortLabel
                  active={orderBy === "DocumentTitle"}
                  direction={orderBy === "DocumentTitle" ? order : "asc"}
                  onClick={() => handleSort("DocumentTitle")}
                  sx={sortLabelSx}
                >
                  Document Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={th}>
                <TableSortLabel
                  active={orderBy === "DocumentType"}
                  direction={orderBy === "DocumentType" ? order : "asc"}
                  onClick={() => handleSort("DocumentType")}
                  sx={sortLabelSx}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sx={th}>Function</TableCell>
              <TableCell sx={th}>Category</TableCell>
              <TableCell sx={th}>
                <TableSortLabel
                  active={orderBy === "PublishedDate"}
                  direction={orderBy === "PublishedDate" ? order : "asc"}
                  onClick={() => handleSort("PublishedDate")}
                  sx={sortLabelSx}
                >
                  Published
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ ...th, textAlign: "center", width: 48 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ border: "none" }}>
                  <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={1}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 40, color: "#DFE1E6" }} />
                    <Typography sx={{ color: "#7A869A", fontSize: "0.875rem", fontWeight: 500 }}>
                      No documents found
                    </Typography>
                    <Typography sx={{ color: "#B3BAC5", fontSize: "0.8125rem" }}>
                      Try adjusting your search or filter
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((doc) => {
                const cfg = getTypeConfig(doc.DocumentType?.Title);
                const functions = doc.BusinessFunction ?? [];
                const categories = doc.Category ?? [];

                return (
                  <TableRow
                    key={doc.Id}
                    onClick={() => onRowClick(doc)}
                    sx={{
                      cursor: "pointer",
                      borderBottom: "1px solid #F4F5F7",
                      transition: "background-color 0.1s ease",
                      "&:hover": {
                        backgroundColor: "#F4F5F7",
                        "& .doc-title": { color: PRIMARY },
                        "& .row-action": { opacity: 1 },
                      },
                      "&:last-child td": { borderBottom: "none" },
                    }}
                  >
                    {/* Document Name */}
                    <TableCell sx={{ py: 1.25, px: 2 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {/* Icon */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: "6px",
                            backgroundColor: cfg.bg,
                            color: cfg.color,
                            flexShrink: 0,
                          }}
                        >
                          {cfg.icon}
                        </Box>
                        <Box>
                          <Typography
                            className="doc-title"
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "#172B4D",
                              lineHeight: 1.4,
                              transition: "color 0.1s ease",
                            }}
                          >
                            {doc.DocumentTitle}
                          </Typography>
                          {/* Core Functionality as subtitle */}
                          {doc.CoreFunctionality?.Title && (
                            <Typography sx={{ fontSize: "0.75rem", color: "#7A869A", lineHeight: 1.3 }}>
                              {doc.CoreFunctionality.Title}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Type */}
                    <TableCell sx={{ py: 1.25, px: 2 }}>
                      <Chip
                        label={doc.DocumentType?.Title ?? "?"}
                        size="small"
                        sx={{
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 22,
                          borderRadius: "4px",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </TableCell>

                    {/* Function */}
                    <TableCell sx={{ py: 1.25, px: 2 }}>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {functions.slice(0, 2).map((fn) => (
                          <Chip
                            key={fn.Id}
                            label={fn.Title}
                            size="small"
                            sx={{
                              backgroundColor: "#F4F5F7",
                              color: "#42526E",
                              fontSize: "0.75rem",
                              height: 22,
                              borderRadius: "4px",
                              fontWeight: 500,
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        ))}
                        {functions.length > 2 && (
                          <Tooltip title={functions.slice(2).map((f) => f.Title).join(", ")} arrow placement="top">
                            <Chip
                              label={`+${functions.length - 2}`}
                              size="small"
                              sx={{
                                backgroundColor: "#EBECF0",
                                color: "#7A869A",
                                fontSize: "0.75rem",
                                height: 22,
                                borderRadius: "4px",
                                fontWeight: 600,
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          </Tooltip>
                        )}
                        {functions.length === 0 && (
                          <Typography sx={{ fontSize: "0.8125rem", color: "#B3BAC5" }}>—</Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Category */}
                    <TableCell sx={{ py: 1.25, px: 2 }}>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {categories.slice(0, 2).map((cat) => (
                          <Chip
                            key={cat.Id}
                            label={cat.Title}
                            size="small"
                            sx={{
                              backgroundColor: alpha(PRIMARY, 0.08),
                              color: PRIMARY,
                              fontSize: "0.75rem",
                              height: 22,
                              borderRadius: "4px",
                              fontWeight: 500,
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        ))}
                        {categories.length > 2 && (
                          <Tooltip title={categories.slice(2).map((c) => c.Title).join(", ")} arrow placement="top">
                            <Chip
                              label={`+${categories.length - 2}`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(PRIMARY, 0.06),
                                color: alpha(PRIMARY, 0.7),
                                fontSize: "0.75rem",
                                height: 22,
                                borderRadius: "4px",
                                fontWeight: 600,
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          </Tooltip>
                        )}
                        {categories.length === 0 && (
                          <Typography sx={{ fontSize: "0.8125rem", color: "#B3BAC5" }}>—</Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Published Date */}
                    <TableCell sx={{ py: 1.25, px: 2 }}>
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <CalendarTodayIcon sx={{ fontSize: "0.8rem", color: "#B3BAC5" }} />
                        <Typography sx={{ fontSize: "0.8125rem", color: "#42526E", fontWeight: 500 }}>
                          {formatDate(doc.PublishedDate)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Open PDF — hidden until row hover */}
                    <TableCell sx={{ py: 1.25, px: 1, textAlign: "center" }}>
                      {doc.DocumentUrl && (
                        <Tooltip title="Open PDF" arrow>
                          <IconButton
                            className="row-action"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.DocumentUrl, "_blank");
                            }}
                            sx={{
                              opacity: 0,
                              color: PRIMARY,
                              width: 28,
                              height: 28,
                              transition: "opacity 0.15s ease",
                              "&:hover": { backgroundColor: alpha(PRIMARY, 0.1) },
                            }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DocumentsTable;