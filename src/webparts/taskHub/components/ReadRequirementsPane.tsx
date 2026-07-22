import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useReadAcknowledgements } from "../../../shared/hooks/useReadAcknowledgements";
import SharePointService from "../../../shared/services/SharePointService";
import { ReadAcknowledgement } from "../../../shared/types/ReadAcknowledgement";

interface ReadRequirementsPaneProps {
  userId: number;
  onBack: () => void;
}

const ReadRequirementsPane: React.FC<ReadRequirementsPaneProps> = ({
  userId,
  onBack,
}) => {
  const { acknowledgements, loading, refetch } = useReadAcknowledgements(userId);

  const handleAcknowledge = async (ack: ReadAcknowledgement): Promise<void> => {
    try {
      await SharePointService.acknowledgeDocument(ack.Id, ack.DocumentVersion);
      refetch();
    } catch (error) {
      console.error("Error acknowledging:", error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (acknowledgements.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        gap={1.5}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 40, color: "#107C10" }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#323130" }}>
          All caught up
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#A19F9D" }}>
          No pending read requirements
        </Typography>
        <Button
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={onBack}
          sx={{
            mt: 1,
            color: "#605E5C",
            fontSize: 12,
            fontWeight: 500,
            textTransform: "none",
            px: 1,
            "&:hover": { backgroundColor: "#F3F2F1", color: "#323130" },
          }}
        >
          Back to tasks
        </Button>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      sx={{ backgroundColor: "#fff", overflow: "hidden" }}
    >
      <Box px={2} pt={1.5} pb={0.5} sx={{ flexShrink: 0 }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          size="small"
          onClick={onBack}
          sx={{
            color: "#605E5C",
            fontSize: 12,
            fontWeight: 500,
            textTransform: "none",
            px: 1,
            "&:hover": { backgroundColor: "#F3F2F1", color: "#323130" },
          }}
        >
          All tasks
        </Button>
      </Box>

      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #EDEBE9",
          flexShrink: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <MenuBookIcon sx={{ fontSize: 18, color: "#0078D4" }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#323130" }}>
            Read Requirements
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 20,
              height: 20,
              borderRadius: "10px",
              backgroundColor: "#0078D4",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
              px: 0.75,
            }}
          >
            {acknowledgements.length}
          </Box>
        </Box>
        <Typography sx={{ fontSize: 12, color: "#A19F9D" }}>
          Please read and acknowledge the following documents
        </Typography>
      </Box>

      <Box flex={1} overflow="auto" sx={{ px: 3, py: 2 }}>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {acknowledgements.map((ack) => {
            const doc = ack.PublishedDocumentId;
            const dueDate = ack.ReadRequirementsId?.DueDate;
            const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

            return (
              <Box
                key={ack.Id}
                sx={{
                  border: "1px solid #EDEBE9",
                  borderRadius: "6px",
                  p: 2,
                  backgroundColor: "#FAFAFA",
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: "#323130", mb: 0.5 }}
                >
                  {doc?.DocumentTitle ?? "Document"}
                </Typography>

                {dueDate && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: isOverdue ? "#D13438" : "#A19F9D",
                      fontWeight: isOverdue ? 600 : 400,
                      mb: 1,
                    }}
                  >
                    {isOverdue ? "Overdue - " : "Due: "}
                    {new Date(dueDate).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                )}

                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {doc?.PublishedFileUrl && (
                    <Button
                      size="small"
                      startIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                      href={doc.PublishedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      sx={{
                        fontSize: 12,
                        textTransform: "none",
                        borderColor: "#E2E8F0",
                        color: "#323130",
                        "&:hover": {
                          borderColor: "#CBD5E1",
                          backgroundColor: "white",
                        },
                      }}
                    >
                      Open document
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    onClick={() => void handleAcknowledge(ack)}
                    sx={{
                      fontSize: 12,
                      textTransform: "none",
                      backgroundColor: "#107C10",
                      "&:hover": { backgroundColor: "#0B6A0B" },
                    }}
                  >
                    Acknowledge
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default ReadRequirementsPane;
