// src/webparts/taskHub/components/TaskCard.tsx
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Task } from "../../../shared/types/Task";
import { BRANDING } from "../../../shared/theme/theme";

// ─── Task Type Config ─────────────────────────────────────────────────────────

const TASK_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  // Review tasks
  "Change Authority Review": {
    label: "Review",
    color: BRANDING.primary,
    bgColor: "#E6F1FB",
  },
  "CA Review": {
    label: "Review",
    color: BRANDING.primary,
    bgColor: "#E6F1FB",
  },
  "Compliance Authority Review": {
    label: "Review",
    color: BRANDING.primary,
    bgColor: "#E6F1FB",
  },
  "Document Review": {
    label: "Review",
    color: BRANDING.primary,
    bgColor: "#E6F1FB",
  },
  "Document Controller Review": {
    label: "Review",
    color: BRANDING.primary,
    bgColor: "#E6F1FB",
  },
  "Author Review": {
    label: "Review",
    color: BRANDING.primary,
    bgColor: "#E6F1FB",
  },
  "Publishing Review": {
    label: "Review",
    color: BRANDING.primary,
    bgColor: "#E6F1FB",
  },

  // Approval tasks
  "Change Authority Approval": {
    label: "Approval",
    color: "#0D7D5F",
    bgColor: "#E6F7F2",
  },
  "Final Approval": {
    label: "Approval",
    color: "#0D7D5F",
    bgColor: "#E6F7F2",
  },

  // Document editing tasks (Author or CA)
  "Document Change Process": {
    label: "Edit",
    color: "#7C3AED",
    bgColor: "#F3E8FF",
  },

  // Participant tasks
  "Participant Task": {
    label: "Contribute",
    color: "#B5850A",
    bgColor: "#FEF3E2",
  },

  // Action tasks
  "CR Completion": {
    label: "Action",
    color: "#64748B",
    bgColor: "#F1F5F9",
  },
  "CR Info Required": {
    label: "Action",
    color: "#64748B",
    bgColor: "#F1F5F9",
  },
};

const getTaskTypeConfig = (
  taskType: string
): { label: string; color: string; bgColor: string } => {
  return (
    TASK_TYPE_CONFIG[taskType] || {
      label: taskType,
      color: "#64748B",
      bgColor: "#F1F5F9",
    }
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  BRANDING.primary,
  "#0D7D5F",
  "#7C3AED",
  "#B5850A",
  "#9E3A5A",
  "#0891B2",
];

const getAvatarColor = (name: string): string =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Avatar = ({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}): React.ReactElement => {
  const color = getAvatarColor(name);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: `${color}20`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        color: color,
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </Box>
  );
};

// ─── Date Helpers ─────────────────────────────────────────────────────────────

const formatDate = (date?: Date | string): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;

  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
};

const formatDueDate = (
  date?: Date | string
): { text: string; isUrgent: boolean } => {
  if (!date) return { text: "—", isUrgent: false };

  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(d);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return { text: "Overdue", isUrgent: true };
  if (diffDays === 0) return { text: "Today", isUrgent: true };
  if (diffDays === 1) return { text: "Tomorrow", isUrgent: true };

  return {
    text: d.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
    isUrgent: false,
  };
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  selected: boolean;
  onSelect: (task: Task) => void;
}

const TaskCard = ({
  task,
  selected,
  onSelect,
}: TaskCardProps): React.ReactElement => {
  const config = getTaskTypeConfig(task.TaskType);
  const dueInfo = formatDueDate(task.DueDate);
  const crNumber = task.ChangeRequest?.ChangeRequestNumber || "—";
  const requesterName =
    task.Requestor?.Title ||
    task.ChangeRequest?.Author?.Title ||
    task.AssignedTo?.Title ||
    "";

  const isOverdue = dueInfo.isUrgent && dueInfo.text === "Overdue";

  return (
    <Box
      onClick={() => onSelect(task)}
      sx={{
        display: "grid",
        gridTemplateColumns: "4px 70px 75px 1fr 100px 70px 70px",
        padding: "10px 20px",
        borderBottom: "1px solid #F1F5F9",
        alignItems: "center",
        cursor: "pointer",
        backgroundColor: isOverdue
          ? "#FFFBFB"
          : selected
          ? "#F8FAFC"
          : "white",
        transition: "background-color 0.1s",
        "&:hover": {
          backgroundColor: isOverdue ? "#FFF5F5" : "#F8FAFC",
        },
      }}
    >
      {/* Color bar */}
      <Box
        sx={{
          width: "4px",
          height: "28px",
          backgroundColor: config.color,
          borderRadius: "2px",
        }}
      />

      {/* Type badge */}
      <Typography
        component="span"
        sx={{
          fontSize: "10px",
          padding: "2px 6px",
          backgroundColor: config.bgColor,
          color: config.color,
          borderRadius: "3px",
          fontWeight: 500,
          width: "fit-content",
        }}
      >
        {config.label}
      </Typography>

      {/* CR Number */}
      <Typography
        sx={{
          fontSize: "12px",
          color: BRANDING.primary,
          fontWeight: 500,
        }}
      >
        {crNumber}
      </Typography>

      {/* Task title */}
      <Typography
        sx={{
          fontSize: "13px",
          color: "#1E293B",
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          paddingRight: "12px",
        }}
      >
        {task.Title}
      </Typography>

      {/* Requester */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
        }}
      >
        {requesterName ? (
          <>
            <Avatar name={requesterName} size={20} />
            <Typography
              sx={{
                fontSize: "11px",
                color: "#64748B",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {requesterName.split(" ")[0]}
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: "11px", color: "#94A3B8" }}>—</Typography>
        )}
      </Box>

      {/* Created date */}
      <Typography sx={{ fontSize: "11px", color: "#64748B" }}>
        {formatDate(task.Created)}
      </Typography>

      {/* Due date */}
      <Typography
        sx={{
          fontSize: "11px",
          color: dueInfo.isUrgent ? "#B91C1C" : "#64748B",
          fontWeight: dueInfo.isUrgent ? 500 : 400,
        }}
      >
        {dueInfo.text}
      </Typography>
    </Box>
  );
};

export default TaskCard;