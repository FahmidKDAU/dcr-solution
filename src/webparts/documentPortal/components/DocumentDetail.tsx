// src/webparts/documentPortal/components/DocumentDetail.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Document } from "../../../shared/types/Document";
import { BRANDING, getDocTypeColor, getClassificationColor } from "../../../shared/theme";

interface DocumentDetailProps {
  document: Document;
  onBack: () => void;
}

const DocumentDetail = ({ document, onBack }: DocumentDetailProps): React.ReactElement => {
  const [pdfLoading, setPdfLoading] = useState(true);

  const documentUrl = document.FileRef
    ? `${window.location.origin}${document.FileRef}`
    : null;

  const typeColor = getDocTypeColor(document.DocumentType?.Title);
  const classificationColor = getClassificationColor(document.Classification);

  const formatDate = (date?: Date | string): string => {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-AU", { day: "2-digit", month: "long", year: "numeric" });
  };

  const handleDownload = (): void => {
    if (documentUrl) {
      const link = window.document.createElement("a");
      link.href = documentUrl;
      link.setAttribute("download", document.FileLeafRef || document.DocumentTitle || "document");
      link.setAttribute("target", "_blank");
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleOpenInTab = (): void => {
    if (documentUrl) {
      window.open(documentUrl, "_blank");
    }
  };

  // Label styles for metadata
  const labelSx = {
    fontSize: "10px",
    color: BRANDING.primary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    fontWeight: 600,
    marginBottom: "6px",
  };

  const valueSx = {
    fontSize: "13px",
    color: "#1E293B",
    margin: 0,
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
      {/* ══════════════════════════════════════════════════════════════════════
          Blue Header with Breadcrumb & Actions
          ══════════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${BRANDING.primary} 0%, ${BRANDING.primaryLight} 100%)`,
          padding: "12px 24px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left side: Back + Breadcrumb */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon sx={{ fontSize: "16px !important" }} />}
            sx={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "white",
              textTransform: "none",
              fontWeight: 400,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            Back
          </Button>

          <Box sx={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.3)" }} />

          {/* Breadcrumb */}
          <Box display="flex" alignItems="center" gap={0.75} sx={{ fontSize: "12px", opacity: 0.9 }}>
            <Typography component="span" sx={{ fontSize: "12px", color: "white" }}>
              Documents
            </Typography>
            <Typography component="span" sx={{ fontSize: "12px", color: "white", opacity: 0.5 }}>
              /
            </Typography>
            {document.DocumentType?.Title && (
              <>
                <Typography component="span" sx={{ fontSize: "12px", color: "white" }}>
                  {document.DocumentType.Title}
                </Typography>
                <Typography component="span" sx={{ fontSize: "12px", color: "white", opacity: 0.5 }}>
                  /
                </Typography>
              </>
            )}
            <Typography component="span" sx={{ fontSize: "12px", color: "white", fontWeight: 500 }}>
              {document.DocumentTitle}
            </Typography>
          </Box>
        </Box>

        {/* Right side: Actions */}
        <Box display="flex" gap={1}>
          <Button
            onClick={handleDownload}
            startIcon={<DownloadIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              padding: "6px 14px",
              fontSize: "12px",
              backgroundColor: "white",
              color: BRANDING.primary,
              borderRadius: "6px",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": { backgroundColor: "#F1F5F9" },
            }}
          >
            Download
          </Button>
          <Button
            onClick={handleOpenInTab}
            startIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              padding: "6px 14px",
              fontSize: "12px",
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "white",
              borderRadius: "6px",
              textTransform: "none",
              fontWeight: 400,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            Open in tab
          </Button>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          Content: Info Panel + PDF Viewer
          ══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── Info Panel ── */}
        <Box
          sx={{
            width: 300,
            borderRight: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
            padding: "24px",
            overflow: "auto",
          }}
        >
          {/* Document Title */}
          <Box sx={{ marginBottom: "24px" }}>
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
                marginBottom: "12px",
              }}
            >
              {document.DocumentType?.Title ?? "Document"}
            </Box>
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#1E293B",
                lineHeight: 1.4,
              }}
            >
              {document.DocumentTitle}
            </Typography>
          </Box>

          {/* Metadata Fields */}
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Category */}
            {document.Category && document.Category.length > 0 && (
              <Box>
                <Typography sx={labelSx}>Category</Typography>
                <Typography sx={valueSx}>
                  {document.Category.map((c) => c.Title).join(", ")}
                </Typography>
              </Box>
            )}

            {/* Functions */}
            {document.BusinessFunction && document.BusinessFunction.length > 0 && (
              <Box>
                <Typography sx={labelSx}>Functions</Typography>
                <Box display="flex" gap={0.75} flexWrap="wrap">
                  {document.BusinessFunction.map((func) => (
                    <Chip
                      key={func.Id}
                      label={func.Title}
                      size="small"
                      sx={{
                        fontSize: "11px",
                        height: "26px",
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        color: "#475569",
                        fontWeight: 400,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Classification */}
            {document.Classification && (
              <Box>
                <Typography sx={labelSx}>Classification</Typography>
                <Chip
                  label={document.Classification}
                  size="small"
                  sx={{
                    fontSize: "12px",
                    height: "26px",
                    fontWeight: 500,
                    backgroundColor:
                      document.Classification === "Internal"
                        ? "#FEF3E2"
                        : document.Classification === "Confidential"
                        ? "#FEE2E2"
                        : document.Classification === "Restricted"
                        ? "#FEE2E2"
                        : "#E6F7F2",
                    color: classificationColor,
                  }}
                />
              </Box>
            )}

            {/* Released */}
            {document.PublishedDate && (
              <Box>
                <Typography sx={labelSx}>Released</Typography>
                <Typography sx={valueSx}>{formatDate(document.PublishedDate)}</Typography>
              </Box>
            )}

            {/* File */}
            {document.FileLeafRef && (
              <Box>
                <Typography sx={labelSx}>File</Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748B", wordBreak: "break-all" }}>
                  {document.FileLeafRef}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── PDF Viewer ── */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#F1F5F9",
            position: "relative",
          }}
        >
          {/* Loading state */}
          {pdfLoading && documentUrl && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F1F5F9",
                zIndex: 5,
                gap: 2,
              }}
            >
              <CircularProgress size={32} sx={{ color: BRANDING.primary }} />
              <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
                Loading document...
              </Typography>
            </Box>
          )}

          {documentUrl ? (
            <iframe
              src={documentUrl}
              width="100%"
              height="100%"
              title="Document preview"
              style={{ border: "none" }}
              onLoad={() => setPdfLoading(false)}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 100,
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <Typography sx={{ fontSize: "28px", color: "#CBD5E1" }}>☰</Typography>
              </Box>
              <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
                Document preview not available
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentDetail;