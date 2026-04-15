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
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import SharePointService from "../../../../shared/services/SharePointService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface VerifyReviewTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

type ModalType = "verify" | "reject" | null;

// ─── Action Button ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: "verify" | "reject";
}

const ACTION_STYLES = {
  verify: { bg: "#107C10", hover: "#0B6A0B", color: "#fff", border: "none" },
  reject: { bg: "#fff", hover: "#FDE7E9", color: "#A4262C", border: "1px solid #D13438" },
};

const ActionButton = ({ label, icon, onClick, variant }: ActionButtonProps) => {
  const s = ACTION_STYLES[variant];
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
        width: "100%", py: 1.25, px: 2, borderRadius: "6px",
        border: s.border, backgroundColor: s.bg,
        color: s.color,
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        transition: "background 0.15s",
        "&:hover": { backgroundColor: s.hover },
      }}
    >
      {icon}
      {label}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VerifyReviewTask = ({ task, cr, onTaskComplete }: VerifyReviewTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftFiles, setDraftFiles] = useState<
    { Name: string; ServerRelativeUrl: string; TimeLastModified: string }[]
  >([]);

  // Load draft folder files when CR is available
  useEffect(() => {
    if (!cr?.DraftFolderUrl) return;
    SharePointService.getDraftFolderFiles(cr.DraftFolderUrl)
      .then(setDraftFiles)
      .catch(console.error);
  }, [cr?.DraftFolderUrl]);

  const handleClose = () => {
    setOpenModal(null);
    setComment("");
    setRejectionReason("");
  };

  const handleVerify = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Approved",
        Comments: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error verifying task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const notes = rejectionReason + (comment ? `\n\n${comment}` : "");
      await SharePointService.updateTask(task.Id, {
        Status: "Rejected",
        Comments: notes,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error rejecting task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Derive a label based on task type
  const isDocumentController = task.TaskType === "Document Controller Review";
  const isCombined = task.TaskType === "Publishing Review";
  const roleLabel = isCombined
    ? "Publishing Review"
    : isDocumentController
      ? "Document Controller"
      : "Compliance Authority";

  const infoText = isCombined
    ? "compliance and document control"
    : isDocumentController
      ? "document control"
      : "compliance";

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* ── Info box ── */}
        <Box
          sx={{
            backgroundColor: "#F9F9F9",
            borderRadius: "6px",
            border: "1px solid #EDEBE9",
            px: 1.5, py: 1.25,
            display: "flex", gap: 1, alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#605E5C", lineHeight: 1.5 }}>
            Review the draft document and change request details. Verify that all{" "}
            {infoText} requirements are met
            before approving.
          </Typography>
        </Box>

        {/* ── Draft Document Link ── */}
        {draftFiles.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: 11, fontWeight: 600, color: "#A19F9D",
                textTransform: "uppercase", letterSpacing: 0.5,
                mb: 0.75, px: 0.25,
              }}
            >
              Draft Document
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              {draftFiles.map((file) => (
                <Box
                  key={file.ServerRelativeUrl}
                  component="a"
                  href={file.ServerRelativeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex", alignItems: "center", gap: 1,
                    px: 1.5, py: 1,
                    borderRadius: "6px",
                    border: "1px solid #E1DFDD",
                    backgroundColor: "#fff",
                    color: "#0078D4",
                    fontSize: 13, fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.15s",
                    "&:hover": { backgroundColor: "#EFF6FC", borderColor: "#0078D4" },
                  }}
                >
                  <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                  <Box flex={1} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.Name}
                  </Box>
                  <OpenInNewIcon sx={{ fontSize: 14, color: "#A19F9D" }} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {!draftFiles.length && cr?.DraftDocumentUrl && (
          <Box
            component="a"
            href={cr.DraftDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              px: 1.5, py: 1,
              borderRadius: "6px",
              border: "1px solid #E1DFDD",
              backgroundColor: "#fff",
              color: "#0078D4",
              fontSize: 13, fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.15s",
              "&:hover": { backgroundColor: "#EFF6FC", borderColor: "#0078D4" },
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
            View Draft Document
            <OpenInNewIcon sx={{ fontSize: 14, color: "#A19F9D", ml: "auto" }} />
          </Box>
        )}

        {/* ── Actions ── */}
        <ActionButton
          label="Verify"
          icon={<CheckIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("verify")}
          variant="verify"
        />

        <ActionButton
          label="Reject"
          icon={<CloseIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("reject")}
          variant="reject"
        />
      </Box>

      {/* ── Verify Modal ── */}
      <Dialog open={openModal === "verify"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Confirm {roleLabel} Verification
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are verifying: <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Comments (optional)"
            multiline rows={4} fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any comments..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
            sx={{ backgroundColor: "#107C10", "&:hover": { backgroundColor: "#0B6A0B" } }}
          >
            {submitting ? "Verifying..." : "Confirm Verification"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject Modal ── */}
      <Dialog open={openModal === "reject"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Reject — {roleLabel} Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are rejecting: <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Rejection Reason *"
            multiline rows={4} fullWidth required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain what doesn't meet requirements..."
          />
          <TextField
            label="Additional Comments (optional)"
            multiline rows={2} fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any additional context..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CloseIcon />}
          >
            {submitting ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VerifyReviewTask;
