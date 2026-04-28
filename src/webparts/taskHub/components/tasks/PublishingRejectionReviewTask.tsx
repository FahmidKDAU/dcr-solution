// src/webparts/taskHub/components/tasks/PublishingRejectionReviewTask.tsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ReplayIcon from "@mui/icons-material/Replay";
import BlockIcon from "@mui/icons-material/Block";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import SharePointService from "../../../../shared/services/SharePointService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PublishingRejectionReviewTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

type ModalType = "send_back" | "cancel" | null;

// ─── Action Button ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "danger";
  disabled?: boolean;
}

const ACTION_STYLES = {
  primary: { bg: "#0F6CBD", hover: "#0A3A63", color: "#fff", border: "none" },
  danger: { bg: "#fff", hover: "#FDE7E9", color: "#A4262C", border: "1px solid #D13438" },
};

const ActionButton = ({ label, icon, onClick, variant, disabled = false }: ActionButtonProps) => {
  const s = ACTION_STYLES[variant];
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        width: "100%",
        py: 1.25,
        px: 2,
        borderRadius: "6px",
        border: s.border,
        backgroundColor: disabled ? "#F3F2F1" : s.bg,
        color: disabled ? "#A19F9D" : s.color,
        fontSize: 13,
        fontWeight: 600,
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

const PublishingRejectionReviewTask = ({
  task,
  cr,
  onTaskComplete,
}: PublishingRejectionReviewTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => setOpenModal(null);

  // Send back for revision — PA flow creates new Document Change Process task
  const handleSendBack = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Complete",
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error sending back for revision:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel DCR — terminates the change request
  const handleCancel = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Rejected",
      });
      await SharePointService.updateChangeRequest(cr!.ID, {
        Status: "Rejected",
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error cancelling DCR:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>

        {/* ── Rejection reason box ── */}
        {task.Comments && (
          <Box
            sx={{
              backgroundColor: "#FDF3F4",
              border: "1px solid #F4B8BB",
              borderRadius: "6px",
              px: 2,
              py: 1.5,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 16, color: "#A4262C", mt: 0.25, flexShrink: 0 }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#A4262C",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  mb: 0.5,
                }}
              >
                Rejection Reason
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: "#323130", lineHeight: 1.6 }}
              >
                {task.Comments}
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Document info ── */}
        {cr?.DraftDocumentName && (
          <Box
            sx={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              px: 2,
              py: 1.25,
            }}
          >
            <Typography sx={{ fontSize: 11, color: "#94A3B8", mb: 0.25 }}>
              Document
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#323130" }}>
              {cr.DraftDocumentName}
            </Typography>
          </Box>
        )}

        {/* ── Info message ── */}
        <Box
          sx={{
            backgroundColor: "#FFF4CE",
            border: "1px solid #FFB900",
            borderRadius: "6px",
            px: 1.5,
            py: 1.25,
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <WarningAmberIcon
            sx={{ fontSize: 15, color: "#835B00", mt: 0.2, flexShrink: 0 }}
          />
          <Typography sx={{ fontSize: 12, color: "#603D00", lineHeight: 1.5 }}>
            Review the rejection reason above and decide whether to send the
            document back for revision or cancel this change request entirely.
          </Typography>
        </Box>

        {/* ── Primary action ── */}
        <ActionButton
          label="Send Back for Revision"
          icon={<ReplayIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("send_back")}
          variant="primary"
        />

        {/* ── Cancel DCR ── */}
        <Box display="flex" flexDirection="column" gap={0.75}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: "#A19F9D",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              px: 0.25,
            }}
          >
            Other Actions
          </Typography>
          <ActionButton
            label="Cancel Change Request"
            icon={<BlockIcon sx={{ fontSize: 16 }} />}
            onClick={() => setOpenModal("cancel")}
            variant="danger"
          />
        </Box>
      </Box>

      {/* ── Send Back Modal ── */}
      <Dialog open={openModal === "send_back"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Send Back for Revision
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1}>
            The document will be sent back to the author for revision based on
            the rejection reason. The publishing process will restart once the
            author resubmits.
          </Typography>
          {task.Comments && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                backgroundColor: "#FDF3F4",
                borderRadius: "6px",
                border: "1px solid #F4B8BB",
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#A4262C", mb: 0.5 }}>
                Rejection reason being sent to author:
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#323130" }}>
                {task.Comments}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSendBack}
            variant="contained"
            disableElevation
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <ReplayIcon />
              )
            }
            sx={{
              backgroundColor: "#0F6CBD",
              "&:hover": { backgroundColor: "#0A3A63" },
            }}
          >
            {submitting ? "Processing..." : "Confirm — Send Back"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cancel DCR Modal ── */}
      <Dialog open={openModal === "cancel"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1, color: "#A4262C" }}>
          Cancel Change Request
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              p: 1.5,
              backgroundColor: "#FDE7E9",
              borderRadius: "6px",
              border: "1px solid #F4B8BB",
              mb: 2,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 15, color: "#A4262C", mt: 0.2, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: "#A4262C", lineHeight: 1.5 }}>
              This will permanently cancel the change request. This action cannot
              be undone.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            The change request <strong>{cr?.ChangeRequestNumber}</strong> —{" "}
            <strong>{cr?.DraftDocumentName ?? cr?.Title}</strong> will be marked
            as rejected and no further action will be taken.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Go Back
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            color="error"
            disableElevation
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <BlockIcon />
              )
            }
          >
            {submitting ? "Cancelling..." : "Cancel Change Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PublishingRejectionReviewTask;