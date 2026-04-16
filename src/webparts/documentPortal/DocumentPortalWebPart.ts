import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'DocumentPortalWebPartStrings';
import DocumentPortal from './components/DocumentPortal';
import { PnPSetup } from '../../shared/services/PnPSetup';
import { WebPartProvider } from '../../shared/contexts/WebPartContext';

export interface IDocumentPortalWebPartProps {
  description: string;
}

export default class DocumentPortalWebPart extends BaseClientSideWebPart<IDocumentPortalWebPartProps> {

  private _isDarkTheme: boolean = false;

  public render(): void {
    // DocumentPortal doesn't need props - it uses hooks internally
    const element = React.createElement(DocumentPortal);

    const wrappedElement = React.createElement(
      WebPartProvider,
      { value: { webAbsoluteUrl: this.context.pageContext.web.absoluteUrl } },
      element
    );

    ReactDom.render(wrappedElement, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    PnPSetup.initialize(this.context);
    return Promise.resolve();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
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
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}