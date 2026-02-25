import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Task } from "../../../shared/types/Task";

// ─── Config ───────────────────────────────────────────────────────────────────

const TASK_TYPE_COLORS: Record<string, string> = {
  "Change Authority Approval":  "#0078D4",
  "Change Authority Review":    "#5C2D91",
  "Document Review":            "#107C10",
  "Document Controller Review": "#D83B01",
  "CR Completion":              "#835B00",
  "CR Info Required":           "#008575",
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "Pending":    { bg: "#FFF4CE", color: "#835B00" },
  "In Progress":{ bg: "#EFF6FC", color: "#0078D4" },
  "Approved":   { bg: "#DFF6DD", color: "#107C10" },
  "Rejected":   { bg: "#FDE7E9", color: "#A4262C" },
  "Complete":   { bg: "#DFF6DD", color: "#107C10" },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#0078D4", "#107C10", "#5C2D91", "#D83B01", "#008575", "#C239B3"];
const getColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const Avatar = ({ name, size = 20 }: { name: string; size?: number }) => (
  <Box sx={{
    width: size, height: size, borderRadius: "50%",
    backgroundColor: getColor(name),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
  }}>
    {getInitials(name)}
  </Box>
);

// ─── Due Date helper ──────────────────────────────────────────────────────────

const formatDueDate = (date: Date | string | undefined): { label: string; overdue: boolean } => {
  if (!date) return { label: "No due date", overdue: false };
  const d = new Date(date);
  const now = new Date();
  const overdue = d < now;
  const label = d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  return { label, overdue };
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  selected: boolean;
  onSelect: (task: Task) => void;
}

const TaskCard = ({ task, selected, onSelect }: TaskCardProps) => {
  const accentColor = TASK_TYPE_COLORS[task.TaskType] ?? "#605E5C";
  const statusStyle = STATUS_STYLES[task.Status] ?? { bg: "#F3F2F1", color: "#605E5C" };
  const { label: dueDateLabel, overdue } = formatDueDate(task.DueDate);

  return (
    <Box
      onClick={() => onSelect(task)}
      sx={{
        display: "flex",
        alignItems: "stretch",
        cursor: "pointer",
        backgroundColor: selected ? "#EFF6FC" : "#fff",
        borderLeft: "3px solid",
        borderLeftColor: selected ? accentColor : "transparent",
        borderBottom: "1px solid #EDEBE9",
        transition: "all 0.12s ease",
        px: 2, py: 1.5,
        gap: 1.5,
        "&:hover": {
          backgroundColor: selected ? "#EFF6FC" : "#FAFAFA",
          borderLeftColor: accentColor,
        },
      }}
    >
      {/* Content */}
      <Box flex={1} minWidth={0} display="flex" flexDirection="column" gap={0.6}>

        {/* Top row — task type label */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography sx={{
            fontSize: 10, fontWeight: 700,
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}>
            {task.TaskType}
          </Typography>

          {/* Status badge */}
          <Box sx={{
            display: "inline-flex", alignItems: "center",
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            fontSize: 10, fontWeight: 600,
            px: 0.875, py: 0.2,
            borderRadius: "10px",
            flexShrink: 0,
          }}>
            {task.Status}
          </Box>
        </Box>

        {/* Title */}
        <Typography sx={{
          fontSize: 13,
          fontWeight: selected ? 600 : 500,
          color: "#323130",
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {task.Title}
        </Typography>

        {/* Bottom row — requestor + due date */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.25}>

          {/* Requestor avatar */}
          <Box display="flex" alignItems="center" gap={0.75}>
            {task.Requestor?.Title ? (
              <>
                <Avatar name={task.Requestor.Title} size={18} />
                <Typography sx={{ fontSize: 11, color: "#A19F9D" }}>
                  {task.Requestor.Title.split(" ")[0]}
                </Typography>
              </>
            ) : (
              <Typography sx={{ fontSize: 11, color: "#C8C6C4" }}>—</Typography>
            )}
          </Box>

          {/* Due date */}
          <Box display="flex" alignItems="center" gap={0.5}>
            {overdue && (
              <Box sx={{
                width: 5, height: 5, borderRadius: "50%",
                backgroundColor: "#D13438", flexShrink: 0,
              }} />
            )}
            <Typography sx={{
              fontSize: 11,
              color: overdue ? "#D13438" : "#A19F9D",
              fontWeight: overdue ? 600 : 400,
            }}>
              {dueDateLabel}
            </Typography>
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default TaskCard;