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
import { Task } from "../../../../shared/types/Task";
import { Department } from "../../../../shared/types/Department";
import SharePointService from "../../../../shared/services/SharePointService";

interface CAApprovalTaskProps {
  task: Task;
  onTaskComplete?: () => void;
}

type ModalType = "approve" | "reject" | "reassign" | null;

const CAApprovalTask = ({ task, onTaskComplete }: CAApprovalTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    "",
  );
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments for reassign dropdown
  useEffect(() => {
    SharePointService.getDepartments()
      .then(setDepartments)
      .catch(console.error);
  }, []);

  const handleClose = () => {
    setOpenModal(null);
    setComment("");
    setRejectionReason("");
    setSelectedDepartmentId("");
  };

  const handleApprove = async (): Promise<void> => {
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Approved",
        Comment: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error approving task:", error);
    }
  };

  const handleReject = async (): Promise<void> => {
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Rejected",
        Comment: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error rejecting task:", error);
    }
  };

  const handleReassign = async (): Promise<void> => {
    try {
      const selectedDept = departments.find(
        (d) => d.Id === selectedDepartmentId,
      );
      if (!selectedDept) return;

      await SharePointService.updateTask(task.Id, {
        Status: "Reassigned",
        AssignedToId: selectedDept.ChangeAuthority?.Id, // ← update assigned person
        // ← update department
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error reassigning task:", error);
    }
  };

  // Selected department object
  const selectedDept = departments.find((d) => d.Id === selectedDepartmentId);

  return (
    <>
      {/* Task info */}
      <Box display="flex" flexDirection="column" gap={1} mb={3}>
        <Typography variant="body2">
          <strong>Task ID:</strong> {task.Id}
        </Typography>
        <Typography variant="body2">
          <strong>Status:</strong> {task.Status}
        </Typography>
        <Typography variant="body2">
          <strong>Assigned To:</strong> {task.AssignedTo?.Title ?? "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Requestor:</strong> {task.Requestor?.Title ?? "—"}
        </Typography>
      </Box>

      {/* Action buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          color="warning"
          onClick={() => setOpenModal("reassign")}
        >
          Reassign
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setOpenModal("reject")}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => setOpenModal("approve")}
        >
          Approve
        </Button>
      </Box>

      {/* Approve Modal */}
      <Dialog
        open={openModal === "approve"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are approving: <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Comments (optional)"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any comments..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog
        open={openModal === "reject"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are rejecting: <strong>{task.Title}</strong>
          </Typography>
          <TextField
            label="Rejection Reason *"
            multiline
            rows={4}
            fullWidth
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reassign Modal */}
      <Dialog
        open={openModal === "reassign"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reassign Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Reassign: <strong>{task.Title}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Department *</InputLabel>
            <Select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
              label="Select Department *"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.Id} value={dept.Id}>
                  {dept.Title}{" "}
                  {dept.ChangeAuthority
                    ? `— ${dept.ChangeAuthority.Title}`
                    : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Show who it will be assigned to */}
          {selectedDept?.ChangeAuthority && (
            <Typography
              variant="caption"
              color="text.secondary"
              mt={1}
              display="block"
            >
              Will be assigned to:{" "}
              <strong>{selectedDept.ChangeAuthority.Title}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleReassign}
            variant="contained"
            color="warning"
            disabled={!selectedDepartmentId}
          >
            Confirm Reassign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CAApprovalTask;
