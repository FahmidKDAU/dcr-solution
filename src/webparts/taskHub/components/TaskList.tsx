// src/webparts/taskHub/components/TaskList.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import StarIcon from "@mui/icons-material/Star";
import { Task } from "../../../shared/types/Task";
import { BRANDING } from "../../../shared/theme/theme";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  selectedTask: Task | null;
  onTaskSelect: (task: Task) => void;
  onTasksChange?: (tasks: Task[]) => void;
  loading?: boolean;
}

// ─── Task Type Config (for filter buttons) ────────────────────────────────────

const TASK_TYPE_CONFIG: Record<string, { label: string }> = {
  // Review tasks
  "Change Authority Review": { label: "Review" },
  "CA Review": { label: "Review" },
  "Compliance Authority Review": { label: "Review" },
  "Document Review": { label: "Review" },
  "Document Controller Review": { label: "Review" },
  "Author Review": { label: "Review" },
  "Publishing Review": { label: "Review" },
  
  // Approval tasks
  "Change Authority Approval": { label: "Approval" },
  "Final Approval": { label: "Approval" },
  
  // Document editing tasks
  "Document Change Process": { label: "Edit" },
  
  // Participant tasks
  "Participant Task": { label: "Contribute" },
  
  // Action tasks
  "CR Completion": { label: "Action" },
  "CR Info Required": { label: "Action" },
};

const getTaskLabel = (taskType: string): string => {
  return TASK_TYPE_CONFIG[taskType]?.label || taskType;
};

// Get unique simplified categories for filter buttons
const getFilterCategories = (
  tasks: Task[]
): { label: string; count: number }[] => {
  const categoryMap = new Map<string, number>();

  tasks.forEach((task) => {
    const label = getTaskLabel(task.TaskType);
    categoryMap.set(label, (categoryMap.get(label) || 0) + 1);
  });

  return Array.from(categoryMap.entries()).map(([label, count]) => ({
    label,
    count,
  }));
};

// ─── Sort Types ───────────────────────────────────────────────────────────────

type SortField = "Created" | "DueDate";
type SortDirection = "asc" | "desc";

// ─── Grid columns ─────────────────────────────────────────────────────────────

const GRID_COLUMNS = "24px 4px 70px 75px 1fr 100px 70px 70px";

