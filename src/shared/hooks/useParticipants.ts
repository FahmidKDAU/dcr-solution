import { useState, useEffect } from "react";
import { Participant } from "../types/Participant";
import SharePointService from "../services/SharePointService";

export const useParticipants = (changeRequestId: number | undefined) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async (changeRequestId: number): Promise<void> => {
    console.log("useParticipants called with ID:", changeRequestId);

    try {
      setLoading(true);
      const data = await SharePointService.getParticipants(changeRequestId);
      setParticipants(data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch participants");
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (changeRequestId !== undefined) {
      fetchParticipants(changeRequestId).catch(console.error);
    }
  }, [changeRequestId]);

  const contributors = participants.filter((p) => p.Role === "Contributor");
  const reviewers = participants.filter((p) => p.Role === "Reviewer");
  return {
    participants,
    contributors,
    reviewers,
    loading,
    error,
    refetch: fetchParticipants,
  };
};
