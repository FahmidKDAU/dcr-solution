import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ReadAcknowledgement } from "../../../../shared/types/ReadAcknowledgement";
import SharePointService from "../../../../shared/services/SharePointService";

interface ReadRequirementTaskProps {
  acknowledgement: ReadAcknowledgement;
  onComplete: () => void;
}

const ReadRequirementTask: React.FC<ReadRequirementTaskProps> = ({
  acknowledgement,
  onComplete,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const doc = acknowledgement.PublishedDocumentId;
  const dueDate = acknowledgement.ReadRequirementsId?.DueDate;

  const handleAcknowledge = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.acknowledgeDocument(
        acknowledgement.Id,
        acknowledgement.DocumentVersion,
      );
      setConfirmed(true);
      setTimeout(() => onComplete(), 1200);
    } catch (error) {
      console.error("Error acknowledging document:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1.5}
        py={4}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 40, color: "#107C10" }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#107C10" }}>
          Acknowledged
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        sx={{
          border: "1px solid #EDEBE9",
          borderRadius: "6px",
          p: 2,
          backgroundColor: "#F8FAFC",
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#323130", mb: 0.5 }}>
          {doc?.DocumentTitle ?? "Document"}
        </Typography>
        {dueDate && (
          <Typography sx={{ fontSize: 12, color: "#A19F9D" }}>
            Due:{" "}
            {new Date(dueDate).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Typography>
        )}
        {doc?.PublishedFileUrl && (
          <Button
            size="small"
            startIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            href={doc.PublishedFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              mt: 1.5,
              fontSize: 12,
              textTransform: "none",
              color: "#0078D4",
              p: 0,
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Open document
          </Button>
        )}
      </Box>

      <Typography sx={{ fontSize: 13, color: "#605E5C", lineHeight: 1.6 }}>
        Please read the document above in full before confirming acknowledgement.
        By confirming, you are declaring that you have read and understood the
        contents of this document.
      </Typography>

      <Box
        component="button"
        onClick={() => void handleAcknowledge()}
        disabled={submitting}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          width: "100%",
          py: 1.25,
          px: 2,
          borderRadius: "4px",
          border: "none",
          backgroundColor: submitting ? "#F3F2F1" : "#107C10",
          color: submitting ? "#A19F9D" : "white",
          fontSize: 13,
          fontWeight: 600,
          cursor: submitting ? "not-allowed" : "pointer",
          transition: "background 0.15s",
          "&:hover:not(:disabled)": { backgroundColor: "#0B6A0B" },
        }}
      >
        {submitting && <CircularProgress size={14} sx={{ color: "white" }} />}
        {submitting
          ? "Confirming..."
          : "I have read and understood this document"}
      </Box>
    </Box>
  );
};

export default ReadRequirementTask;