// ─── Main Component ───────────────────────────────────────────────────────────

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTask,
  onTaskSelect,
  onTasksChange,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("Created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter to pending tasks only
  const pendingTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.Status === "Pending" || task.Status === "In Progress"
    );
  }, [tasks]);

  // Apply search and category filter
  const filteredTasks = useMemo(() => {
    return pendingTasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.ChangeRequest?.ChangeRequestNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const label = getTaskLabel(task.TaskType);
      const matchesFilter = !activeFilter || label === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [pendingTasks, searchQuery, activeFilter]);

  // Separate pinned and unpinned, then sort
  const { pinnedTasks, unpinnedTasks } = useMemo(() => {
    const pinned = filteredTasks.filter((t) => t.isPinned);
    const unpinned = filteredTasks.filter((t) => !t.isPinned);

    const sortFn = (a: Task, b: Task): number => {
      let aValue: Date | null = null;
      let bValue: Date | null = null;

      if (sortField === "Created") {
        aValue = a.Created ? new Date(a.Created) : null;
        bValue = b.Created ? new Date(b.Created) : null;
      } else if (sortField === "DueDate") {
        aValue = a.DueDate ? new Date(a.DueDate) : null;
        bValue = b.DueDate ? new Date(b.DueDate) : null;
      }

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const diff = aValue.getTime() - bValue.getTime();
      return sortDirection === "asc" ? diff : -diff;
    };

    return {
      pinnedTasks: [...pinned].sort(sortFn),
      unpinnedTasks: [...unpinned].sort(sortFn),
    };
  }, [filteredTasks, sortField, sortDirection]);

  const filterCategories = useMemo(
    () => getFilterCategories(pendingTasks),
    [pendingTasks]
  );

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleTogglePin = (taskId: number, newPinned: boolean): void => {
    const updatedTasks = tasks.map((t) =>
      t.Id === taskId ? { ...t, isPinned: newPinned } : t
    );
    onTasksChange?.(updatedTasks);
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    const isActive = sortField === field;
    const Icon = sortDirection === "asc" ? ArrowDropUpIcon : ArrowDropDownIcon;

    return (
      <Icon
        sx={{
          fontSize: 16,
          color: isActive ? BRANDING.primary : "#CBD5E1",
          ml: 0.25,
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: BRANDING.primary,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              color: "white",
            }}
          >
            My Tasks
          </Typography>
          <Typography
            sx={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.7)",
              marginTop: "2px",
            }}
          >
            {filteredTasks.length} pending
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: 160,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "4px",
              fontSize: "12px",
              height: 32,
              "& fieldset": { border: "none" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filter Bar */}
      <Box
        sx={{
          padding: "10px 20px",
          backgroundColor: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* All tasks button */}
        <Button
          onClick={() => setActiveFilter(null)}
          sx={{
            padding: "4px 10px",
            fontSize: "11px",
            backgroundColor: activeFilter === null ? BRANDING.primary : "white",
            color: activeFilter === null ? "white" : "#64748B",
            border: activeFilter === null ? "none" : "1px solid #E2E8F0",
            borderRadius: "4px",
            textTransform: "none",
            minWidth: "auto",
            lineHeight: 1.4,
            "&:hover": {
              backgroundColor:
                activeFilter === null ? BRANDING.primaryDark : "#F8FAFC",
            },
          }}
        >
          All {pendingTasks.length}
        </Button>

        {/* Category filter buttons */}
        {filterCategories.map((category) => (
          <Button
            key={category.label}
            onClick={() =>
              setActiveFilter(
                activeFilter === category.label ? null : category.label
              )
            }
            sx={{
              padding: "4px 10px",
              fontSize: "11px",
              backgroundColor:
                activeFilter === category.label ? BRANDING.primary : "white",
              color: activeFilter === category.label ? "white" : "#64748B",
              border:
                activeFilter === category.label
                  ? "none"
                  : "1px solid #E2E8F0",
              borderRadius: "4px",
              textTransform: "none",
              minWidth: "auto",
              lineHeight: 1.4,
              "&:hover": {
                backgroundColor:
                  activeFilter === category.label
                    ? BRANDING.primaryDark
                    : "#F8FAFC",
              },
            }}
          >
            {category.label} {category.count}
          </Button>
        ))}
      </Box>

      {/* Task List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading && filteredTasks.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress size={24} sx={{ color: BRANDING.primary }} />
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
          >
            <Typography sx={{ fontSize: "14px", color: "#64748B", mb: 0.5 }}>
              No pending tasks
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#94A3B8" }}>
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedTasks.length > 0 && (
              <>
                <Box
                  sx={{
                    padding: "8px 20px",
                    backgroundColor: "#FFFBEB",
                    borderBottom: "1px solid #FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <StarIcon sx={{ fontSize: 14, color: "#B5850A" }} />
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#92650A",
                      fontWeight: 500,
                    }}
                  >
                    Pinned
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#B5850A" }}>
                    {pinnedTasks.length} task{pinnedTasks.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>

                {pinnedTasks.map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    selected={selectedTask?.Id === task.Id}
                    onSelect={onTaskSelect}
                    onTogglePin={handleTogglePin}
                    isPinnedSection
                  />
                ))}
              </>
            )}

            {/* Column Headers */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: GRID_COLUMNS,
                backgroundColor: "#FAFBFC",
                padding: "8px 20px",
                borderBottom: "1px solid #E2E8F0",
                fontSize: "10px",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 500,
              }}
            >
              <span></span>
              <span></span>
              <span>Type</span>
              <span>CR #</span>
              <span>Task</span>
              <span>Requester</span>
              <Box
                onClick={() => handleSort("Created")}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: sortField === "Created" ? BRANDING.primary : "#64748B",
                  userSelect: "none",
                }}
              >
                Created
                <SortIcon field="Created" />
              </Box>
              <Box
                onClick={() => handleSort("DueDate")}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: sortField === "DueDate" ? BRANDING.primary : "#64748B",
                  userSelect: "none",
                }}
              >
                Due
                <SortIcon field="DueDate" />
              </Box>
            </Box>

            {/* Unpinned Tasks */}
            {unpinnedTasks.map((task) => (
              <TaskCard
                key={task.Id}
                task={task}
                selected={selectedTask?.Id === task.Id}
                onSelect={onTaskSelect}
                onTogglePin={handleTogglePin}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default TaskList;