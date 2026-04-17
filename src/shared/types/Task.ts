// src/shared/types/Task.ts
import { SharePointPerson } from "./SharePointPerson";

export interface Task {
  Id: number;
  Title: string;
  ChangeRequestId: number;
  // Expanded lookup field
  ChangeRequest?: {
    Id: number;
    ChangeRequestNumber?: string;
    Title?: string;
  };
  TaskType:
    | "CA Review"
    | "Document Review"
    | "Final Approval"
    | "CR Completion"
    | "CR Info Required"
    | "Change Authority Approval"
    | "Change Authority Review"
    | "Document Controller Review"
    | "Compliance Authority Review"
    | "Publishing Review"
    | "Author Review"
    | "Document Change Process"
    | "Participant Task";
  AssignedTo?: SharePointPerson;
  Status:
    | "Pending"
    | "In Progress"
    | "Approved"
    | "Rejected"
    | "Reassigned"
    | "Complete"
    | "Cancelled"
    | "Needs more info"
    | "On Hold"
    | "New"
    | "Marked as Minor Change"
    | "Marked for Document Obsoletion";
  Created: Date;
  DueDate?: Date;
  Requestor?: SharePointPerson;
  Comments?: string;
}