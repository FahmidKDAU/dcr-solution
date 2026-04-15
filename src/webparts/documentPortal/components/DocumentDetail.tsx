// src/webparts/documentPortal/components/DocumentDetail.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  Download,
  OpenInNew,
  Home,
  Description,
  Article,
  Policy,
  Assignment,
  Category,
  Functions,
  CalendarToday,
  ArrowBack,
  MoreHoriz,
} from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Document } from "../../../shared/types/Document";

interface DocumentDetailProps {
  document: Document;
  onBack: () => void;
}



const DocumentDetail = ({
  document,
  onBack,
}: DocumentDetailProps): React.ReactElement => {
  const [showActions, setShowActions] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);

  // Build the document URL for viewing
  // SharePoint files can be viewed directly via their FileRef
  const documentUrl = document.FileRef
    ? `${window.location.origin}${document.FileRef}`
    : null;

  // For PDF preview, we can use SharePoint's built-in viewer or direct URL
  // Office Online viewer URL format for better PDF rendering
// Replace your pdfViewerUrl with this:
const pdfViewerUrl = document.FileRef
  ? `${window.location.origin}${document.FileRef}`
  : null;
  // Alternatively, use direct file URL (works for PDFs in modern browsers)
  const directPdfUrl = documentUrl;

  const formatDate = (dateInput: Date | string): string => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDownloadClick = (): void => {
    if (documentUrl) {
      // Create a temporary link to trigger download
      const link = window.document.createElement("a");
      link.href = documentUrl;
      link.setAttribute("download", document.FileLeafRef || document.DocumentTitle || "document");
      link.setAttribute("target", "_blank");
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = (): void => {
    if (documentUrl) {
      window.open(documentUrl, "_blank");
    }
  };

  // Add right after the URL definitions (around line 35)
console.log("=== Document Debug ===");
console.log("Document:", document);
console.log("FileRef:", document.FileRef);
console.log("FileLeafRef:", document.FileLeafRef);
console.log("documentUrl:", documentUrl);
console.log("pdfViewerUrl:", pdfViewerUrl);

  // Get appropriate icon based on document type
  const getDocumentIcon = (): React.ReactElement => {
    const type = document.DocumentType?.Title?.toLowerCase();
    const iconProps = {
      sx: {
        fontSize: "2rem",
        padding: "8px",
        borderRadius: "8px",
        backgroundColor: "#6e3cbe",
        color: "white",
        boxShadow: "0 2px 8px rgba(110, 60, 190, 0.3)",
      },
    };

    switch (type) {
      case "policy":
        return <Policy {...iconProps} />;
      case "procedure":
        return <Assignment {...iconProps} />;
      case "form":
        return <Article {...iconProps} />;
      default:
        return <Description {...iconProps} />;
    }
  };

  // Loading skeleton
  if (!document) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 140px)",
          display: "flex",
          flexDirection: "row",
          gap: 2,
          padding: "8px",
        }}
      >
        {/* Left Sidebar Skeleton */}
        <Paper
          elevation={2}
          sx={{
            background: "#fafafa",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #e0e0e0",
            width: "380px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box display="flex" gap={1} mb={1}>
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={120} height={20} />
          </Box>
          <Skeleton variant="rounded" width="100%" height={36} />
          <Box display="flex" alignItems="flex-start" gap={2} mt={2}>
            <Skeleton variant="circular" width={64} height={64} />
            <Box flex={1}>
              <Skeleton variant="text" width="100%" height={32} />
              <Skeleton variant="rounded" width={100} height={28} sx={{ mt: 1 }} />
            </Box>
          </Box>
          <Box mt={2}>
            <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Skeleton variant="rectangular" height={50} />
              <Skeleton variant="rectangular" height={50} />
              <Skeleton variant="rectangular" height={50} />
            </Box>
          </Box>
        </Paper>

        {/* PDF Viewer Skeleton */}
        <Box
          sx={{
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
            flex: 1,
            minWidth: 0,
            backgroundColor: "#fff",
          }}
        >
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 140px)",
        display: "flex",
        flexDirection: "row",
        gap: 2,
        padding: "8px",
      }}
    >
      {/* Left Sidebar */}
      <Paper
        elevation={1}
        sx={{
          background: "#fafafa",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #e0e0e0",
          width: "420px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          boxShadow: "0px 2px 2px 1px rgba(0, 0, 0, 0.1)",
          overflow: "auto",
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: "#bdbdbd" }} />}
          sx={{
            mb: 0,
            pb: 2,
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          <Link
            component="button"
            color="inherit"
            onClick={(e) => {
              e.preventDefault();
              // In SPFx, you might want to navigate to the site home
              // For now, just go back to documents
              onBack();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              fontSize: "0.875rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
              color: "#757575",
              fontWeight: 500,
              "&:hover": { color: "#6e3cbe" },
            }}
          >
            <Home sx={{ mr: 0.5, fontSize: "0.9rem" }} />
            Dashboard
          </Link>
          <Link
            component="button"
            color="inherit"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            sx={{
              textDecoration: "none",
              fontSize: "0.9rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
              "&:hover": { color: "#6e3cbe" },
            }}
          >
            Documents
          </Link>
          {document.DocumentType?.Title && (
            <Link
              component="button"
              color="inherit"
              onClick={(e) => {
                e.preventDefault();
                // Could filter by type in future
                onBack();
              }}
              sx={{
                textDecoration: "none",
                fontSize: "0.9rem",
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                "&:hover": { color: "#6e3cbe" },
              }}
            >
              {document.DocumentType.Title}
            </Link>
          )}
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "180px",
              color: "#212121",
            }}
          >
            {document.DocumentTitle || "Document"}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBack />}
            variant="outlined"
            size="medium"
            fullWidth
            sx={{
              backgroundColor: "white",
              borderColor: "#e0e0e0",
              color: "#6e3cbe",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              py: 1.2,
              fontSize: "0.9rem",
              borderWidth: "1px",
              "&:hover": {
                backgroundColor: "rgba(110, 60, 190, 0.05)",
                borderColor: "#6e3cbe",
                borderWidth: "1px",
              },
            }}
          >
            Back to Documents
          </Button>
        </Box>

        {/* Document Header */}
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0px 2px 2px 1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box display="flex" alignItems="flex-start" gap={2}>
            {/* Icon */}
            <Box
              flexShrink={0}
              sx={{
                backgroundColor: "rgba(110, 60, 190, 0.1)",
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getDocumentIcon()}
            </Box>

            {/* Title and Type */}
            <Box flex={1} minWidth={0}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#212121",
                  fontSize: "1.05rem",
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                  mb: 1.2,
                }}
              >
                {document.DocumentTitle || "Loading..."}
              </Typography>

              {/* Document Type Badge */}
              {document.DocumentType?.Title && (
                <Chip
                  label={document.DocumentType.Title}
                  size="small"
                  sx={{
                    backgroundColor: "#6e3cbe",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    height: "26px",
                    borderRadius: "6px",
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Document Information Section */}
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0px 2px 2px 1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#212121",
              fontSize: "0.95rem",
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Description sx={{ fontSize: "1.1rem", color: "#6e3cbe" }} />
            Document Information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* Categories */}
            {document.Category && document.Category.length > 0 && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.2}>
                  <Category sx={{ fontSize: "1.1rem", color: "#6e3cbe" }} />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#616161",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Categories
                  </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {document.Category.map((category) => (
                    <Chip
                      key={category.Id}
                      label={category.Title}
                      size="small"
                      sx={{
                        height: "28px",
                        fontSize: "0.8rem",
                        backgroundColor: "rgba(110, 60, 190, 0.1)",
                        color: "#6e3cbe",
                        fontWeight: 600,
                        borderRadius: "6px",
                        "&:hover": {
                          backgroundColor: "rgba(110, 60, 190, 0.15)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Business Functions */}
            {document.BusinessFunction && document.BusinessFunction.length > 0 && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.2}>
                  <Functions sx={{ fontSize: "1.1rem", color: "#9c27b0" }} />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#616161",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Functions
                  </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {document.BusinessFunction.map((func) => (
                    <Chip
                      key={func.Id}
                      label={func.Title}
                      size="small"
                      sx={{
                        height: "28px",
                        fontSize: "0.8rem",
                        backgroundColor: "rgba(156, 39, 176, 0.1)",
                        color: "#9c27b0",
                        fontWeight: 600,
                        borderRadius: "6px",
                        "&:hover": {
                          backgroundColor: "rgba(156, 39, 176, 0.15)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Classification Badge (if present) */}
            {document.Classification && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.2}>
                  <Description sx={{ fontSize: "1.1rem", color: "#1976d2" }} />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#616161",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Classification
                  </Typography>
                </Box>
                <Chip
                  label={document.Classification}
                  size="small"
                  sx={{
                    height: "28px",
                    fontSize: "0.8rem",
                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                    color: "#1976d2",
                    fontWeight: 600,
                    borderRadius: "6px",
                  }}
                />
              </Box>
            )}

            {/* Release Date */}
            {document.PublishedDate && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.2}>
                  <CalendarToday sx={{ fontSize: "1.1rem", color: "#43a047" }} />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#616161",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Released
                  </Typography>
                </Box>
                <Chip
                  label={formatDate(document.PublishedDate)}
                  size="small"
                  icon={
                    <CalendarToday
                      sx={{
                        fontSize: "0.9rem !important",
                        color: "#43a047 !important",
                      }}
                    />
                  }
                  sx={{
                    height: "28px",
                    fontSize: "0.8rem",
                    backgroundColor: "rgba(67, 160, 71, 0.1)",
                    color: "#43a047",
                    fontWeight: 600,
                    borderRadius: "6px",
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Right Side - Document Viewer */}
      <Box
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          flex: 1,
          minWidth: 0,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Document Viewer */}
        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          {pdfLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                zIndex: 5,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={60}
                  sx={{ margin: "0 auto", mb: 2 }}
                />
                <Typography color="text.secondary">Loading document...</Typography>
              </Box>
            </Box>
          )}

          {pdfViewerUrl ? (
            <iframe
              src={pdfViewerUrl}
              width="100%"
              height="100%"
              title="Document Content"
              style={{ border: "none" }}
              onLoad={() => setPdfLoading(false)}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography color="text.secondary">
                Document preview not available
              </Typography>
            </Box>
          )}

          {/* Floating Action Bar */}
          {showActions && directPdfUrl && (
            <Box
              sx={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                padding: "10px 16px",
                borderRadius: "16px",
                boxShadow:
                  "0 4px 20px rgba(110, 60, 190, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
                display: "flex",
                gap: 2,
                alignItems: "center",
                width: "fit-content",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow:
                    "0 12px 40px rgba(110, 60, 190, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)",
                  transform: "translateX(-50%) translateY(-2px)",
                },
              }}
            >
              <Button
                onClick={handleOpenInNewTab}
                variant="contained"
                startIcon={<OpenInNew />}
                sx={{
                  backgroundColor: "#6e3cbe",
                  color: "white",
                  fontWeight: 600,
                  borderRadius: "12px",
                  textTransform: "none",
                  height: "40px",
                  px: 2.5,
                  fontSize: "0.85rem",
                  boxShadow: "0 2px 8px rgba(110, 60, 190, 0.2)",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: "#5a2d9f",
                    boxShadow: "0 4px 12px rgba(110, 60, 190, 0.4)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                Open in Tab
              </Button>
              <Button
                onClick={handleDownloadClick}
                variant="outlined"
                startIcon={<Download />}
                sx={{
                  borderColor: "#6e3cbe",
                  color: "#6e3cbe",
                  background: "white",
                  fontWeight: 600,
                  borderRadius: "12px",
                  textTransform: "none",
                  height: "40px",
                  px: 2.5,
                  fontSize: "0.85rem",
                  borderWidth: "2px",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    borderColor: "#5a2d9f",
                    backgroundColor: "rgba(110, 60, 190, 0.08)",
                    borderWidth: "2px",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                Download
              </Button>
              <Button
                onClick={() => setShowActions(false)}
                variant="text"
                sx={{
                  color: "#666",
                  fontWeight: 600,
                  borderRadius: "12px",
                  textTransform: "none",
                  height: "40px",
                  px: 2,
                  fontSize: "0.8rem",
                  minWidth: "auto",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                Hide
              </Button>
            </Box>
          )}

          {/* Show Actions Button */}
          {!showActions && directPdfUrl && (
            <Box
              sx={{
                position: "absolute",
                bottom: 24,
                right: 24,
                zIndex: 10,
              }}
            >
              <Button
                onClick={() => setShowActions(true)}
                variant="contained"
                sx={{
                  backgroundColor: "rgba(110, 60, 190, 0.95)",
                  color: "white",
                  fontWeight: 600,
                  borderRadius: "50%",
                  width: "56px",
                  height: "56px",
                  minWidth: "56px",
                  boxShadow: "0 4px 12px rgba(110, 60, 190, 0.4)",
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    backgroundColor: "rgba(90, 45, 159, 0.95)",
                    transform: "scale(1.05)",
                    boxShadow: "0 6px 16px rgba(110, 60, 190, 0.5)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <MoreHoriz sx={{ color: "white", fontSize: 28 }} />
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentDetail;