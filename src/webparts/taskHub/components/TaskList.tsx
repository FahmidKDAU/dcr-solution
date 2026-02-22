import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TaskCard from "./TaskCard";
import { Task } from "../../../shared/types/Task";
import Divider from "@mui/material/Divider";

interface TaskListProps {
  tasks: Task[];
  selectedTask: Task | null;
  onTaskSelect: (task: Task) => void;
}

const taskTypes = [
  "All",
  "CA Review",
  "Document Review",
  "Final Approval",
  "CR Completion",
  "CR Info Required",
  "Change Authority Approval",
  "Change Authority Review",
  "Document Controller Review",
];

const TaskList = ({ tasks, selectedTask, onTaskSelect }: TaskListProps) => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("All");

  const filtered = tasks
    .filter((t) => {
      if (tab === 0) return t.Status === "Pending";
      if (tab === 1) return t.Status === "Approved";
      if (tab === 2) return t.Status === "Rejected";
      if (tab === 3) return t.Status === "Complete";
      return true;
    })
    .filter((t) => taskTypeFilter === "All" || t.TaskType === taskTypeFilter)
    .filter((t) => t.Title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box display="flex" flexDirection="column" height="100%" sx={{ borderRight: "1px solid #e0e0e0" }}>

      {/* Header */}
      <Box px={2} pt={2} pb={1}>
        <Typography variant="h6" fontWeight={700}>
          My Tasks
        </Typography>
      </Box>

      {/* Search */}
      <Box px={2} pb={1}>
        <TextField
          placeholder="Search..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#f5f5f5",
              "& fieldset": { border: "none" },
            },
          }}
        />
      </Box>

      {/* Task Type Filter */}
      <Box px={2} pb={1}>
        <FormControl fullWidth size="small">
          <Select
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.target.value)}
            sx={{
              borderRadius: 2,
              backgroundColor: "#f5f5f5",
              fontSize: 13,
              "& fieldset": { border: "none" },
            }}
          >
            {taskTypes.map((type) => (
              <MenuItem key={type} value={type} sx={{ fontSize: 13 }}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          px: 2,
          minHeight: 36,
          "& .MuiTab-root": { minHeight: 36, fontSize: 13, textTransform: "none", fontWeight: 500 },
        }}
      >
        <Tab label={`Pending (${tasks.filter(t => t.Status === "Pending").length})`} />
        <Tab label={`Approved (${tasks.filter(t => t.Status === "Approved").length})`} />
        <Tab label={`Rejected (${tasks.filter(t => t.Status === "Rejected").length})`} />
        <Tab label={`Completed (${tasks.filter(t => t.Status === "Complete").length})`} />
        <Tab label={`All (${tasks.length})`} />
      </Tabs>

      <Divider />

      {/* Task Cards */}
      <Box overflow="auto" flex={1}>
        {filtered.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" mt={6} fontSize={14}>
            No tasks found.
          </Typography>
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