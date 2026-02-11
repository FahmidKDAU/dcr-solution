import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { PnPSetup } from '../../shared/services/PnPSetup';
import DcrForm from './components/ChangeRequestForm';
import theme from '../../shared/theme/theme'; // Import theme

export interface IDcrFormWebPartProps {
  description: string;
}

export default class DcrFormWebPart extends BaseClientSideWebPart<IDcrFormWebPartProps> {

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
      React.createElement(DcrForm, {
        context: this.context
      })
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): any {
    return {
      pages: [
        {
          header: {
            description: 'Settings'
          },
          groups: [
            {
              groupName: 'Settings',
              groupFields: []
            }
          ]
        }
      ]
    };
  }
}