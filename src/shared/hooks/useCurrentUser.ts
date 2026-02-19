import { useState, useEffect } from "react";
import { SharePointPerson } from "../types/SharePointPerson";
import SharePointService from "../services/SharePointService";
import { set } from "@microsoft/sp-lodash-subset/lib/index";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<SharePointPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async (): Promise<void> => {
    try {
      setLoading(true);
      const user = await SharePointService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCurrentUser().catch(console.error);
  }, []);

  return { currentUser, loading, error };
}
 

