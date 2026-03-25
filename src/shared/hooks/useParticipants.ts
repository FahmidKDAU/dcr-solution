import { useCallback, useEffect, useState } from "react";
import { Participant } from "../types/Participant";
import SharePointService from "../services/SharePointService";

const participantRefetchListeners = new Map<number, Set<() => void>>();

const registerParticipantRefetchListener = (
  changeRequestId: number,
  listener: () => void,
): (() => void) => {
  const listeners = participantRefetchListeners.get(changeRequestId) ?? new Set();
  listeners.add(listener);
  participantRefetchListeners.set(changeRequestId, listeners);

  return (): void => {
    const currentListeners = participantRefetchListeners.get(changeRequestId);
    if (!currentListeners) {
      return;
    }

    currentListeners.delete(listener);
    if (currentListeners.size === 0) {
      participantRefetchListeners.delete(changeRequestId);
    }
  };
};

export const emitParticipantRefetch = (changeRequestId: number): boolean => {
  const listeners = participantRefetchListeners.get(changeRequestId);
  if (!listeners || listeners.size === 0) {
    return false;
  }

  listeners.forEach((listener) => listener());
  return true;
};

export const useParticipants = (
  changeRequestId: number | undefined,
): {
  participants: Participant[];
  contributors: Participant[];
  reviewers: Participant[];
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
} => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchParticipants = useCallback((): Promise<void> => {
    if (changeRequestId === undefined) {
      setParticipants([]);
      setError(undefined);
      setLoading(false);
      return Promise.resolve();
    }

    setLoading(true);
    return SharePointService.getParticipants(changeRequestId)
      .then((data) => {
        setParticipants(data);
        setError(undefined);
      })
      .catch((err) => {
        setError("Failed to fetch participants");
        console.error("Error fetching participants:", err);
      })
      .finally(() => setLoading(false));
  }, [changeRequestId]);

  useEffect(() => {
    fetchParticipants().catch(() => undefined);
  }, [fetchParticipants]);

  useEffect(() => {
    if (changeRequestId === undefined) {
      return;
    }

    const handleRefetch = (): void => {
      fetchParticipants().catch(() => undefined);
    };

    return registerParticipantRefetchListener(changeRequestId, handleRefetch);
  }, [changeRequestId, fetchParticipants]);

  const contributors = participants.filter((p) => p.Role === "Contributor");
  const reviewers = participants.filter((p) => p.Role === "Reviewer");

  const refetch = useCallback((): void => {
    if (changeRequestId === undefined) {
      fetchParticipants().catch(() => undefined);
      return;
    }

    const emitted = emitParticipantRefetch(changeRequestId);
    if (!emitted) {
      fetchParticipants().catch(() => undefined);
    }
  }, [changeRequestId, fetchParticipants]);

  return {
    participants,
    contributors,
    reviewers,
    loading,
    error,
    refetch,
  };
};