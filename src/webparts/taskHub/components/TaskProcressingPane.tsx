// src/webparts/taskHub/components/TaskProcessingPane.tsx
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { BRANDING } from "../../../shared/theme/theme";

interface TaskProcessingPaneProps {
  pollingStatus: "waiting" | "found" | "timeout";
  onGoToInbox: () => void;
}

const TaskProcessingPane = ({
  pollingStatus,
  onGoToInbox,
}: TaskProcessingPaneProps): React.ReactElement => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderRight: "1px solid #EDEBE9",
      }}
    >
      {/* Back button — always available */}
      <Box px={2} pt={1.5} pb={0.5}>
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          size="small"
          onClick={onGoToInbox}
          sx={{
            color: "#605E5C",
            fontSize: 12,
            fontWeight: 500,
            textTransform: "none",
            px: 1,
            "&:hover": { backgroundColor: "#F3F2F1", color: "#323130" },
          }}
        >
          Back to inbox
        </Button>
      </Box>

      {/* Main content — centred */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          {/* Icon */}
          {pollingStatus === "waiting" && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#EFF6FC",
                border: `2px solid ${BRANDING.primaryLight}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={24}
                thickness={3}
                sx={{ color: BRANDING.primary }}
              />
            </Box>
          )}

          {pollingStatus === "found" && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#F0FDF4",
                border: "2px solid #BBF7D0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 28, color: "#16A34A" }} />
            </Box>
          )}

          {pollingStatus === "timeout" && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#FFF7ED",
                border: "2px solid #FED7AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 28, color: "#C2410C" }} />
            </Box>
          )}

        
          {pollingStatus === "found" && (
            <Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#323130",
                  mb: 0.75,
                }}
              >
                Next task ready
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: "#605E5C", lineHeight: 1.6 }}
              >
                Loading your next task...
              </Typography>
            </Box>
          )}

          {pollingStatus === "timeout" && (
            <Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#323130",
                  mb: 0.75,
                }}
              >
                Taking longer than expected
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: "#605E5C", lineHeight: 1.6 }}
              >
                The next task will appear in your inbox shortly. You can go back
                and wait, or check back in a moment.
              </Typography>
            </Box>
          )}

          {/* Back to inbox button — shown on timeout, or as secondary on waiting */}
          {pollingStatus === "timeout" && (
            <Button
              variant="contained"
              disableElevation
              fullWidth
              onClick={onGoToInbox}
              sx={{
                backgroundColor: BRANDING.primary,
                fontSize: 13,
                fontWeight: 600,
                py: 1.25,
                borderRadius: "6px",
                textTransform: "none",
                "&:hover": { backgroundColor: BRANDING.primaryDark },
              }}
            >
              Go to inbox
            </Button>
          )}

          {pollingStatus === "waiting" && (
            <>
              <Box>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#323130",
                    mb: 0.75,
                  }}
                >
                  Task submitted
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: "#605E5C", lineHeight: 1.6 }}
                >
                  Waiting for the next step to be created.
                  <br />
                  This usually takes a few seconds.
                </Typography>
              </Box>

              <Button
                variant="text"
                size="small"
                onClick={onGoToInbox}
                sx={{
                  fontSize: 12,
                  color: "#94A3B8",
                  textTransform: "none",
                  "&:hover": {
                    color: "#605E5C",
                    backgroundColor: "transparent",
                  },
                }}
              >
                Don't wait — go to inbox
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TaskProcessingPane;
