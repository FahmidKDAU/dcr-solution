// src/shared/types/Document.ts
import { LookupFieldItem } from "./LookupFieldItem";
import { SharePointPerson } from "./SharePointPerson";

export interface Document {
  DocumentUrl: JSX.Element;
  Id: number;
  DocumentTitle: string;
  Description?: string;
  Active?: boolean;
  PublishedDate: Date;
  BusinessFunction?: LookupFieldItem[];
  Category?: LookupFieldItem[];
  DocumentType?: LookupFieldItem; 
  Classification?: "Public" | "Internal" | "Confidential" | "Restricted";
  Audience?: LookupFieldItem;
  CoreFunctionality?: LookupFieldItem;
  
  ReleaseAuthority?: SharePointPerson;
  Author0?: SharePointPerson;
  ChangeAuthority?: SharePointPerson;
  FileRef?: string;
  FileLeafRef?: string;  
}