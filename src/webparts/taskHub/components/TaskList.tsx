import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import TaskCard from "./TaskCard";
import { Task } from "../../../shared/types/Task";

interface TaskListProps {
  tasks: Task[];
  selectedTask: Task | null;
  onTaskSelect: (task: Task) => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "Pending",   value: "Pending"   },
  { label: "Approved",  value: "Approved"  },
  { label: "Rejected",  value: "Rejected"  },
  { label: "Complete",  value: "Complete"  },
  { label: "All",       value: "All"       },
];

const TASK_TYPE_COLORS: Record<string, string> = {
  "Change Authority Approval":  "#0078D4",
  "Change Authority Review":    "#5C2D91",
  "Document Review":            "#107C10",
  "Document Controller Review": "#D83B01",
  "CR Completion":              "#835B00",
  "CR Info Required":           "#008575",
};

// ─── Type Filter Pill ─────────────────────────────────────────────────────────

const TypePill = ({
  label, color, active, count, onClick,
}: {
  label: string; color: string; active: boolean; count: number; onClick: () => void;
}) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      display: "inline-flex", alignItems: "center", gap: 0.75,
      px: 1.25, py: 0.4,
      borderRadius: "20px",
      border: "1.5px solid",
      borderColor: active ? color : "transparent",
      backgroundColor: active ? `${color}15` : "#F3F2F1",
      color: active ? color : "#605E5C",
      fontSize: 12, fontWeight: active ? 700 : 500,
      cursor: "pointer", flexShrink: 0,
      transition: "all 0.15s",
      "&:hover": {
        borderColor: color,
        backgroundColor: `${color}10`,
        color: color,
      },
    }}
  >
    {label}
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      backgroundColor: active ? color : "#C8C6C4",
      color: "#fff",
      fontSize: 10, fontWeight: 700,
      minWidth: 16, height: 16, borderRadius: "10px", px: 0.5,
    }}>
      {count}
    </Box>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TaskList = ({ tasks, selectedTask, onTaskSelect }: TaskListProps) => {
  const [activeStatus, setActiveStatus] = useState("Pending");
  const [activeType, setActiveType]     = useState<string | null>(null);
  const [search, setSearch]             = useState("");

  // Get unique task types present in the list
  const taskTypes = Array.from(new Set(tasks.map((t) => t.TaskType)));

  // Filtered tasks
  const filtered = tasks
    .filter((t) => activeStatus === "All" || t.Status === activeStatus)
    .filter((t) => !activeType || t.TaskType === activeType)
    .filter((t) => !search || t.Title.toLowerCase().includes(search.toLowerCase()));

  // Count per status tab (ignoring type filter for accurate counts)
  const countByStatus = (status: string) =>
    status === "All"
      ? tasks.length
      : tasks.filter((t) => t.Status === status).length;

  // Count per type (respecting status filter)
  const countByType = (type: string) =>
    tasks
      .filter((t) => activeStatus === "All" || t.Status === activeStatus)
      .filter((t) => t.TaskType === type).length;

  return (
    <Box display="flex" flexDirection="column" height="100%" sx={{ backgroundColor: "#fff" }}>

      {/* ── Header ── */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#323130", mb: 0.25 }}>
          My Tasks
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#A19F9D" }}>
          {tasks.filter(t => t.Status === "Pending").length} pending
          {" · "}
          {tasks.length} total
        </Typography>
      </Box>

      {/* ── Search ── */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          backgroundColor: "#F3F2F1", borderRadius: "6px",
          px: 1.5, py: 0.75,
          border: "1.5px solid transparent",
          transition: "border-color 0.15s, background 0.15s",
          "&:focus-within": {
            backgroundColor: "#fff",
            borderColor: "#0078D4",
          },
        }}>
          <SearchIcon sx={{ fontSize: 16, color: "#A19F9D", flexShrink: 0 }} />
          <InputBase
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              fontSize: 13,
              "& input": {
                padding: 0,
                color: "#323130",
                "&::placeholder": { color: "#A19F9D", opacity: 1 },
              },
            }}
          />
          {search && (
            <Box
              component="button"
              onClick={() => setSearch("")}
              sx={{
                border: "none", background: "none", cursor: "pointer",
                color: "#A19F9D", fontSize: 16, lineHeight: 1, p: 0,
                display: "flex", alignItems: "center",
                "&:hover": { color: "#323130" },
              }}
            >
              ×
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Status Tabs ── */}
      <Box sx={{
        display: "flex", borderBottom: "1px solid #EDEBE9",
        px: 2.5, gap: 0,
      }}>
        {STATUS_TABS.map((tab) => {
          const count = countByStatus(tab.value);
          const active = activeStatus === tab.value;
          return (
            <Box
              key={tab.value}
              component="button"
              onClick={() => setActiveStatus(tab.value)}
              sx={{
                background: "none", border: "none", cursor: "pointer",
                px: 1.25, py: 1,
                fontSize: 12, fontWeight: active ? 700 : 400,
                color: active ? "#0078D4" : "#605E5C",
                borderBottom: "2px solid",
                borderColor: active ? "#0078D4" : "transparent",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 0.6,
                "&:hover": { color: "#323130" },
                mb: "-1px",
              }}
            >
              {tab.label}
              {count > 0 && (
                <Box component="span" sx={{
                  backgroundColor: active ? "#0078D4" : "#EDEBE9",
                  color: active ? "#fff" : "#605E5C",
                  fontSize: 10, fontWeight: 700,
                  minWidth: 16, height: 16, borderRadius: "10px",
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center", px: 0.5,
                }}>
                  {count}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ── Type Filter Pills ── */}
      {taskTypes.length > 1 && (
        <Box sx={{
          px: 2.5, py: 1.25,
          display: "flex", gap: 0.75, flexWrap: "wrap",
          borderBottom: "1px solid #EDEBE9",
        }}>
          {taskTypes.map((type) => (
            <TypePill
              key={type}
              label={type}
              color={TASK_TYPE_COLORS[type] ?? "#605E5C"}
              active={activeType === type}
              count={countByType(type)}
              onClick={() => setActiveType(activeType === type ? null : type)}
            />
          ))}
        </Box>
      )}

      {/* ── Task Cards ── */}
      <Box overflow="auto" flex={1}>
        {filtered.length === 0 ? (
          <Box sx={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "60%", gap: 1,
          }}>
            <Typography sx={{ fontSize: 32 }}>📋</Typography>
            <Typography sx={{ fontSize: 14, color: "#605E5C", fontWeight: 500 }}>
              No tasks found
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#A19F9D" }}>
              {search ? `No results for "${search}"` : "Nothing here yet"}
            </Typography>
            {(search || activeType) && (
              <Box
                component="button"
                onClick={() => { setSearch(""); setActiveType(null); }}
                sx={{
                  mt: 0.5, border: "none", background: "none",
                  color: "#0078D4", fontSize: 12, cursor: "pointer",
                  fontWeight: 600, p: 0,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Clear filters
              </Box>
            )}
          </Box>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.Id}
              task={task}
              selected={selectedTask?.Id === task.Id}
              onSelect={onTaskSelect}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default TaskList;