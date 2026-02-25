import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../shared/hooks/useCurrentUser";
import { Task } from "../../../shared/types/Task";
import Box from "@mui/material/Box";
import React from "react";
import SharePointService from "../../../shared/services/SharePointService";
import TaskList from "./TaskList";
import TaskPane from "./TaskPane";
import CircularProgress from "@mui/material/CircularProgress";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { TaskDetail } from "./TaskDetail";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";

const TaskHub = () => {
  const { currentUser, loading } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [cr, setCr] = useState<IChangeRequest | null>(null);
  const [crLoading, setCrLoading] = useState(false);

  useEffect(() => {
    if (!selectedTask) return;
    setCrLoading(true);
    SharePointService.getChangeRequestById(selectedTask.ChangeRequestId)
      .then(setCr)
      .catch(console.error)
      .finally(() => setCrLoading(false));
  }, [selectedTask]);

  useEffect(() => {
    if (!currentUser) return;
    SharePointService.getTasks(currentUser.Id)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setTasksLoading(false));
  }, [currentUser]);

  if (loading || tasksLoading) return <CircularProgress />;

  const refreshCR = () => {
    if (!selectedTask) return;
    SharePointService.getChangeRequestById(selectedTask.ChangeRequestId)
      .then(setCr)
      .catch(console.error);
  };

  return (
    <Box
      height="100vh"
      overflow="hidden"
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,

        overflow: "hidden",
      }}
    >
      {!selectedTask ? (
        // Full width task list — no Allotment
        <TaskList
          tasks={tasks}
          selectedTask={selectedTask}
          onTaskSelect={setSelectedTask}
        />
      ) : (
        // Split view — only when task is selected
        <Allotment>
          <Allotment.Pane minSize={250} maxSize={600} preferredSize="45%" snap>
            <TaskPane
              task={selectedTask}
              cr={cr}
              onBack={() => {
                setSelectedTask(null);
                setCr(null);
              }}
              onTaskComplete={() => {
                if (currentUser) {
                  SharePointService.getTasks(currentUser.Id)
                    .then(setTasks)
                    .catch(console.error);
                }
                setSelectedTask(null);
              }}
            />
          </Allotment.Pane>

          <Allotment.Pane minSize={400}>
            <TaskDetail task={selectedTask} cr={cr} onCRUpdate={refreshCR} />
          </Allotment.Pane>
        </Allotment>
      )}
    </Box>
  );
};

export default TaskHub;
