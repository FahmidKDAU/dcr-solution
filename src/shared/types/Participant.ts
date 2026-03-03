import { SharePointPerson } from "./SharePointPerson";

export interface Participant {
  Id: number;
  Title?: string;
  ChangeRequestId: number;
  Person: SharePointPerson;
  Role: "Contributor" | "Reviewer";
  Status: "Not Started" | "In Progress" | "Complete" | "Rejected";
  DueDate?: string;
  StartDate?: string;
  CompletedDate?: string;
  Notes?: string;
}


