// src/webparts/adminDashboard/AdminDashboardWebPart.ts
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import AdminDashboard from "./components/AdminDashboard";
import { IAdminDashboardProps } from "./components/IAdminDashboardProps";
import { PnPSetup } from "../../shared/services/PnPSetup";
import theme from "../../shared/theme/theme";

export interface IAdminDashboardWebPartProps {
  description: string;
}

export default class AdminDashboardWebPart extends BaseClientSideWebPart<IAdminDashboardWebPartProps> {

  protected async onInit(): Promise<void> {
    await super.onInit();
    PnPSetup.initialize(this.context);
    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement = React.createElement(
      ThemeProvider,
      { theme },
      React.createElement(CssBaseline),
      React.createElement(AdminDashboard, {
        webAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
        context: this.context,
      } as IAdminDashboardProps),
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Admin Dashboard Settings" },
          groups: [
            {
              groupName: "Settings",
              groupFields: [
                PropertyPaneTextField("description", { label: "Description" }),
              ],
            },
          ],
        },
      ],
    };
  }
}