import { Task } from "../types/Task";

const TASK_ACTIONS: Record<Task["TaskType"], string> = {
  "CA Review": "Review",
  "Document Review": "Review",
  "Final Approval": "Approve/Reject",
  "CR Completion": "Complete Request",
  "CR Info Required": "Provide Information",
  "Change Authority Approval": "Approve/Reject",
  "Change Authority Review": "Review",
  "Document Controller Review": "Verify & Sign Off",
  "Compliance Authority Review": "Verify Compliance",
  "Publish Document": "Publish",
  "Author Review": "Review",
  "Document Change Process": "Edit Document",
  "Participant Task": "Provide Input",
  "Publishing Rejection Review": "Resolve Rejection",
};

export const getTaskAction = (taskType: Task["TaskType"]): string => {
  return TASK_ACTIONS[taskType] ?? taskType;
};
