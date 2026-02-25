import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Chip from "@mui/material/Chip";
import { Task } from "../../../shared/types/Task";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import CAApprovalTask from "./tasks/ChangeAuthorityApproval";
import CAReviewTask from "./tasks/CAReviewTask";

interface TaskPaneProps {
  task: Task | null;
  cr: IChangeRequest | null;
  onBack?: () => void;
  onTaskComplete?: () => void;
}

const renderTaskAction = (task: Task, cr: IChangeRequest | null, onTaskComplete?: () => void) => {
  switch (task.TaskType) {
    case "Change Authority Approval":
      return <CAApprovalTask task={task} onTaskComplete={onTaskComplete} />;
    case "Change Authority Review":
      return <CAReviewTask task={task} cr={cr} onTaskComplete={onTaskComplete} />;
    default:
      return (
        <Typography variant="body2" color="text.secondary">
          No action required for task type: {task.TaskType}
        </Typography>
      );
  }
};

const TaskPane = ({ task, cr, onBack, onTaskComplete }: TaskPaneProps) => {
  if (!task) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%" flexDirection="column" gap={1}>
        <Typography variant="h6" color="text.secondary">No task selected</Typography>
        <Typography variant="body2" color="text.disabled">Select a task from the list to get started</Typography>
      </Box>
    );
  }

  // These task types handle their own buttons
  const taskHandlesOwnButtons = [
    "Change Authority Approval",
    "Change Authority Review",
  ].includes(task.TaskType);

  return (
    <Box display="flex" flexDirection="column" height="100%">

      {/* Back button */}
      <Box px={2} pt={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          size="small"
          onClick={onBack}
          sx={{ color: "text.secondary", mb: 1 }}
        >
          Back to tasks
        </Button>
      </Box>

      {/* Header */}
      <Box px={3} pb={2} borderBottom="1px solid #e0e0e0">
        <Box display="flex" gap={1} mb={1}>
          <Chip label={task.TaskType} size="small" color="primary" variant="outlined" />
          <Chip
            label={task.Status}
            size="small"
            color={
              task.Status === "Pending" ? "warning" :
              task.Status === "Approved" ? "success" : "default"
            }
          />
        </Box>
        <Typography variant="h6" fontWeight={700}>{task.Title}</Typography>
        <Typography variant="caption" color="text.secondary">
          Due: {task.DueDate ? new Date(task.DueDate).toLocaleDateString() : "—"}
          {" · "}Assigned to: {task.AssignedTo?.Title ?? "—"}
        </Typography>
      </Box>

      {/* Task details */}
      <Box flex={1} overflow="auto" p={3} display="flex" flexDirection="column" gap={1.5}>
        <Typography variant="body2"><strong>Task ID:</strong> {task.Id}</Typography>
        <Typography variant="body2"><strong>Status:</strong> {task.Status}</Typography>
        <Typography variant="body2"><strong>Due Date:</strong> {task.DueDate ? new Date(task.DueDate).toLocaleDateString() : "—"}</Typography>
        <Typography variant="body2"><strong>Assigned To:</strong> {task.AssignedTo?.Title ?? "—"}</Typography>
        <Typography variant="body2"><strong>Requestor:</strong> {task.Requestor?.Title ?? "—"}</Typography>

        {/* Task type specific action */}
        {renderTaskAction(task, cr, onTaskComplete)}
      </Box>

      {/* Generic action buttons — only show for task types that don't handle their own */}
      {!taskHandlesOwnButtons && (
        <Box
          px={3}
          py={2}
          borderTop="1px solid #e0e0e0"
          display="flex"
          justifyContent="flex-end"
          gap={2}
          sx={{ backgroundColor: "#fafafa" }}
        >
          <Button variant="outlined" color="error">Reject</Button>
          <Button variant="contained" color="success">Approve</Button>
        </Box>
      )}

    </Box>
  );
};

export default TaskPane;