import { SharePointPerson } from "./SharePointPerson";

export interface Department {
  Title: string;
  Id: number;
  DepartmentName: string;
  ChangeAuthority: SharePointPerson | undefined;
}
