import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Chip from "@mui/material/Chip";
import { Task } from "../../../shared/types/Task";

interface TaskPaneProps {
  task: Task | null;
  onBack?: () => void;
}

const TaskPane = ({ task, onBack }: TaskPaneProps) => {
  if (!task) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%" flexDirection="column" gap={1}>
        <Typography variant="h6" color="text.secondary">No task selected</Typography>
        <Typography variant="body2" color="text.disabled">Select a task from the list to get started</Typography>
      </Box>
    );
  }

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
            color={task.Status === "Pending" ? "warning" : task.Status === "Approved" ? "success" : "default"}
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

        {/* 
          Task-type-specific action form goes here
          e.g. <CAApprovalTask task={task} />
        */}
      </Box>

      {/* Action buttons pinned to bottom */}
      <Box px={3} py={2} borderTop="1px solid #e0e0e0" display="flex" justifyContent="flex-end" gap={2} sx={{ backgroundColor: "#fafafa" }}>
        <Button variant="outlined" color="error">Reject</Button>
        <Button variant="contained" color="success">Approve</Button>
      </Box>

    </Box>
  );
};

export default TaskPane;