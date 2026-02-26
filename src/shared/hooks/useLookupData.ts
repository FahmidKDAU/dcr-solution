import { useEffect, useState } from "react";
import lookupService from "../services/lookupService";
import { LookupFieldItem } from "../types/LookupFieldItem";
import { AudienceGroup } from "../types/AudienceGroup";

export const useLookupData = () => {
  const [documentTypes, setDocumentTypes] = useState<LookupFieldItem[]>([]);
  const [categories, setCategories] = useState<LookupFieldItem[]>([]);
  const [audienceGroups, setAudienceGroups] = useState<AudienceGroup[]>([]);
  const [businessFunctions, setBusinessFunctions] = useState<LookupFieldItem[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLookupData = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await Promise.all([
        lookupService.getDocumentTypes(),
        lookupService.getCategories(),
        lookupService.getAudienceGroups(),
        lookupService.getBusinessFunctions(),
      ]);
      setDocumentTypes(data[0]);
      setCategories(data[1]);
      setAudienceGroups(data[2]);
      setBusinessFunctions(data[3]);
      console.log(documentTypes, categories, audienceGroups, businessFunctions);
    } catch (error) {
      setError("Error fetching lookup data");
      console.error("Error fetching lookup data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLookupData().catch(console.error);
    
  }, []);

  return {
    documentTypes,
    categories,
    audienceGroups,
    businessFunctions,
    loading,
    error,
    fetchLookupData,
  };
};
