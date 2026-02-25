import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import { Department } from "../../../../shared/types/Department";
import SharePointService from "../../../../shared/services/SharePointService";

// ─── Required fields for this task type ──────────────────────────────────────

const REQUIRED_FIELDS: { field: keyof IChangeRequest; label: string }[] = [
  { field: "ReleaseAuthority", label: "Release Authority" },
  { field: "Author0",           label: "Author" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CAApprovalTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

type ModalType = "approve" | "reject" | "reassign" | null;

// ─── Action Button ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: "approve" | "reject" | "reassign";
  disabled?: boolean;
}

const ACTION_STYLES = {
  approve:  { bg: "#107C10", hover: "#0B6A0B", color: "#fff", border: "none" },
  reject:   { bg: "#fff",    hover: "#FDE7E9", color: "#A4262C", border: "1px solid #D13438" },
  reassign: { bg: "#fff",    hover: "#F3F2F1", color: "#605E5C", border: "1px solid #C8C6C4" },
};

const ActionButton = ({ label, icon, onClick, variant, disabled = false }: ActionButtonProps) => {
  const s = ACTION_STYLES[variant];
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
        width: "100%", py: 1, px: 2, borderRadius: "4px",
        border: s.border, backgroundColor: disabled ? "#F3F2F1" : s.bg,
        color: disabled ? "#A19F9D" : s.color,
        fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
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

const CAApprovalTask = ({ task, cr, onTaskComplete }: CAApprovalTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    SharePointService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  // ── Required field validation ──
  const missingFields = cr
    ? REQUIRED_FIELDS.filter(({ field }) => !cr[field])
    : REQUIRED_FIELDS;
  const canApprove = missingFields.length === 0;

  const handleClose = () => {
    setOpenModal(null);
    setComment("");
    setRejectionReason("");
    setSelectedDepartmentId("");
  };

  const handleApprove = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Approved",
        Comment: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error approving task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Rejected",
        RejectionReason: rejectionReason,
        Comment: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error rejecting task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const selectedDept = departments.find((d) => d.Id === selectedDepartmentId);
      if (!selectedDept) return;
      await SharePointService.updateTask(task.Id, {
        Status: "Reassigned",
        AssignedToId: selectedDept.ChangeAuthority?.Id,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error reassigning task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDept = departments.find((d) => d.Id === selectedDepartmentId);

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
                Complete required fields to approve
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#835B00", lineHeight: 1.5, mt: 0.25 }}>
                Fill in the following on the right:{" "}
                <strong>{missingFields.map((f) => f.label).join(", ")}</strong>
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Approve ── */}
        <ActionButton
          label="Approve"
          icon={<CheckIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("approve")}
          variant="approve"
          disabled={!canApprove}
        />

        {/* ── Reject ── */}
        <ActionButton
          label="Reject"
          icon={<CloseIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("reject")}
          variant="reject"
        />

        {/* ── Reassign ── */}
        <ActionButton
          label="Reassign to Another Department"
          icon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpenModal("reassign")}
          variant="reassign"
        />

      </Box>

      {/* ── Approve Modal ── */}
      <Dialog open={openModal === "approve"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Confirm Approval
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are approving: <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Comments (optional)"
            multiline rows={4} fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any comments for the requestor..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
            sx={{ backgroundColor: "#107C10", "&:hover": { backgroundColor: "#0B6A0B" } }}
          >
            {submitting ? "Approving..." : "Confirm Approval"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject Modal ── */}
      <Dialog open={openModal === "reject"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Confirm Rejection
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
            placeholder="Please provide a reason — this will be sent to the requestor..."
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

      {/* ── Reassign Modal ── */}
      <Dialog open={openModal === "reassign"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Reassign to Another Department
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            The task will be reassigned to the Change Authority of the selected department.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Department *</InputLabel>
            <Select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
              label="Department *"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.Id} value={dept.Id}>
                  {dept.Title}
                  {dept.ChangeAuthority ? ` — ${dept.ChangeAuthority.Title}` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedDept?.ChangeAuthority && (
            <Box sx={{
              mt: 1.5, px: 1.5, py: 1,
              backgroundColor: "#EFF6FC", borderRadius: "4px",
            }}>
              <Typography sx={{ fontSize: 12, color: "#0078D4" }}>
                Will be assigned to:{" "}
                <strong>{selectedDept.ChangeAuthority.Title}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReassign}
            variant="contained"
            disabled={!selectedDepartmentId || submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SwapHorizIcon />}
          >
            {submitting ? "Reassigning..." : "Confirm Reassign"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CAApprovalTask;