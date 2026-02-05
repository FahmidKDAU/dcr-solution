import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import { PnPSetup } from '../../shared/services/PnPSetup';
import DcrForm from './components/DcrForm';

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
      DcrForm,
      {
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Settings'
          },
          groups: [
            {
              groupName: 'Settings',
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}