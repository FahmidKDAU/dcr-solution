import { useState, useEffect, useCallback } from "react";
import SharePointService from "../services/SharePointService";
import { ReadAcknowledgement } from "../types/ReadAcknowledgement";

interface UseReadAcknowledgementsResult {
  acknowledgements: ReadAcknowledgement[];
  loading: boolean;
  count: number;
  refetch: () => void;
}

export const useReadAcknowledgements = (
  userId: number | undefined,
): UseReadAcknowledgementsResult => {
  const [acknowledgements, setAcknowledgements] = useState<ReadAcknowledgement[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(() => {
    if (!userId) {
      setAcknowledgements([]);
      return;
    }

    setLoading(true);
    SharePointService.getPendingReadAcknowledgements(userId)
      .then(setAcknowledgements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    acknowledgements,
    loading,
    count: acknowledgements.length,
    refetch: fetch,
  };
};
