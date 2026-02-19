import { SharePointPerson } from "./SharePointPerson";

export interface Task {
  Id: number;
  Title: string;
  ChangeRequestestId: number;
  TaskType:
    | "CA Review"
    | "Document Review"
    | "Final Approval"
    | "CR Completion"
    | "CR Info Requried"
    | "Change Authority Approval"
    | "Change Authority Review"
    | "Document Controller Review";
  AssignedTo: SharePointPerson;
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
    | "Marked for Documnt Obsoletion";

    DueDate: Date;
    Requestor: SharePointPerson;
    RejectionReason?: string;
}
