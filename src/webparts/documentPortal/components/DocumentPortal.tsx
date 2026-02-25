// src/webparts/documentPortal/components/DocumentPortal.tsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Document } from "../../../shared/types/Document";
import { useDocuments } from "../../../shared/hooks/useDocuments";
import DocumentsTable from "./DocumentsTable";


// ── Simple state-based navigation ────────────────────────────────────────────
// SPFx doesn't have a router, so we swap between 'list' and 'detail' views
// using component state. Feels like a page change to the user.
type View = "list" | "detail";
// ─────────────────────────────────────────────────────────────────────────────

const DocumentPortal = (): React.ReactElement => {
  const { documents, loading, error } = useDocuments();
  const [view, setView] = useState<View>("list");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleRowClick = (doc: Document): void => {
    setSelectedDocument(doc);
    setView("detail");
  };

  const handleBack = (): void => {
    setSelectedDocument(null);
    setView("list");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (view === "detail" && selectedDocument) {
    // return (
    //   // <DocumentDetail
    //   //   document={selectedDocument}
    //   //   onBack={handleBack}
    //   // />
    // );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
        gap: 2,
      }}
    >
      {/* Header */}
      <Box>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Document Repository
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {documents.length} published documents
        </Typography>
      </Box>

      {/* Table */}
      <DocumentsTable
        documents={documents}
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default DocumentPortal;