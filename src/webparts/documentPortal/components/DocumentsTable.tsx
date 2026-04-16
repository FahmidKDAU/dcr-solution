// src/webparts/documentPortal/components/DocumentsTable.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Document } from "../../../shared/types/Document";
import { BRANDING, getDocTypeColor } from "../../../shared/theme";

interface DocumentsTableProps {
  documents: Document[];
  onRowClick: (doc: Document) => void;
}

type SortKey = "DocumentTitle" | "DocumentType" | "PublishedDate";

const formatDate = (date?: string | Date): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
};

const DocumentsTable = ({ documents, onRowClick }: DocumentsTableProps): React.ReactElement => {
  const [orderBy, setOrderBy] = useState<SortKey>("DocumentTitle");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (column: SortKey): void => {
    if (orderBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(column);
      setOrder("asc");
    }
  };

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      let aVal: string;
      let bVal: string;

      switch (orderBy) {
        case "DocumentType":
          aVal = a.DocumentType?.Title ?? "";
          bVal = b.DocumentType?.Title ?? "";
          break;
        case "PublishedDate":
          aVal = a.PublishedDate ? new Date(a.PublishedDate).toISOString() : "";
          bVal = b.PublishedDate ? new Date(b.PublishedDate).toISOString() : "";
          break;
        default:
          aVal = a.DocumentTitle ?? "";
          bVal = b.DocumentTitle ?? "";
      }

      return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [documents, orderBy, order]);

  // Header cell styles
  const headerCellSx = {
    backgroundColor: "#F8FAFC",
    color: BRANDING.primary,
    fontWeight: 600,
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    padding: "12px 16px",
    borderBottom: `2px solid rgba(15, 76, 129, 0.15)`,
    whiteSpace: "nowrap" as const,
  };

  const sortLabelSx = {
    color: `${BRANDING.primary} !important`,
    "&.Mui-active": {
      color: `${BRANDING.primary} !important`,
    },
    "& .MuiTableSortLabel-icon": {
      color: `${BRANDING.primary} !important`,
      opacity: 0.5,
    },
  };

  // Empty state
  if (sortedDocuments.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={8}
        flex={1}
      >
        <Typography sx={{ color: "#64748B", fontSize: "14px", mb: 1 }}>
          No documents found
        </Typography>
        <Typography sx={{ color: "#94A3B8", fontSize: "12px" }}>
          Try adjusting your search or filters
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ flex: 1, overflow: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headerCellSx, width: "35%", paddingLeft: "24px" }}>
              <TableSortLabel
                active={orderBy === "DocumentTitle"}
                direction={orderBy === "DocumentTitle" ? order : "asc"}
                onClick={() => handleSort("DocumentTitle")}
                sx={sortLabelSx}
              >
                Document name
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ ...headerCellSx, width: "10%" }}>
              <TableSortLabel
                active={orderBy === "DocumentType"}
                direction={orderBy === "DocumentType" ? order : "asc"}
                onClick={() => handleSort("DocumentType")}
                sx={sortLabelSx}
              >
                Type
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ ...headerCellSx, width: "22%" }}>Function</TableCell>
            <TableCell sx={{ ...headerCellSx, width: "18%" }}>Category</TableCell>
            <TableCell sx={{ ...headerCellSx, width: "10%" }}>
              <TableSortLabel
                active={orderBy === "PublishedDate"}
                direction={orderBy === "PublishedDate" ? order : "asc"}
                onClick={() => handleSort("PublishedDate")}
                sx={sortLabelSx}
              >
                Released
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ ...headerCellSx, width: "5%", textAlign: "center" }} />
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedDocuments.map((doc) => {
            const typeColor = getDocTypeColor(doc.DocumentType?.Title);
            const functions = doc.BusinessFunction?.map((f) => f.Title).join(", ") || "—";
            const categories = doc.Category?.map((c) => c.Title).join(", ") || "—";

            return (
              <TableRow
                key={doc.Id}
                onClick={() => onRowClick(doc)}
                sx={{
                  cursor: "pointer",
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "#F8FAFC",
                  },
                }}
              >
                {/* Document Name */}
                <TableCell
                  sx={{
                    padding: "14px 16px",
                    paddingLeft: "24px",
                    color: "#1E293B",
                    fontWeight: 500,
                    fontSize: "13px",
                  }}
                >
                  {doc.DocumentTitle}
                </TableCell>

                {/* Type Badge */}
                <TableCell sx={{ padding: "14px 16px" }}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "4px 10px",
                      borderRadius: "4px",
                      backgroundColor: typeColor,
                      color: "white",
                    }}
                  >
                    {doc.DocumentType?.Title ?? "—"}
                  </Box>
                </TableCell>

                {/* Function */}
                <TableCell
                  sx={{
                    padding: "14px 16px",
                    color: "#64748B",
                    fontSize: "12px",
                  }}
                >
                  {functions}
                </TableCell>

                {/* Category */}
                <TableCell
                  sx={{
                    padding: "14px 16px",
                    color: "#64748B",
                    fontSize: "12px",
                  }}
                >
                  {categories}
                </TableCell>

                {/* Release Date */}
                <TableCell
                  sx={{
                    padding: "14px 16px",
                    color: "#64748B",
                    fontSize: "12px",
                  }}
                >
                  {formatDate(doc.PublishedDate)}
                </TableCell>

                {/* Action */}
                <TableCell sx={{ padding: "14px 16px", textAlign: "center" }}>
                  {doc.FileRef && (
                    <Tooltip title="Open in new tab" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${window.location.origin}${doc.FileRef}`, "_blank");
                        }}
                        sx={{
                          color: "#94A3B8",
                          padding: "4px",
                          "&:hover": {
                            color: BRANDING.primary,
                            backgroundColor: "rgba(15, 76, 129, 0.08)",
                          },
                        }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DocumentsTable;