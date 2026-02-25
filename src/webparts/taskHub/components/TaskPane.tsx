import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import { Task } from "../../../shared/types/Task";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import CAApprovalTask from "./tasks/ChangeAuthorityApproval";
import CAReviewTask from "./tasks/CAReviewTask";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskPaneProps {
  task: Task | null;
  cr: IChangeRequest | null;
  onBack: () => void;
  onTaskComplete: () => void;
}

// ─── Task Type Badge ──────────────────────────────────────────────────────────

const TASK_TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  "Change Authority Approval": { bg: "#EFF6FC", color: "#0078D4" },
  "Change Authority Review":   { bg: "#F0E6FF", color: "#5C2D91" },
  "Document Review":           { bg: "#DFF6DD", color: "#107C10" },
  "CR Completion":             { bg: "#FFF4CE", color: "#835B00" },
  "Document Controller Review":{ bg: "#FDE7E9", color: "#A4262C" },
};

const TaskTypeBadge = ({ taskType }: { taskType: string }) => {
  const s = TASK_TYPE_STYLES[taskType] ?? { bg: "#F3F2F1", color: "#605E5C" };
  return (
    <Box sx={{
      display: "inline-flex",
      backgroundColor: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      px: 1.25, py: 0.4,
      borderRadius: "4px",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    }}>
      {taskType}
    </Box>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  "Pending":    { bg: "#FFF4CE", color: "#835B00", dot: "#FFB900" },
  "In Progress":{ bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "Approved":   { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  "Rejected":   { bg: "#FDE7E9", color: "#A4262C", dot: "#D13438" },
  "Complete":   { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? { bg: "#F3F2F1", color: "#605E5C", dot: "#A19F9D" };
  return (
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      backgroundColor: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, px: 1, py: 0.3,
      borderRadius: "20px",
    }}>
      <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: s.dot }} />
      {status}
    </Box>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#0078D4", "#107C10", "#5C2D91", "#D83B01", "#008575", "#C239B3"];
const getColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const Avatar = ({ name, size = 28 }: { name: string; size?: number }) => (
  <Box sx={{
    width: size, height: size, borderRadius: "50%",
    backgroundColor: getColor(name),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0,
  }}>
    {getInitials(name)}
  </Box>
);

// ─── Task Switcher ────────────────────────────────────────────────────────────

const renderTaskAction = (
  task: Task,
  cr: IChangeRequest | null,
  onTaskComplete: () => void,
) => {
  switch (task.TaskType) {
    case "Change Authority Approval":
      return <CAApprovalTask task={task} cr={cr} onTaskComplete={onTaskComplete} />;
    case "Change Authority Review":
      return <CAReviewTask task={task} cr={cr} onTaskComplete={onTaskComplete} />;
    default:
      return (
        <Box sx={{
          border: "1px dashed #D2D0CE", borderRadius: 1,
          p: 2, textAlign: "center",
        }}>
          <Typography variant="body2" color="text.secondary">
            No actions required for this task type.
          </Typography>
        </Box>
      );
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TaskPane = ({ task, cr, onBack, onTaskComplete }: TaskPaneProps) => {

  // Empty state — shouldn't show in current TaskHub flow but keep as safety net
  if (!task) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center"
        height="100%" flexDirection="column" gap={1}>
        <Typography variant="h6" color="text.secondary">No task selected</Typography>
        <Typography variant="body2" color="text.disabled">
          Select a task from the list to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" sx={{ backgroundColor: "#fff" }}>

      {/* ── Back Button ── */}
      <Box px={2} pt={1.5} pb={0.5}>
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          size="small"
          onClick={onBack}
          sx={{
            color: "#605E5C", fontSize: 12, fontWeight: 500,
            textTransform: "none", px: 1,
            "&:hover": { backgroundColor: "#F3F2F1", color: "#323130" },
          }}
        >
          All tasks
        </Button>
      </Box>

      {/* ── Task Header ── */}
      <Box sx={{ px: 3, pt: 1, pb: 2, borderBottom: "1px solid #EDEBE9" }}>

        {/* Task type + status row */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.25}>
          <TaskTypeBadge taskType={task.TaskType} />
          <StatusBadge status={task.Status} />
        </Box>

        {/* Task title */}
        <Typography sx={{
          fontSize: 15, fontWeight: 700, color: "#323130",
          lineHeight: 1.4, mb: 1,
        }}>
          {task.Title}
        </Typography>

        {/* Due date */}
        <Typography sx={{ fontSize: 12, color: "#A19F9D" }}>
          Due:{" "}
          <Box component="span" sx={{ color: "#605E5C", fontWeight: 500 }}>
            {task.DueDate
              ? new Date(task.DueDate).toLocaleDateString("en-AU", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : "No due date"}
          </Box>
        </Typography>
      </Box>

      {/* ── Task Actions (scrollable) ── */}
      <Box flex={1} overflow="auto" sx={{ px: 3, py: 2.5 }}>

        {/* CR loading state */}
        {!cr ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          renderTaskAction(task, cr, onTaskComplete)
        )}

      </Box>

      {/* ── Requestor Footer ── */}
      <Box sx={{
        px: 3, py: 2,
        borderTop: "1px solid #EDEBE9",
        display: "flex", alignItems: "center", gap: 1.5,
      }}>
        {task.Requestor?.Title && (
          <>
            <Avatar name={task.Requestor.Title} size={26} />
            <Box>
              <Typography sx={{ fontSize: 11, color: "#A19F9D", lineHeight: 1.2 }}>
                Requested by
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#323130", lineHeight: 1.3 }}>
                {task.Requestor.Title}
              </Typography>
            </Box>
          </>
        )}
      </Box>

    </Box>
  );
};

export default TaskPane;