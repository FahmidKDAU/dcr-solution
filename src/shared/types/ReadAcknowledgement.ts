import { SharePointPerson } from "./SharePointPerson";

export interface ReadAcknowledgement {
  Id: number;
  Title: string;
  PublishedDocumentId: number;
  ReadRequirementId: number;
  Person: SharePointPerson;
  Acknowledged: boolean;
  AcknowledgedDate?: string;
  DocumentVersion?: string;
  Created?: string;
}
