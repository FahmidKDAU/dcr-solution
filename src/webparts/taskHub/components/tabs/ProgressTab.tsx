import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";
import BlockIcon from "@mui/icons-material/Block";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgressTabProps {
  cr: IChangeRequest;
}

// ─── Stage Definitions ────────────────────────────────────────────────────────

interface Stage {
  key: string;
  label: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    key: "Submitted",
    label: "Submitted",
    description: "Change request submitted and awaiting review.",
  },
  {
    key: "CA Review",
    label: "Change Authority Review",
    description: "CA evaluates the scope and decides how to proceed.",
  },
  {
    key: "Approved",
    label: "Approved",
    description: "Change request approved. Document change process begins.",
  },
  {
    key: "Document Creation",
    label: "Document Creation",
    description:
      "Author and contributors working on the document changes.",
  },
  {
    key: "Document Review",
    label: "Document Review",
    description: "Reviewers verifying the document meets requirements.",
  },
  {
    key: "Publishing Approval",
    label: "Publishing Approval",
    description:
      "Final approval from Release Authority before publishing.",
  },
  {
    key: "Published",
    label: "Published",
    description: "Document published and available in the portal.",
  },
];

// Terminal statuses that end the workflow early
const TERMINAL_STATUSES: Record<
  string,
  { label: string; description: string; color: string }
> = {
  Rejected: {
    label: "Rejected",
    description: "This change request was rejected.",
    color: "#A4262C",
  },
  "Minor Change": {
    label: "Minor Change",
    description:
      "Added to the minor change register for the next scheduled review.",
    color: "#835B00",
  },
  Obsolete: {
    label: "Marked for Obsoletion",
    description: "Document obsoletion process has been initiated.",
    color: "#A4262C",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StageState = "complete" | "current" | "upcoming" | "terminal";

const getStageStates = (
  crStatus: string
): { stages: (Stage & { state: StageState })[]; terminal: boolean } => {
  const terminalInfo = TERMINAL_STATUSES[crStatus];
  if (terminalInfo) {
    // Find how far the CR got before hitting a terminal state
    // Terminal typically happens during CA Review
    const reachedIndex = crStatus === "Rejected" ? 1 : 1; // Both happen at CA Review
    return {
      stages: STAGES.map((stage, i) => ({
        ...stage,
        state:
          i < reachedIndex
            ? "complete"
            : i === reachedIndex
              ? "terminal"
              : "upcoming",
      })),
      terminal: true,
    };
  }

  const currentIndex = STAGES.findIndex((s) => s.key === crStatus);
  if (currentIndex === -1) {
    return {
      stages: STAGES.map((stage) => ({ ...stage, state: "upcoming" as StageState })),
      terminal: false,
    };
  }

  return {
    stages: STAGES.map((stage, i) => ({
      ...stage,
      state:
        i < currentIndex
          ? "complete"
          : i === currentIndex
            ? crStatus === "Published"
              ? "complete"
              : "current"
            : "upcoming",
    })),
    terminal: false,
  };
};

// ─── Stage Icon ───────────────────────────────────────────────────────────────

const StageIcon = ({ state }: { state: StageState }) => {
  switch (state) {
    case "complete":
      return <CheckCircleIcon sx={{ fontSize: 22, color: "#107C10" }} />;
    case "current":
      return (
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2.5px solid #0078D4",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#0078D4",
            }}
          />
        </Box>
      );
    case "terminal":
      return <ErrorIcon sx={{ fontSize: 22, color: "#A4262C" }} />;
    case "upcoming":
    default:
      return (
        <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: "#C8C6C4" }} />
      );
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProgressTab = ({ cr }: ProgressTabProps) => {
  const { stages, terminal } = getStageStates(cr.Status);
  const terminalInfo = TERMINAL_STATUSES[cr.Status];

  return (
    <Box p={3} display="flex" flexDirection="column" gap={2}>
      {/* Current status summary */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.25,
          backgroundColor: terminal ? "#FDE7E9" : "#EFF6FC",
          border: `1px solid ${terminal ? "#F1C1C4" : "#BFE0FF"}`,
          borderRadius: "6px",
        }}
      >
        {terminal ? (
          <BlockIcon sx={{ fontSize: 18, color: "#A4262C" }} />
        ) : (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: cr.Status === "Published" ? "#107C10" : "#0078D4",
              flexShrink: 0,
            }}
          />
        )}
        <Typography sx={{ fontSize: 13, color: "#323130" }}>
          <strong>
            {terminal ? terminalInfo?.label : cr.Status}
          </strong>
          <Typography
            component="span"
            sx={{ fontSize: 13, color: "#605E5C", ml: 0.5 }}
          >
            — {terminal
              ? terminalInfo?.description
              : stages.find((s) => s.state === "current")?.description ??
                "Workflow complete."}
          </Typography>
        </Typography>
      </Box>

      {/* Timeline */}
      <Box sx={{ pl: 1, pr: 2 }}>
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;

          return (
            <Box key={stage.key} sx={{ display: "flex", gap: 2 }}>
              {/* Icon + connector line */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pt: 0.25,
                }}
              >
                <StageIcon state={stage.state} />
                {!isLast && (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      backgroundColor:
                        stage.state === "complete" ? "#107C10" : "#E1DFDD",
                      my: 0.5,
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>

              {/* Content */}
              <Box
                sx={{
                  pb: isLast ? 0 : 2.5,
                  flex: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      stage.state === "complete"
                        ? "#107C10"
                        : stage.state === "current"
                          ? "#0078D4"
                          : stage.state === "terminal"
                            ? "#A4262C"
                            : "#A19F9D",
                    lineHeight: 1.4,
                  }}
                >
                  {stage.label}
                  {stage.state === "current" && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        ml: 1,
                        px: 0.75,
                        py: 0.1,
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: "#EFF6FC",
                        color: "#0078D4",
                        borderRadius: "8px",
                        letterSpacing: 0.3,
                        verticalAlign: "middle",
                      }}
                    >
                      CURRENT
                    </Box>
                  )}
                  {stage.state === "terminal" && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        ml: 1,
                        px: 0.75,
                        py: 0.1,
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: "#FDE7E9",
                        color: "#A4262C",
                        borderRadius: "8px",
                        letterSpacing: 0.3,
                        verticalAlign: "middle",
                      }}
                    >
                      {terminalInfo?.label.toUpperCase()}
                    </Box>
                  )}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color:
                      stage.state === "upcoming" ? "#C8C6C4" : "#605E5C",
                    lineHeight: 1.5,
                    mt: 0.25,
                  }}
                >
                  {stage.state === "terminal"
                    ? terminalInfo?.description
                    : stage.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProgressTab;