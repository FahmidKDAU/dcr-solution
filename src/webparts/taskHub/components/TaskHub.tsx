// src/webparts/taskHub/components/TaskHub.tsx
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "../../../shared/hooks/useCurrentUser";
import { Task } from "../../../shared/types/Task";
import Box from "@mui/material/Box";
import React from "react";
import SharePointService from "../../../shared/services/SharePointService";
import TaskList from "./TaskList";
import TaskPane from "./TaskPane";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { TaskDetail } from "./TaskDetail";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import { WebPartProvider } from "../../../shared/contexts/WebPartContext";
import TaskProcessingPane from "./TaskProcressingPane";

interface TaskHubProps {
  webAbsoluteUrl: string;
}

type PollingStatus = "waiting" | "found" | "timeout" | null;

// Only CA tasks get a follow-up task in the same user's inbox
const TASKS_THAT_POLL: Task["TaskType"][] = [
  "Change Authority Approval",
  "Change Authority Review",
];

// Human-readable labels for the toast message
const TASK_TYPE_LABELS: Partial<Record<Task["TaskType"], string>> = {
  "Change Authority Approval": "Approval submitted",
  "Change Authority Review": "Review submitted",
  "Document Change Process": "Document submitted for publishing",
  "Compliance Authority Review": "Compliance review submitted",
  "Document Controller Review": "Document controller review submitted",
  "Publishing Review": "Publishing review submitted",
  "Participant Task": "Response submitted",
};

const TaskHub = (props: TaskHubProps) => {
  const { currentUser, loading } = useCurrentUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [cr, setCr] = useState<IChangeRequest | null>(null);
  const [crLoading, setCrLoading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<PollingStatus>(null);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Load CR whenever selected task changes
  useEffect(() => {
    if (!selectedTask) return;
    setCrLoading(true);
    SharePointService.getChangeRequestById(selectedTask.ChangeRequestId)
      .then(setCr)
      .catch(console.error)
      .finally(() => setCrLoading(false));
  }, [selectedTask]);

  // Initial task load
  useEffect(() => {
    if (!currentUser) return;
    SharePointService.getTasks(currentUser.Id)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setTasksLoading(false));
  }, [currentUser]);

  if (loading || tasksLoading) return <CircularProgress />;

  // ── Helpers ──

  const refreshCR = () => {
    if (!selectedTask) return;
    SharePointService.getChangeRequestById(selectedTask.ChangeRequestId)
      .then(setCr)
      .catch(console.error);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const showToast = (taskType: Task["TaskType"]) => {
    const message =
      TASK_TYPE_LABELS[taskType] ?? "Task submitted successfully";
    setToastMessage(message);
    setToastOpen(true);
  };

  // ── Navigation — defined before handleTaskComplete so it can be called inside it ──

  const handleGoToInbox = () => {
    stopPolling();
    setPollingStatus(null);
    setSelectedTask(null);
    setCr(null);
  };

  // ── Task complete handler ──

  const handleTaskComplete = () => {
    if (!currentUser || !selectedTask) return;

    const taskType = selectedTask.TaskType;
    const shouldPoll = TASKS_THAT_POLL.includes(taskType);

    // Always show toast regardless of task type
    showToast(taskType);

    if (!shouldPoll) {
      // Reviewers, contributors, DC, RA — refresh and go straight to inbox
      SharePointService.getTasks(currentUser.Id)
        .then(setTasks)
        .catch(console.error);
      handleGoToInbox();
      return;
    }

    // CA tasks — poll for the next task PA creates
    const completedCrId = selectedTask.ChangeRequestId;
    const knownTaskIds = new Set(tasks.map((t) => t.Id));

    setPollingStatus("waiting");

    let attempts = 0;
    const maxAttempts = 12; // 12 × 5s = 60s max

    pollingRef.current = setInterval(() => {
      attempts++;

      SharePointService.getTasks(currentUser.Id)
        .then((freshTasks) => {
          setTasks(freshTasks);

          const nextTask = freshTasks.find(
            (t) =>
              t.ChangeRequestId === completedCrId &&
              !knownTaskIds.has(t.Id) &&
              t.Status === "Pending"
          );

          if (nextTask) {
            stopPolling();
            setPollingStatus("found");
            setTimeout(() => {
              setPollingStatus(null);
              setSelectedTask(nextTask);
            }, 1200);
          } else if (attempts >= maxAttempts) {
            stopPolling();
            setPollingStatus("timeout");
          }
        })
        .catch(() => {
          if (attempts >= maxAttempts) {
            stopPolling();
            setPollingStatus("timeout");
          }
        });
    }, 5000);
  };

  // ── Render ──

  const showSplitLayout = selectedTask !== null || pollingStatus !== null;

  return (
    <WebPartProvider value={{ webAbsoluteUrl: props.webAbsoluteUrl }}>
      <Box
        sx={{
          height: "calc(100vh - var(--sp-applicationPageHeaderHeight, 120px))",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* ── Success toast — shown for all task completions ── */}
    <Snackbar
  open={toastOpen}
  autoHideDuration={5000}
  onClose={(_, reason) => {
    // Don't close if user clicked away accidentally
    if (reason === "clickaway") return;
    setToastOpen(false);
  }}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  sx={{
    // Pull it up slightly from the very bottom edge
    bottom: "24px !important",
    right: "24px !important",
  }}
>
  <Alert
    onClose={() => setToastOpen(false)}
    severity="success"
    variant="filled"
    sx={{
      fontSize: "13px",
      fontWeight: 500,
      borderRadius: "6px",
      minWidth: "280px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      alignItems: "center",
      // Fix the close button alignment inside MUI Alert
      "& .MuiAlert-action": {
        paddingTop: 0,
        alignItems: "center",
      },
      "& .MuiAlert-icon": {
        fontSize: 18,
        alignItems: "center",
      },
    }}
  >
    {toastMessage}
  </Alert>
</Snackbar>
        {/* ── Inbox (no task selected, not polling) ── */}
        {!showSplitLayout && (
          <TaskList
            tasks={tasks}
            selectedTask={selectedTask}
            onTaskSelect={setSelectedTask}
            onTasksChange={setTasks}
            loading={tasksLoading}
          />
        )}

        {/* ── Split layout (task selected OR polling in progress) ── */}
        {showSplitLayout && (
          <Allotment>
            <Allotment.Pane
              minSize={250}
              maxSize={600}
              preferredSize="45%"
              snap
            >
              {pollingStatus !== null ? (
                <TaskProcessingPane
                  pollingStatus={pollingStatus}
                  onGoToInbox={handleGoToInbox}
                />
              ) : (
                <TaskPane
                  task={selectedTask}
                  cr={cr}
                  currentUser={currentUser}
                  onBack={handleGoToInbox}
                  onTaskComplete={handleTaskComplete}
                  onRefetch={refreshCR}
                />
              )}
            </Allotment.Pane>

            <Allotment.Pane minSize={400}>
              <TaskDetail
                cr={cr}
                crLoading={crLoading}
                onCRUpdate={refreshCR}
                currentUser={currentUser ?? undefined}
              />
            </Allotment.Pane>
          </Allotment>
        )}
      </Box>
    </WebPartProvider>
  );
};

export default TaskHub;