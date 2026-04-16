export interface BrandingConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/** Default branding used when no SharePoint config list exists */
export const DEFAULT_BRANDING: BrandingConfig = {
  companyName: 'Document Control',
  logoUrl: '',
  primaryColor: '#2d2d2d',
  secondaryColor: '#6C757D',
  accentColor: '#0078D4',
};
