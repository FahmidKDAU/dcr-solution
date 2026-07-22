import { SharePointPerson } from "./SharePointPerson";

export interface ReadAcknowledgement {
  Id: number;
  Title: string;
  PublishedDocumentId: {
    Id: number;
    DocumentTitle: string;
    PublishedFileUrl?: string;
  };
  ReadRequirementsId: {
    Id: number;
    DueDate?: string;
  };
  Person: SharePointPerson;
  Acknowledged: boolean;
  AcknowledgedDate?: string;
  DocumentVersion?: string;
  Created?: string;
}
