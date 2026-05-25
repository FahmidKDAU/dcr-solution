// src/webparts/adminDashboard/components/IAdminDashboardProps.ts
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IAdminDashboardProps {
  webAbsoluteUrl: string;
  context: WebPartContext;
}