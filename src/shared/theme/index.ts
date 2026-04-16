import { BRANDING } from './theme';
export { default as theme, BRANDING } from './theme';

export const getDocTypeColor = (docType?: string): string => {
  if (!docType) return BRANDING.docTypes.default;
  const key = docType.toLowerCase() as keyof typeof BRANDING.docTypes;
  return BRANDING.docTypes[key] ?? BRANDING.docTypes.default;
};

export const getClassificationColor = (classification?: string): string => {
  if (!classification) return '#5C6670';
  const key = classification.toLowerCase() as keyof typeof BRANDING.classifications;
  return BRANDING.classifications[key] ?? '#5C6670';
};
