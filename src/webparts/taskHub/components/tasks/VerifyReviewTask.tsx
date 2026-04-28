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
import PublishIcon from "@mui/icons-material/Publish";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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

  useEffect(() => {
    if (!cr?.DraftFolderUrl) return;
    SharePointService.getDraftFolderFiles(cr.DraftFolderUrl)
      .then(setDraftFiles)
      .catch(console.error);
  }, [cr?.DraftFolderUrl]);

  // ── Role detection ────────────────────────────────────────────────────────

  // FIX: corrected from "Release Authority Approval" → "Publishing Review"
  const isPublishingReview = task.TaskType === "Publishing Review";
  const isDocumentController = task.TaskType === "Document Controller Review";
  const isCoaTask = task.TaskType === "Compliance Authority Review";

  // When CA = RA, Power Automate skips creating a separate Publishing Review
  // task. The COA task absorbs the RA publish action instead.
  const caIsRa =
    !!cr?.ChangeAuthority?.Id &&
    !!cr?.ReleaseAuthority?.Id &&
    cr.ChangeAuthority.Id === cr.ReleaseAuthority.Id;

  const coaActsAsRa = isCoaTask && caIsRa;

  // Whether this action results in a publish signal
  const willPublish = isPublishingReview || coaActsAsRa;

  // ── Derived labels ────────────────────────────────────────────────────────

  const roleLabel = isPublishingReview
    ? "Release Authority"
    : isDocumentController
    ? "Document Controller"
    : "Compliance Authority";

  const infoText = isPublishingReview
    ? "the document meets all requirements and is ready for publishing"
    : isDocumentController
    ? "document control requirements are met"
    : "compliance requirements are met";

  const verifyButtonLabel = willPublish ? "Approve for Publishing" : "Confirm Verification";
  const verifyModalTitle  = willPublish ? "Approve for Publishing" : `Confirm ${roleLabel} Verification`;
  const verifyModalBody   = willPublish
    ? "You are approving this document for publishing. Once confirmed, the document will be published to the Document Portal."
    : `You are confirming this ${roleLabel.toLowerCase()} verification:`;
  const verifyButtonIcon  = willPublish
    ? <PublishIcon sx={{ fontSize: 16 }} />
    : <CheckIcon sx={{ fontSize: 16 }} />;
  const submittingLabel   = willPublish ? "Approving..." : "Verifying...";
  const confirmLabel      = willPublish ? "Approve for Publishing" : "Confirm Verification";

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClose = (): void => {
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

      // Both the RA approving their own task AND the COA approving when CA = RA
      // set the CR to "Ready for Publishing" — the single trigger for the publish flow
      if (willPublish && cr) {
        await SharePointService.updateChangeRequest(cr.ID, {
          Status: "Ready for Publishing",
        });
      }

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>

        {/* ── Info box ── */}
        <Box
          sx={{
            backgroundColor: willPublish ? "#F0FDF4" : "#F9F9F9",
            borderRadius: "6px",
            border: `1px solid ${willPublish ? "#BBF7D0" : "#EDEBE9"}`,
            px: 1.5, py: 1.25,
            display: "flex", gap: 1, alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#605E5C", lineHeight: 1.5 }}>
            {isPublishingReview
              ? "As Release Authority, review the final draft document and confirm it is ready to be published to the Document Portal."
              : `Review the draft document and change request details. Verify that all ${infoText} before approving.`}
          </Typography>
        </Box>

        {/* ── CA = RA notice — only on COA task when applicable ── */}
        {coaActsAsRa && (
          <Box
            sx={{
              backgroundColor: "#EFF6FC",
              border: "1px solid #C7E0F4",
              borderRadius: "6px",
              px: 1.5, py: 1.25,
              display: "flex", gap: 1, alignItems: "flex-start",
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 15, color: "#0078D4", mt: 0.2, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: "#0078D4", lineHeight: 1.5 }}>
              <strong>{cr?.ChangeAuthority?.Title}</strong> is both the Change
              Authority and Release Authority for this CR. Approving will send the
              document directly to publishing — no separate RA review is required.
            </Typography>
          </Box>
        )}

        {/* ── Draft document link ── */}
        {draftFiles.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: 11, fontWeight: 600, color: "#A19F9D",
                textTransform: "uppercase", letterSpacing: 0.5,
                mb: 0.75, px: 0.25,
              }}
            >
              {willPublish ? "Document for Publishing" : "Draft Document"}
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
            {willPublish ? "Open Document for Review" : "View Draft Document"}
            <OpenInNewIcon sx={{ fontSize: 14, color: "#A19F9D", ml: "auto" }} />
          </Box>
        )}

        {/* ── Actions ── */}
        <ActionButton
          label={verifyButtonLabel}
          icon={verifyButtonIcon}
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

      {/* ── Verify / Approve Modal ── */}
      <Dialog open={openModal === "verify"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          {verifyModalTitle}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {verifyModalBody}{" "}
            {!willPublish && <strong>{task.Title}</strong>}
          </Typography>
          {willPublish && (
            <Box
              sx={{
                mb: 2, p: 1.5,
                backgroundColor: "#F0FDF4",
                borderRadius: "6px",
                border: "1px solid #BBF7D0",
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#16A34A", mb: 0.25 }}>
                Document
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#323130" }}>
                {cr?.DraftDocumentName ?? task.Title}
              </Typography>
            </Box>
          )}
          <TextField
            label="Comments (optional)"
            multiline rows={4} fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={willPublish ? "Add any publishing notes..." : "Add any comments..."}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            variant="contained"
            disableElevation
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : verifyButtonIcon}
            sx={{ backgroundColor: "#107C10", "&:hover": { backgroundColor: "#0B6A0B" } }}
          >
            {submitting ? submittingLabel : confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject Modal ── */}
      <Dialog open={openModal === "reject"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          {willPublish ? "Reject for Publishing" : `Reject — ${roleLabel} Review`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {willPublish
              ? "The document will be sent back for revision. Please provide a clear rejection reason for the Change Authority."
              : `You are rejecting: `}
            {!willPublish && <strong>{task.Title}</strong>}
          </Typography>
          <TextField
            label="Rejection Reason *"
            multiline rows={4} fullWidth required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={
              willPublish
                ? "Explain why the document is not ready for publishing..."
                : "Explain what doesn't meet requirements..."
            }
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
            disableElevation
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