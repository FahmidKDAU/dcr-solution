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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import SharePointService from "../../../../shared/services/SharePointService";
import { REVIEW_PERIOD_OPTIONS } from "../../../../shared/constants";

// ─── Required fields for this task type ──────────────────────────────────────

const REQUIRED_FIELDS: { field: keyof IChangeRequest; label: string }[] = [
  { field: "ReleaseAuthority", label: "Release Authority" },
  { field: "Author0", label: "Document Author" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CAReviewTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

type ModalType = "complete" | "minor_change" | "obsolete" | null;

// ─── Main Component ───────────────────────────────────────────────────────────

const CAReviewTask = ({ task, cr, onTaskComplete }: CAReviewTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewPeriod, setReviewPeriod] = useState<number | "">(
    cr?.ReviewPeriod ?? ""
  );
  const [downloadFormat, setDownloadFormat] = useState<"PDF" | "Original" | "">(
    cr?.DownloadFormat ?? ""
  );

  // ── Required field validation ──
  const missingFields = cr
    ? REQUIRED_FIELDS.filter(({ field }) => !cr[field])
    : REQUIRED_FIELDS;

  const canComplete = missingFields.length === 0 && reviewPeriod !== "" && downloadFormat !== "";

  // Minor change & obsolete only available for existing documents
  const isNewDocument = cr?.NewDocument ?? false;

  const handleClose = () => {
    setOpenModal(null);
    setComment("");
  };

  const handleComplete = async (): Promise<void> => {
    setSubmitting(true);
    try {
      // Save ReviewPeriod and DownloadFormat to CR first
      await SharePointService.updateChangeRequest(cr!.ID, {
        ReviewPeriod: reviewPeriod,
        DownloadFormat: downloadFormat,
      });

      await SharePointService.updateTask(task.Id, {
        Status: "Approved",
        Comments: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error completing review task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMinorChange = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Marked as Minor Change",
        Comments: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error marking as minor change:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleObsolete = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Marked for Document Obsoletion",
        Comments: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error marking for obsoletion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* ── Missing fields warning ── */}
        {(missingFields.length > 0 || reviewPeriod === "" || downloadFormat === "") && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              backgroundColor: "#FFF4CE",
              border: "1px solid #FFB900",
              borderRadius: "6px",
              px: 1.5,
              py: 1.25,
            }}
          >
            <WarningAmberIcon
              sx={{ fontSize: 16, color: "#835B00", mt: 0.2, flexShrink: 0 }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#603D00",
                  lineHeight: 1.4,
                }}
              >
                Complete required fields to finish review
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#835B00",
                  lineHeight: 1.5,
                  mt: 0.25,
                }}
              >
                {[
                  ...missingFields.map((f) => f.label),
                  ...(reviewPeriod === "" ? ["Review Period"] : []),
                  ...(downloadFormat === "" ? ["Download Format"] : []),
                ].join(", ")}
              </Typography>
            </Box>
          </Box>
        )}

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
            Review the change request details on the right and ensure all
            required fields are filled before marking as complete.
          </Typography>
        </Box>

        {/* ── Review Period ── */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 13 }}>Review Period *</InputLabel>
          <Select
            value={reviewPeriod}
            label="Review Period *"
            onChange={(e) => setReviewPeriod(e.target.value as number)}
            sx={{ fontSize: 13 }}
          >
            {REVIEW_PERIOD_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ── Download Format ── */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 13 }}>Download Format *</InputLabel>
          <Select
            value={downloadFormat}
            label="Download Format *"
            onChange={(e) => setDownloadFormat(e.target.value as "PDF" | "Original")}
            sx={{ fontSize: 13 }}
          >
            <MenuItem value="PDF" sx={{ fontSize: 13 }}>PDF</MenuItem>
            <MenuItem value="Original" sx={{ fontSize: 13 }}>Original (Word)</MenuItem>
          </Select>
        </FormControl>

        {/* ── Primary Action ── */}
        <Box
          component="button"
          onClick={() => setOpenModal("complete")}
          disabled={!canComplete}
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
            backgroundColor: !canComplete ? "#F3F2F1" : "#107C10",
            color: !canComplete ? "#A19F9D" : "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: !canComplete ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            "&:hover:not(:disabled)": { backgroundColor: "#0B6A0B" },
          }}
        >
          <CheckIcon sx={{ fontSize: 16 }} />
          Mark Review as Complete
        </Box>

        {/* ── Alternative Actions (existing documents only) ── */}
        {!isNewDocument && (
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

            <Box
              component="button"
              onClick={() => setOpenModal("minor_change")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                py: 1,
                px: 1.5,
                borderRadius: "6px",
                border: "1px solid #E1DFDD",
                backgroundColor: "#fff",
                color: "#323130",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": {
                  backgroundColor: "#F9F9F9",
                  borderColor: "#C8C6C4",
                },
              }}
            >
              <EditNoteIcon sx={{ fontSize: 16, color: "#835B00" }} />
              Add to Minor Change Register
            </Box>

            <Box
              component="button"
              onClick={() => setOpenModal("obsolete")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                py: 1,
                px: 1.5,
                borderRadius: "6px",
                border: "1px solid #E1DFDD",
                backgroundColor: "#fff",
                color: "#323130",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": {
                  backgroundColor: "#FDF6F6",
                  borderColor: "#C8C6C4",
                },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16, color: "#A4262C" }} />
              Mark for Obsoletion
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Complete Modal ── */}
      <Dialog
        open={openModal === "complete"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Complete Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1}>
            You are marking this review as complete:{" "}
            <strong>{task.Title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Review period set to{" "}
            <strong>
              {REVIEW_PERIOD_OPTIONS.find((o) => o.value === reviewPeriod)?.label}
            </strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Download format set to <strong>{downloadFormat === "Original" ? "Original (Word)" : "PDF"}</strong>
          </Typography>
          <TextField
            label="Comments (optional)"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any review notes or comments..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CheckIcon />
              )
            }
            sx={{
              backgroundColor: "#107C10",
              "&:hover": { backgroundColor: "#0B6A0B" },
            }}
          >
            {submitting ? "Completing..." : "Confirm Complete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Minor Change Modal ── */}
      <Dialog
        open={openModal === "minor_change"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Add to Minor Change Register
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This change request will be added to the minor change register and
            implemented during the next scheduled review of the document.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Notes (optional)"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any notes about why this is being classified as a minor change..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMinorChange}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <EditNoteIcon />
              )
            }
            sx={{
              backgroundColor: "#0078D4",
              "&:hover": { backgroundColor: "#006CBE" },
            }}
          >
            {submitting ? "Adding..." : "Confirm Minor Change"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Obsolete Modal ── */}
      <Dialog
        open={openModal === "obsolete"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Mark Document for Obsoletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This will start the document obsoletion process. The document will
            be unpublished and archived after approval.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Reason for Obsoletion"
            multiline
            rows={4}
            fullWidth
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Why should this document be obsoleted?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleObsolete}
            variant="contained"
            color="error"
            disabled={!comment.trim() || submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <DeleteOutlineIcon />
              )
            }
          >
            {submitting ? "Processing..." : "Confirm Obsoletion"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CAReviewTask;