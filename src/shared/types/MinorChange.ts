import { SharePointPerson } from "./SharePointPerson";

export interface MinorChange {
  Id: number;
  Title: string;
  TargetDocumentId: number;
  ScopeOfChange: string;
  Status: "Pending" | "Implemented" | "Cancelled";
  Created: Date;
  DateImplemented?: Date;
  Notes?: string;
  ImplementedInCR?: number;
  RequestedBy: SharePointPerson;
}