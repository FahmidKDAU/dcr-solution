import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { MinorChange } from "../../../../shared/types/MinorChange";
import SharePointService from "../../../../shared/services/SharePointService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MinorChangesTabProps {
  documentId: number | undefined;
}

// ─── Status Chip ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Pending:     { bg: "#FFF4CE", color: "#835B00" },
  Implemented: { bg: "#DFF6DD", color: "#107C10" },
  Cancelled:   { bg: "#F3F2F1", color: "#605E5C" },
};

const StatusChip = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? { bg: "#F3F2F1", color: "#605E5C" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 600,
        px: 1,
        py: 0.25,
        borderRadius: "10px",
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      {status}
    </Box>
  );
};

// ─── Format Date ──────────────────────────────────────────────────────────────

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MinorChangesTab = ({ documentId }: MinorChangesTabProps) => {
  const [items, setItems] = useState<MinorChange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    SharePointService.getMinorChangesByDocument(documentId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [documentId]);

  if (!documentId) {
    return (
      <Box p={3}>
        <Box
          sx={{
            border: "1px dashed #D2D0CE",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          <EditNoteIcon sx={{ color: "#C8C6C4", fontSize: 32, mb: 1 }} />
          <Typography color="text.secondary" fontSize={13}>
            This is a new document — minor changes only apply to existing
            documents.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box p={3}>
        <Box
          sx={{
            border: "1px dashed #D2D0CE",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          <EditNoteIcon sx={{ color: "#C8C6C4", fontSize: 32, mb: 1 }} />
          <Typography color="text.secondary" fontSize={13}>
            No minor changes registered for this document.
          </Typography>
        </Box>
      </Box>
    );
  }

  const pending = items.filter((i) => i.Status === "Pending");
  const other = items.filter((i) => i.Status !== "Pending");

  return (
    <Box p={3} display="flex" flexDirection="column" gap={2}>
      {/* Summary */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.25,
          backgroundColor: pending.length > 0 ? "#FFF8E1" : "#F0FFF0",
          border: `1px solid ${pending.length > 0 ? "#FFE082" : "#C8E6C9"}`,
          borderRadius: "6px",
        }}
      >
        <EditNoteIcon
          sx={{
            fontSize: 18,
            color: pending.length > 0 ? "#835B00" : "#107C10",
          }}
        />
        <Typography sx={{ fontSize: 13, color: "#323130" }}>
          <strong>{pending.length}</strong> pending
          {items.length > pending.length && (
            <Typography
              component="span"
              sx={{ fontSize: 13, color: "#605E5C", ml: 0.5 }}
            >
              · {other.length} implemented/cancelled
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Table */}
      <Box
        sx={{
          border: "1px solid #EDEBE9",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 100px",
            px: 2,
            py: 1,
            backgroundColor: "#FAFAFA",
            borderBottom: "1px solid #EDEBE9",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A19F9D",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Description
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A19F9D",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Status
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A19F9D",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Registered
          </Typography>
        </Box>

        {/* Rows */}
        {items.map((item) => (
          <Box
            key={item.Id}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px",
              px: 2,
              py: 1.25,
              borderBottom: "1px solid #F3F2F1",
              "&:last-child": { borderBottom: "none" },
              "&:hover": { backgroundColor: "#FAFAFA" },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#323130",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {item.Title}
              </Typography>
              {item.ScopeOfChange && item.ScopeOfChange !== item.Title && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#605E5C",
                    lineHeight: 1.4,
                    mt: 0.25,
                  }}
                >
                  {item.ScopeOfChange}
                </Typography>
              )}
              {item.Notes && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#A19F9D",
                    fontStyle: "italic",
                    mt: 0.25,
                  }}
                >
                  {item.Notes}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", pt: 0.25 }}>
              <StatusChip status={item.Status} />
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "#605E5C",
                pt: 0.25,
              }}
            >
              {formatDate(item.Created)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MinorChangesTab;