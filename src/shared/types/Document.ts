// src/shared/types/Document.ts
import { LookupFieldItem } from "./LookupFieldItem";
import { SharePointPerson } from "./SharePointPerson";

export interface Document {
  Id: number;
  DocumentTitle: string;
  Description?: string;
  Active?: boolean;
  
  // Metadata fields (using actual SharePoint field names)
  BusinessFunction?: LookupFieldItem[];
  Category?: LookupFieldItem[]; // ← NOT DocumentCategory!
  DocumentType?: LookupFieldItem; 
  Classification?: "Public" | "Internal" | "Confidential" | "Restricted";
  Audience?: LookupFieldItem;
  CoreFunctionality?: LookupFieldItem;
  
  // People fields
  ReleaseAuthority?: SharePointPerson;
  Author0?: SharePointPerson; // ← SharePoint's Author field
  ChangeAuthority?: SharePointPerson;
  FileRef?: string; // Server-relative URL to the file
}