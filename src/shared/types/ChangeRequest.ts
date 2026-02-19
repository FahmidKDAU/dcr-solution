import { SharePointPerson } from "./SharePointPerson";

import { LookupFieldItem } from "./LookupFieldItem";
import { Department } from "./Department";
export interface IChangeRequest {
  Title: string;
  ChangeRequestNumber: string;
  ID: number;
  Id?: number;
  ScopeOfChange: string;
  NewDocument: boolean;
  CoreFunctionality?: Department;
  Status:
    | "Submitted"
    | "CA Review"
    | "Approved"
    | "Document Creation"
    | "Document Review"
    | "Published"
    | "Rejected";
  CreatedBy: SharePointPerson;
  ChangeAuthority: SharePointPerson;
  Author: SharePointPerson;
  Reviewers: SharePointPerson[];
  Contributors: SharePointPerson[];
  Urgency: "Standard" | "Urgent" | "Minor";
  ReleaseAuthority: SharePointPerson;
  BusinessFunction: LookupFieldItem[];
  Categories: LookupFieldItem[];
  DocumentType: LookupFieldItem;
  Classification: "Public" | "Internal" | "Confidential" | "Restricted";
  Audience: LookupFieldItem;
  DraftDocumentName?: string;
  PublishedDate: string;
}
