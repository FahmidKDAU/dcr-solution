import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Task } from "../../../shared/types/Task";

// Color per task type — easy to extend
const taskTypeColor: Record<string, string> = {
  "CA Approval":       "#1976d2",
  "CA Review":         "#7b1fa2",
  "Document Review":   "#2e7d32",
  "Document Contribution": "#e65100",
};

interface TaskCardProps {
  task: Task;
  selected: boolean;
  onSelect: (task: Task) => void;
}

const TaskCard = ({ task, selected, onSelect }: TaskCardProps) => {
  const accentColor = taskTypeColor[task.TaskType] ?? "#757575";

  return (
    <>
      <Box
        onClick={() => onSelect(task)}
        sx={{
          display: "flex",
          alignItems: "stretch",
          cursor: "pointer",
          backgroundColor: selected ? "#f0f7ff" : "transparent",
          "&:hover": { backgroundColor: selected ? "#f0f7ff" : "#fafafa" },
          transition: "background-color 0.15s ease",
          px: 2,
          py: 1.5,
          gap: 1.5,
        }}
      >
        {/* Left accent bar */}
        <Box
          sx={{
            width: 3,
            borderRadius: 4,
            backgroundColor: accentColor,
            flexShrink: 0,
            my: 0.25,
          }}
        />

        {/* Content */}
        <Box flex={1} minWidth={0}>
          {/* Top row */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.25}>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: accentColor, textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {task.TaskType}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {task.DueDate ? new Date(task.DueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "—"}
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            variant="body2"
            fontWeight={selected ? 600 : 500}
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mb: 0.25,
            }}
          >
            {task.Title}
          </Typography>

          {/* Bottom row */}
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {task.RequestedBy?.Title ?? "—"}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {task.LinkedCR?.CRNumber ?? "—"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
    </>
  );
};

export default TaskCard;