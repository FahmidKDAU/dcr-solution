import { useEffect, useState } from "react";
import SharePointService from "../services/SharePointService";
import { Document } from "../types/Document";
export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await SharePointService.getDocuments();
      setDocuments(data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     fetchDocuments().catch(console.error);
  }, []);
  return { documents, loading, error };
};
