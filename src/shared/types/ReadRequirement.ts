import { LookupFieldItem } from "./LookupFieldItem";

export interface ReadRequirement {
  Id: number;
  Title: string;
  PublishedDocumentId: number;
  DocumentTitle: string;
  AudienceId: LookupFieldItem[];
  DueDate?: string;
  Status: "Active" | "Closed";
  Created?: string;
}
