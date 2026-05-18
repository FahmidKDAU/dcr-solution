import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import { Task } from "../../../../shared/types/Task";
import { Document } from "../../../../shared/types/Document";
import SharePointService from "../../../../shared/services/SharePointService";
import { getReviewPeriodLabel } from "../../../../shared/constants";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentReviewTaskProps {
  task: Task;
  onTaskComplete?: () => void;
}

type ModalType = "complete" | "start_cr" | null;

// ─── Main Component ───────────────────────────────────────────────────────────

const DocumentReviewTask = ({ task, onTaskComplete }: DocumentReviewTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [notes, setNotes] = useState("");
  const [scopeOfChange, setScopeOfChange] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [minorChanges, setMinorChanges] = useState<{ Id: number; Title: string; Status: string }[]>([]);

  // ── Fetch Published Document ──
  useEffect(() => {
    if (!task.PublishedDocumentId) return;
    setDocLoading(true);
    SharePointService.getDocumentById(task.PublishedDocumentId)
      .then(setDocument)
      .catch(console.error)
      .finally(() => setDocLoading(false));
  }, [task.PublishedDocumentId]);

  // ── Fetch Minor Changes ──
  useEffect(() => {
    if (!task.PublishedDocumentId) return;
    SharePointService.getMinorChangesByDocument(task.PublishedDocumentId)
      .then(setMinorChanges)
      .catch(console.error);
  }, [task.PublishedDocumentId]);

  const pendingMinorChanges = minorChanges.filter((mc) => mc.Status === "Pending");

  const handleClose = () => {
    setOpenModal(null);
    setNotes("");
    setScopeOfChange("");
  };

  // ── Complete Review ──
  const handleComplete = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Complete",
        Comments: notes || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error completing review task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Start Change Request ──
  const handleStartCR = async (): Promise<void> => {
    if (!scopeOfChange.trim()) return;
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Start Change Request",
        Comments: scopeOfChange,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error starting change request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>

        {/* ── Info box ── */}
        <Box
          sx={{
            backgroundColor: "#F9F9F9",
            borderRadius: "6px",
            border: "1px solid #EDEBE9",
            px: 1.5,
            py: 1.25,
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 15, color: "#A19F9D", mt: 0.2, flexShrink: 0 }}
          />
          <Typography sx={{ fontSize: 12, color: "#605E5C", lineHeight: 1.5 }}>
            Review the document below. If changes are required, start a Change
            Request. Otherwise mark the review as complete.
          </Typography>
        </Box>

        {/* ── Document loading ── */}
        {docLoading && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={20} />
          </Box>
        )}

        {/* ── Document details ── */}
        {!docLoading && document && (
          <Box display="flex" flexDirection="column" gap={1.5}>

            {/* Document link */}
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#A19F9D",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 0.75,
                }}
              >
                Document
              </Typography>
              <Box
                component="a"
                href={document.PublishedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: "6px",
                  border: "1px solid #E1DFDD",
                  backgroundColor: "#fff",
                  color: "#0078D4",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  "&:hover": {
                    backgroundColor: "#EFF6FC",
                    borderColor: "#0078D4",
                  },
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                <Box
                  flex={1}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {document.DocumentTitle}
                </Box>
                <OpenInNewIcon sx={{ fontSize: 14, color: "#A19F9D" }} />
              </Box>
            </Box>

            {/* Review period + review date */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#F9F9F9",
                  border: "1px solid #EDEBE9",
                  borderRadius: "6px",
                }}
              >
                <EventRepeatIcon sx={{ fontSize: 15, color: "#A19F9D" }} />
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#A19F9D",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Review Period
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}>
                    {getReviewPeriodLabel(document.ReviewPeriod)}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#F9F9F9",
                  border: "1px solid #EDEBE9",
                  borderRadius: "6px",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#A19F9D",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Review Date
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}>
                    {formatDate(document.ReviewDate)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Pending Minor Changes ── */}
        {pendingMinorChanges.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "#A19F9D",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 0.75,
              }}
            >
              Pending Minor Changes ({pendingMinorChanges.length})
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              {pendingMinorChanges.map((mc) => (
                <Box
                  key={mc.Id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: "6px",
                    border: "1px solid #E1DFDD",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#FFB900",
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: "#323130" }}>
                    {mc.Title}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── Actions ── */}
        <Box display="flex" flexDirection="column" gap={0.75}>
          {/* Complete Review */}
          <Box
            component="button"
            onClick={() => setOpenModal("complete")}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              width: "100%",
              py: 1.25,
              px: 2,
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#107C10",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
              "&:hover": { backgroundColor: "#0B6A0B" },
            }}
          >
            <CheckIcon sx={{ fontSize: 16 }} />
            Complete Review
          </Box>

          {/* Start Change Request */}
          <Box
            component="button"
            onClick={() => setOpenModal("start_cr")}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              width: "100%",
              py: 1.25,
              px: 2,
              borderRadius: "6px",
              border: "1px solid #0078D4",
              backgroundColor: "#fff",
              color: "#0078D4",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": { backgroundColor: "#EFF6FC" },
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
            Start Change Request
          </Box>
        </Box>
      </Box>

      {/* ── Complete Review Modal ── */}
      <Dialog open={openModal === "complete"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Complete Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are marking this periodic review as complete. The review date
            will be reset based on the review period.
          </Typography>
          <TextField
            label="Notes (optional)"
            multiline
            rows={4}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any review notes..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
            sx={{ backgroundColor: "#107C10", "&:hover": { backgroundColor: "#0B6A0B" } }}
          >
            {submitting ? "Completing..." : "Confirm Complete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Start Change Request Modal ── */}
      <Dialog open={openModal === "start_cr"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Start Change Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            A new Change Request will be created for{" "}
            <strong>{document?.DocumentTitle}</strong> with all existing document
            details pre-populated.
          </Typography>
          <TextField
            label="Scope of Change *"
            multiline
            rows={4}
            fullWidth
            required
            value={scopeOfChange}
            onChange={(e) => setScopeOfChange(e.target.value)}
            placeholder="Describe what changes are required based on your review..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleStartCR}
            variant="contained"
            disabled={!scopeOfChange.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <AddCircleOutlineIcon />}
            sx={{ backgroundColor: "#0078D4", "&:hover": { backgroundColor: "#006CBE" } }}
          >
            {submitting ? "Creating..." : "Create Change Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentReviewTask;