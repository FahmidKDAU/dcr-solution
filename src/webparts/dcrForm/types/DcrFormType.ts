export interface DcrFormData {
  title: string;
  scopeOfChange: string;
  newDocument: boolean;
  departmentId: number | null;
  documentTypeId: number | null;
  documentCategoryId: number | null;
  classification: "Public" | "Internal" | "Confidential" | "Restricted" | "";
  draftDocumentName: string;
}
