import React, { useState } from "react";
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import SharePointService from "../../../../shared/services/SharePointService";

// ─── Required fields for this task type ──────────────────────────────────────

const REQUIRED_FIELDS: { field: keyof IChangeRequest; label: string }[] = [
  { field: "ReleaseAuthority", label: "Release Authority" },
  { field: "Author0",          label: "Document Author" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CAReviewTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

type ModalType = "complete" | "request_info" | null;

// ─── Action Button ────────────────────────────────────────────────────────────

const ACTION_STYLES = {
  complete:     { bg: "#107C10", hover: "#0B6A0B", color: "#fff",    border: "none" },
  request_info: { bg: "#fff",    hover: "#F3F2F1", color: "#605E5C", border: "1px solid #C8C6C4" },
};

const ActionButton = ({
  label, icon, onClick, variant, disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: keyof typeof ACTION_STYLES;
  disabled?: boolean;
}) => {
  const s = ACTION_STYLES[variant];
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
        width: "100%", py: 1, px: 2, borderRadius: "4px",
        border: s.border,
        backgroundColor: disabled ? "#F3F2F1" : s.bg,
        color: disabled ? "#A19F9D" : s.color,
        fontSize: 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        "&:hover:not(:disabled)": { backgroundColor: disabled ? "#F3F2F1" : s.hover },
      }}
    >
      {icon}
      {label}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CAReviewTask = ({ task, cr, onTaskComplete }: CAReviewTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [infoRequest, setInfoRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Required field validation ──
  const missingFields = cr
    ? REQUIRED_FIELDS.filter(({ field }) => !cr[field])
    : REQUIRED_FIELDS;
  const canComplete = missingFields.length === 0;

  const handleClose = () => {
    setOpenModal(null);
    setComment("");
    setInfoRequest("");
  };

  const handleComplete = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Complete",
        Comment: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error completing review task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestInfo = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Needs more info",
        Comment: infoRequest,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error requesting info:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={1.5}>

        {/* ── Missing fields warning ── */}
        {missingFields.length > 0 && (
          <Box sx={{
            display: "flex", gap: 1, alignItems: "flex-start",
            backgroundColor: "#FFF4CE",
            border: "1px solid #FFB900",
            borderRadius: "4px",
            px: 1.5, py: 1.25,
          }}>
            <WarningAmberIcon sx={{ fontSize: 16, color: "#835B00", mt: 0.2, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#603D00", lineHeight: 1.4 }}>
                Complete required fields to finish review
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#835B00", lineHeight: 1.5, mt: 0.25 }}>
                Fill in the following on the right:{" "}
                <strong>{missingFields.map((f) => f.label).join(", ")}</strong>
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── What this review involves ── */}
        <Box sx={{
          backgroundColor: "#F3F2F1", borderRadius: "4px",
          px: 1.5, py: 1.25,
          display: "flex", gap: 1, alignItems: "flex-start",
        }}>
          <InfoOutlinedIcon sx={{ fontSize: 15, color: "#605E5C", mt: 0.2, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, color: "#605E5C", lineHeight: 1.5 }}>
            Review the change request details on the right and ensure all required
            fields are filled before marking as complete.
          </Typography>
        </Box>

        {/* ── Complete Review ── */}
        <ActionButton
          label="Mark Review as Complete"
          icon={<CheckIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("complete")}
          variant="complete"
          disabled={!canComplete}
        />

        {/* ── Request More Info ── */}
        <ActionButton
          label="Request More Information"
          icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("request_info")}
          variant="request_info"
        />

      </Box>

      {/* ── Complete Modal ── */}
      <Dialog open={openModal === "complete"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Complete Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are marking this review as complete: <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Comments (optional)"
            multiline rows={4} fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any review notes or comments..."
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

      {/* ── Request Info Modal ── */}
      <Dialog open={openModal === "request_info"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Request More Information
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Describe what additional information is needed from the requestor.
            The task will be placed on hold until they respond.
          </Typography>
          <TextField
            label="Information Required *"
            multiline rows={4} fullWidth required
            value={infoRequest}
            onChange={(e) => setInfoRequest(e.target.value)}
            placeholder="What information do you need before this review can be completed?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleRequestInfo}
            variant="contained"
            disabled={!infoRequest.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <InfoOutlinedIcon />}
          >
            {submitting ? "Sending..." : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CAReviewTask;