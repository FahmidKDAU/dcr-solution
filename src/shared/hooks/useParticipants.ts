import { useState, useEffect } from "react";
import { Participant } from "../types/Participant";
import SharePointService from "../services/SharePointService";

export const useParticipants = (changeRequestId: number | undefined) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (changeRequestId === undefined) return;
    setLoading(true);
    SharePointService.getParticipants(changeRequestId)
      .then((data) => { setParticipants(data); setError(null); })
      .catch((err) => { setError("Failed to fetch participants"); console.error("Error fetching participants:", err); })
      .finally(() => setLoading(false));
  }, [changeRequestId, tick]);

  const contributors = participants.filter((p) => p.Role === "Contributor");
  const reviewers = participants.filter((p) => p.Role === "Reviewer");

  return {
    participants,
    contributors,
    reviewers,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
};