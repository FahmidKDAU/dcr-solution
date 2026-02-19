import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../shared/hooks/useCurrentUser";
import { Task } from "../../../shared/types/Task";
import Box from "@mui/material/Box";
import React from "react";
import SharePointService from "../../../shared/services/SharePointService";
import TaskList from "./TaskList";
import TaskPane from "./TaskPane";
import CircularProgress from "@mui/material/CircularProgress";

const TaskHub = () => {
  const { currentUser, loading } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    SharePointService.getTasks(currentUser.Id)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setTasksLoading(false));
  }, [currentUser]);

  if (loading || tasksLoading) return <CircularProgress />;

  return (
    <Box display="flex" height="100vh">
      {/* Left — Task List */}
      <Box width="45%" borderRight="1px solid #e0e0e0">
        <TaskList
          tasks={tasks}
          selectedTask={selectedTask}
          onTaskSelect={setSelectedTask}
        />
      </Box>

      {/* Right — Task Pane */}
      <Box width="55%">
        <TaskPane task={selectedTask} />
      </Box>
    </Box>
  );
};
export default TaskHub;
