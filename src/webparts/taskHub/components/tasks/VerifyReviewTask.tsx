import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PublishIcon from "@mui/icons-material/Publish";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import { LookupFieldItem } from "../../../../shared/types/LookupFieldItem";
import { SharePointPerson } from "../../../../shared/types/SharePointPerson";
import SharePointService from "../../../../shared/services/SharePointService";
import { REVIEW_PERIOD_OPTIONS, getReviewPeriodLabel } from "../../../../shared/constants";

// ─── Props ────────────────────────────────────────────────────────────────────

interface VerifyReviewTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

type ModalType = "verify" | "reject" | null;

// ─── Field label ──────────────────────────────────────────────────────────────

const FieldLabel = ({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
    <Typography sx={{ fontSize: 12, color: "#605E5C" }}>{children}</Typography>
    {optional && (
      <Typography sx={{ fontSize: 11, color: "#A19F9D" }}>
        (optional)
      </Typography>
    )}
    {!optional && (
      <Typography sx={{ fontSize: 12, color: "#A4262C" }}>*</Typography>
    )}
  </Box>
);

// ─── Action Button ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: "verify" | "reject";
  disabled?: boolean;
}

const ACTION_STYLES = {
  verify: { bg: "#107C10", hover: "#0B6A0B", color: "#fff", border: "none" },
  reject: {
    bg: "#fff",
    hover: "#FDE7E9",
    color: "#A4262C",
    border: "1px solid #D13438",
  },
};

const ActionButton = ({
  label,
  icon,
  onClick,
  variant,
  disabled,
}: ActionButtonProps) => {
  const s = ACTION_STYLES[variant];
  return (
    <Box
      component="button"
      onClick={() => !disabled && onClick()}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        width: "100%",
        py: 1.25,
        px: 2,
        borderRadius: "6px",
        border: disabled ? "1px solid #EDEBE9" : s.border,
        backgroundColor: disabled ? "#F3F2F1" : s.bg,
        color: disabled ? "#A19F9D" : s.color,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        "&:hover": disabled ? {} : { backgroundColor: s.hover },
      }}
    >
      {icon}
      {label}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VerifyReviewTask = ({
  task,
  cr,
  onTaskComplete,
}: VerifyReviewTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftFiles, setDraftFiles] = useState<
    { Name: string; ServerRelativeUrl: string; TimeLastModified: string }[]
  >([]);

  // ── System role lookup (Compliance Authority is a single global role) ────

  const [complianceAuthority, setComplianceAuthority] =
    useState<SharePointPerson | null>(null);

  useEffect(() => {
    SharePointService.getSystemRole("Compliance Authority")
      .then(setComplianceAuthority)
      .catch(console.error);
  }, []);

  // ── Role detection ────────────────────────────────────────────────────────

  const isPublishingReview = task.TaskType === "Publish Document";
  const isDocumentController = task.TaskType === "Document Controller Review";
  const isCoaTaskType = task.TaskType === "Compliance Authority Review";

  // Is the global Compliance Authority the same person as this CR's Release Authority?
  const coaIsRa =
    !!complianceAuthority?.Id &&
    !!cr?.ReleaseAuthority?.Id &&
    complianceAuthority.Id === cr.ReleaseAuthority.Id;

  // COA fields should show either:
  //  - on a genuine "Compliance Authority Review" task, or
  //  - on a "Publish Document" task that is standing in for COA because
  //    COA = RA and no separate COA task was ever created
  const isCoaTask = isCoaTaskType || (isPublishingReview && coaIsRa);

  const coaActsAsRa = isCoaTaskType && coaIsRa;
  const willPublish = isPublishingReview || coaActsAsRa;

  // Show review period (read-only summary) for COA and RA roles (not DC)
  const showReviewPeriod = isPublishingReview || isCoaTaskType;

  // ── COA editable fields (Compliance Authority has override authority) ─────

  const [reviewPeriod, setReviewPeriod] = useState<string | number>(
    cr?.ReviewPeriod ?? "",
  );
  const [downloadFormat, setDownloadFormat] = useState<"PDF" | "Original" | "">(
    cr?.DownloadFormat ?? "",
  );
  const [versionNumber, setVersionNumber] = useState<string>(
    cr?.VersionNumber ?? "",
  );
  const [previousVersion, setPreviousVersion] = useState<string | null>(null);
  const [versionIncrement, setVersionIncrement] = useState<"minor" | "major">(
    "minor",
  );
  const [manualVersionEdit, setManualVersionEdit] = useState(false);
  const [documentNumber, setDocumentNumber] = useState<string>(
    cr?.DocumentNumber ?? "",
  );
  const [readAcknowledgementRequired, setReadAcknowledgementRequired] =
    useState<boolean>(cr?.ReadAcknowledgementRequired ?? false);
  const [readAudienceIds, setReadAudienceIds] = useState<number[]>(
    cr?.ReadAudienceGroups ? cr.ReadAudienceGroups.map((a) => a.Id) : [],
  );
  const [readDueDate, setReadDueDate] = useState<string>(
    cr?.ReadDueDate ? cr.ReadDueDate.split("T")[0] : "",
  );
  const [audienceGroups, setAudienceGroups] = useState<LookupFieldItem[]>([]);
  const [audienceGroupsLoading, setAudienceGroupsLoading] = useState(false);

  useEffect(() => {
    if (!cr?.DraftFolderUrl) return;
    SharePointService.getDraftFolderFiles(cr.DraftFolderUrl)
      .then(setDraftFiles)
      .catch(console.error);
  }, [cr?.DraftFolderUrl]);

  useEffect(() => {
    if (!isCoaTask) return;
    setAudienceGroupsLoading(true);
    SharePointService.getAudienceGroups()
      .then(setAudienceGroups)
      .catch(console.error)
      .finally(() => setAudienceGroupsLoading(false));
  }, [isCoaTask]);

  useEffect(() => {
    if (!isCoaTask || !cr?.TargetDocumentId) return;
    SharePointService.getDocumentById(cr.TargetDocumentId)
      .then((doc) => setPreviousVersion(doc?.VersionNumber ?? null))
      .catch(console.error);
  }, [isCoaTask, cr?.TargetDocumentId]);

  const parseVersion = (
    v: string | null,
  ): { major: number; minor: number } | null => {
    if (!v) return null;
    const match = v.trim().match(/^(\d+)\.(\d+)$/);
    if (!match) return null;
    return { major: parseInt(match[1], 10), minor: parseInt(match[2], 10) };
  };

  const parsedPrev = parseVersion(previousVersion);

  const computeVersion = (increment: "minor" | "major"): string | null => {
    if (!parsedPrev) return null;
    return increment === "minor"
      ? `${parsedPrev.major}.${parsedPrev.minor + 1}`
      : `${parsedPrev.major + 1}.0`;
  };

  const sanitizeVersionInput = (raw: string): string => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
  };

  const suggestedMinor = computeVersion("minor");
  const suggestedMajor = computeVersion("major");

  useEffect(() => {
    if (!parsedPrev) return;
    const suggestion = computeVersion(versionIncrement);
    if (suggestion) setVersionNumber(suggestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousVersion, versionIncrement]);

  const versionMismatch =
    !!parsedPrev &&
    !!versionNumber &&
    versionNumber !== suggestedMinor &&
    versionNumber !== suggestedMajor;

  // ── Derived labels ────────────────────────────────────────────────────────

  const roleLabel = isPublishingReview
    ? "Release Authority"
    : isDocumentController
      ? "Document Controller"
      : "Compliance Authority";

  const infoText = isPublishingReview
    ? "the document meets all requirements and is ready for publishing"
    : isDocumentController
      ? "document control requirements are met"
      : "compliance requirements are met";

  const verifyButtonLabel = willPublish
    ? "Approve for Publishing"
    : "Confirm Verification";
  const verifyModalTitle = willPublish
    ? "Approve for Publishing"
    : `Confirm ${roleLabel} Verification`;
  const verifyModalBody = willPublish
    ? "You are approving this document for publishing. Once confirmed, the document will be published to the Document Portal."
    : `You are confirming this ${roleLabel.toLowerCase()} verification:`;
  const verifyButtonIcon = willPublish ? (
    <PublishIcon sx={{ fontSize: 16 }} />
  ) : (
    <CheckIcon sx={{ fontSize: 16 }} />
  );
  const submittingLabel = willPublish ? "Approving..." : "Verifying...";
  const confirmLabel = willPublish
    ? "Approve for Publishing"
    : "Confirm Verification";

  const selectedAudienceLabels = audienceGroups
    .filter((g) => readAudienceIds.includes(g.Id))
    .map((g) => g.Title)
    .join(", ");

  // ── COA validation ────────────────────────────────────────────────────────

  const coaMissingFields = isCoaTask
    ? [
        ...(reviewPeriod === "" ? ["review period"] : []),
        ...(downloadFormat === "" ? ["download format"] : []),
        ...(versionNumber === "" ? ["version number"] : []),
        ...(!cr?.DocumentNumber && documentNumber === ""
          ? ["document number"]
          : []),
        ...(readAcknowledgementRequired && readAudienceIds.length === 0
          ? ["audience"]
          : []),
      ]
    : [];

  const canVerify = !isCoaTask || coaMissingFields.length === 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClose = (): void => {
    setOpenModal(null);
    setComment("");
    setRejectionReason("");
  };

  const handleVerify = async (): Promise<void> => {
    setSubmitting(true);
    try {
      // COA has override authority over review settings, version, and
      // document number — persist them on the CR before approving.
      // This applies whether this is a genuine "Compliance Authority Review"
      // task, or a "Publish Document" task standing in for COA because
      // COA = RA and no separate COA task exists.
      if (isCoaTask) {
        await SharePointService.updateChangeRequest(cr!.ID, {
          ReviewPeriod: reviewPeriod,
          DownloadFormat: downloadFormat,
          VersionNumber: versionNumber,
          DocumentNumber: cr?.DocumentNumber || documentNumber || undefined,
          ReadAcknowledgementRequired: readAcknowledgementRequired,
          ReadDueDate:
            readAcknowledgementRequired && readDueDate ? readDueDate : null,
          ReadAudienceGroupsId:
            readAcknowledgementRequired && readAudienceIds.length > 0
              ? readAudienceIds
              : [],
        });
      }

      await SharePointService.updateTask(task.Id, {
        Status: "Approved",
        Comments: comment || undefined,
      });

      if (willPublish && cr) {
        await SharePointService.updateChangeRequest(cr.ID, {
          Status: "Ready for Publishing",
        });
      }

      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error verifying task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const notes = rejectionReason + (comment ? `\n\n${comment}` : "");
      await SharePointService.updateTask(task.Id, {
        Status: "Rejected",
        Comments: notes,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error rejecting task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
        {/* ── Info box ── */}
        <Box
          sx={{
            backgroundColor: willPublish ? "#F0FDF4" : "#F9F9F9",
            borderRadius: "6px",
            border: `1px solid ${willPublish ? "#BBF7D0" : "#EDEBE9"}`,
            px: 1.5,
            py: 1.25,
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#605E5C", lineHeight: 1.5 }}>
            {isPublishingReview
              ? "As Release Authority, review the final draft document and confirm it is ready to be published to the Document Portal."
              : `Review the draft document and change request details. Verify that all ${infoText} before approving.`}
          </Typography>
        </Box>

        {/* ── COA = RA notice (shown on the merged Publish Document task) ── */}
        {isPublishingReview && coaIsRa && (
          <Box
            sx={{
              backgroundColor: "#EFF6FC",
              border: "1px solid #C7E0F4",
              borderRadius: "6px",
              px: 1.5,
              py: 1.25,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
            }}
          >
            <InfoOutlinedIcon
              sx={{ fontSize: 15, color: "#0078D4", mt: 0.2, flexShrink: 0 }}
            />
            <Typography
              sx={{ fontSize: 12, color: "#0078D4", lineHeight: 1.5 }}
            >
              <strong>{complianceAuthority?.Title}</strong> is both the
              Compliance Authority and Release Authority for this CR. This
              single approval covers both compliance verification and final
              publishing approval.
            </Typography>
          </Box>
        )}

        {cr?.DraftDocumentUrl ? (
          <Box
            component="a"
            href={`${cr.DraftDocumentUrl}?web=1`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: "6px",
              border: "1px solid #E1DFDD",
              backgroundColor: "#fff",
              color: "#0078D4",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.15s",
              "&:hover": { backgroundColor: "#EFF6FC", borderColor: "#0078D4" },
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
            <Box
              flex={1}
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {willPublish ? "Document for Publishing" : "Draft Document"}
            </Box>
            <OpenInNewIcon sx={{ fontSize: 14, color: "#A19F9D" }} />
          </Box>
        ) : (
          draftFiles.length > 0 && (
            <Box
              component="a"
              href={`${draftFiles[0].ServerRelativeUrl}?web=1`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: "6px",
                border: "1px solid #E1DFDD",
                backgroundColor: "#fff",
                color: "#0078D4",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.15s",
                "&:hover": { backgroundColor: "#EFF6FC", borderColor: "#0078D4" },
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
              <Box
                flex={1}
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {draftFiles[0].Name}
              </Box>
              <OpenInNewIcon sx={{ fontSize: 14, color: "#A19F9D" }} />
            </Box>
          )
        )}

        {/* ── COA editable settings (override authority) ── */}
        {isCoaTask && (
          <>
            {coaMissingFields.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  backgroundColor: "#FFF9EC",
                  border: "0.5px solid #F5C842",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 1.25,
                }}
              >
                <WarningAmberIcon
                  sx={{ fontSize: 14, color: "#835B00", mt: 0.25, flexShrink: 0 }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#603D00",
                      lineHeight: 1.4,
                    }}
                  >
                    {coaMissingFields.length} field
                    {coaMissingFields.length > 1 ? "s" : ""} required
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#835B00",
                      mt: 0.25,
                      lineHeight: 1.5,
                    }}
                  >
                    {coaMissingFields.join(", ")}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Version number + Document number */}
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: "#A19F9D",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 1,
              }}
            >
              Review settings
            </Typography>
            <Box sx={{ border: "0.5px solid #EDEBE9", borderRadius: "8px", p: 1.5 }}>
              <FieldLabel>Version number</FieldLabel>
              {parsedPrev && (
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: 11, color: "#A19F9D", mb: 0.75 }}>
                    Previously: {previousVersion}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box
                      component="button"
                      onClick={() => {
                        setVersionIncrement("minor");
                        setManualVersionEdit(false);
                      }}
                      sx={{
                        flex: 1,
                        textAlign: "left",
                        py: 1,
                        px: 1.5,
                        borderRadius: "6px",
                        border: `1.5px solid ${
                          !manualVersionEdit && versionIncrement === "minor"
                            ? "#0F4C81"
                            : "#E1DFDD"
                        }`,
                        backgroundColor:
                          !manualVersionEdit && versionIncrement === "minor"
                            ? "#EFF6FC"
                            : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 600, color: "#323130" }}
                      >
                        Minor update
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, color: "#605E5C", mt: 0.25 }}
                      >
                        → {suggestedMinor}
                      </Typography>
                    </Box>
                    <Box
                      component="button"
                      onClick={() => {
                        setVersionIncrement("major");
                        setManualVersionEdit(false);
                      }}
                      sx={{
                        flex: 1,
                        textAlign: "left",
                        py: 1,
                        px: 1.5,
                        borderRadius: "6px",
                        border: `1.5px solid ${
                          !manualVersionEdit && versionIncrement === "major"
                            ? "#0F4C81"
                            : "#E1DFDD"
                        }`,
                        backgroundColor:
                          !manualVersionEdit && versionIncrement === "major"
                            ? "#EFF6FC"
                            : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 600, color: "#323130" }}
                      >
                        Major update
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, color: "#605E5C", mt: 0.25 }}
                      >
                        → {suggestedMajor}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              {parsedPrev && !manualVersionEdit ? (
                <Box
                  component="button"
                  onClick={() => setManualVersionEdit(true)}
                  sx={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "#0078D4",
                    fontSize: 11,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Enter custom version
                </Box>
              ) : (
                <TextField
                  size="small"
                  fullWidth
                  inputMode="decimal"
                  value={versionNumber}
                  onChange={(e) =>
                    setVersionNumber(sanitizeVersionInput(e.target.value))
                  }
                  placeholder="e.g. 1.0"
                  sx={{ "& input": { fontSize: 13 } }}
                />
              )}
              {versionMismatch && (
                <Typography sx={{ fontSize: 11, color: "#835B00", mt: 0.5 }}>
                  Doesn&apos;t match a standard minor or major bump from {previousVersion} — confirm this is intentional.
                </Typography>
              )}

              <Divider sx={{ my: 1.25, borderColor: "#EDEBE9" }} />

              <Box>
                <FieldLabel>Document number</FieldLabel>
                {cr?.DocumentNumber ? (
                  <Typography
                    sx={{ fontSize: 13, color: "#323130", py: "8.5px" }}
                  >
                    {cr.DocumentNumber}
                  </Typography>
                ) : (
                  <TextField
                    size="small"
                    fullWidth
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Assign a document number"
                    sx={{ "& input": { fontSize: 13 } }}
                  />
                )}
              </Box>
            </Box>

            {/* Review Period */}
            <Box>
              <FieldLabel>Review period</FieldLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={reviewPeriod}
                  displayEmpty
                  onChange={(e) => setReviewPeriod(e.target.value as number)}
                  sx={{ fontSize: 13 }}
                  renderValue={(v) =>
                    v === "" ? (
                      <Typography sx={{ fontSize: 13, color: "#A19F9D" }}>
                        Select period
                      </Typography>
                    ) : (
                      REVIEW_PERIOD_OPTIONS.find((o) => o.value === v)?.label
                    )
                  }
                >
                  {REVIEW_PERIOD_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontSize: 13 }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Download Format */}
            <Box>
              <FieldLabel>Download format</FieldLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={downloadFormat}
                  displayEmpty
                  onChange={(e) =>
                    setDownloadFormat(
                      e.target.value as "PDF" | "Original" | "",
                    )
                  }
                  sx={{ fontSize: 13 }}
                  renderValue={(v) =>
                    !v ? (
                      <Typography sx={{ fontSize: 13, color: "#A19F9D" }}>
                        Select format
                      </Typography>
                    ) : v === "Original" ? (
                      "Original (Word)"
                    ) : (
                      "PDF"
                    )
                  }
                >
                  <MenuItem value="PDF" sx={{ fontSize: 13 }}>
                    PDF
                  </MenuItem>
                  <MenuItem value="Original" sx={{ fontSize: 13 }}>
                    Original (Word)
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ borderColor: "#EDEBE9" }} />

            {/* Read Acknowledgement */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 500, color: "#323130" }}
                  >
                    Read acknowledgement
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#A19F9D", mt: 0.25 }}>
                    Require employees to confirm they've read this document
                  </Typography>
                </Box>
                <Switch
                  checked={readAcknowledgementRequired}
                  onChange={(e) => {
                    setReadAcknowledgementRequired(e.target.checked);
                    if (!e.target.checked) {
                      setReadAudienceIds([]);
                      setReadDueDate("");
                    }
                  }}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    mt: 0.25,
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#0F4C81" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#0F4C81",
                    },
                  }}
                />
              </Box>

              {readAcknowledgementRequired && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    mt: 1.5,
                    pt: 1.5,
                    borderTop: "0.5px solid #EDEBE9",
                  }}
                >
                  <Box>
                    <FieldLabel>Audience</FieldLabel>
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={readAudienceIds}
                        displayEmpty
                        onChange={(e) =>
                          setReadAudienceIds(e.target.value as number[])
                        }
                        disabled={audienceGroupsLoading}
                        renderValue={(selected) =>
                          (selected as number[]).length === 0 ? (
                            <Typography
                              sx={{ fontSize: 13, color: "#A19F9D" }}
                            >
                              Select audience
                            </Typography>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {(selected as number[]).map((id) => (
                                <Chip
                                  key={id}
                                  label={
                                    audienceGroups.find((g) => g.Id === id)
                                      ?.Title ?? id
                                  }
                                  size="small"
                                  sx={{
                                    fontSize: 11,
                                    height: 20,
                                    backgroundColor: "#EFF6FC",
                                    color: "#0078D4",
                                  }}
                                />
                              ))}
                            </Box>
                          )
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {audienceGroupsLoading ? (
                          <MenuItem disabled sx={{ display: "flex", gap: 1 }}>
                            <CircularProgress size={14} />
                            <Typography sx={{ fontSize: 13 }}>
                              Loading...
                            </Typography>
                          </MenuItem>
                        ) : (
                          audienceGroups.map((g) => (
                            <MenuItem
                              key={g.Id}
                              value={g.Id}
                              sx={{ fontSize: 13 }}
                            >
                              <Checkbox
                                checked={readAudienceIds.includes(g.Id)}
                                size="small"
                                sx={{ p: 0, mr: 1 }}
                              />
                              <ListItemText
                                primary={g.Title}
                                primaryTypographyProps={{ fontSize: 13 }}
                              />
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <FieldLabel optional>Due date</FieldLabel>
                    <TextField
                      type="date"
                      size="small"
                      fullWidth
                      value={readDueDate}
                      onChange={(e) => setReadDueDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      sx={{ "& input": { fontSize: 13 } }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: "#EDEBE9" }} />
          </>
        )}

        {/* ── Review Period (read-only summary, RA-only / no COA fields) ── */}
        {showReviewPeriod && !isCoaTask && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.5,
              py: 1.25,
              backgroundColor: "#F9F9F9",
              border: "1px solid #EDEBE9",
              borderRadius: "6px",
            }}
          >
            <EventRepeatIcon
              sx={{ fontSize: 16, color: "#A19F9D", flexShrink: 0 }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#A19F9D",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                }}
              >
                Review Period
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: cr?.ReviewPeriod ? "#323130" : "#A19F9D",
                  mt: 0.25,
                }}
              >
                {getReviewPeriodLabel(cr?.ReviewPeriod)}
              </Typography>
            </Box>
          </Box>
        )}

        </Box>

        <Box
          sx={{
            borderTop: "0.5px solid #EDEBE9",
            px: 2,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {/* ── Actions ── */}
        <ActionButton
          label={verifyButtonLabel}
          icon={verifyButtonIcon}
          onClick={() => setOpenModal("verify")}
          variant="verify"
          disabled={!canVerify}
        />
        <Box
          component="button"
          onClick={() => setOpenModal("reject")}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            width: "100%",
            py: 0.875,
            px: 1,
            borderRadius: "6px",
            border: "1px solid #D13438",
            backgroundColor: "#fff",
            color: "#A4262C",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
            "&:hover": { backgroundColor: "#FDE7E9" },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
          Reject
        </Box>
        </Box>
      </Box>

      {/* ── Verify / Approve Modal ── */}
      <Dialog
        open={openModal === "verify"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          {verifyModalTitle}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {verifyModalBody} {!willPublish && <strong>{task.Title}</strong>}
          </Typography>
          {willPublish && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                backgroundColor: "#F0FDF4",
                borderRadius: "6px",
                border: "1px solid #BBF7D0",
              }}
            >
              <Typography
                sx={{ fontSize: 12, fontWeight: 600, color: "#16A34A", mb: 0.25 }}
              >
                Document
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#323130" }}>
                {cr?.DraftDocumentName ?? task.Title}
              </Typography>
            </Box>
          )}

          {/* COA override summary */}
          {isCoaTask && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                p: 1.5,
                backgroundColor: "#F9F9F9",
                borderRadius: "6px",
                border: "1px solid #EDEBE9",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                  Version number
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}
                >
                  {versionNumber || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                  Document number
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}
                >
                  {documentNumber || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                  Review period
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}
                >
                  {getReviewPeriodLabel(
                    typeof reviewPeriod === "number" ? reviewPeriod : undefined,
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                  Download format
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}
                >
                  {downloadFormat === "Original" ? "Original (Word)" : "PDF"}
                </Typography>
              </Box>
              {readAcknowledgementRequired && (
                <Box
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                    Audience
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}
                  >
                    {selectedAudienceLabels || "—"}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Review period summary in modal for RA/publishing (read-only) */}
          {showReviewPeriod && !isCoaTask && cr?.ReviewPeriod && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                backgroundColor: "#F9F9F9",
                borderRadius: "6px",
                border: "1px solid #EDEBE9",
              }}
            >
              <Typography
                sx={{ fontSize: 12, fontWeight: 600, color: "#605E5C", mb: 0.25 }}
              >
                Review Period
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#323130" }}>
                {getReviewPeriodLabel(cr.ReviewPeriod)}
              </Typography>
            </Box>
          )}

          <TextField
            label="Comments (optional)"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              willPublish
                ? "Add any publishing notes..."
                : "Add any comments..."
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            variant="contained"
            disableElevation
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                verifyButtonIcon
              )
            }
            sx={{
              backgroundColor: "#107C10",
              "&:hover": { backgroundColor: "#0B6A0B" },
            }}
          >
            {submitting ? submittingLabel : confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject Modal ── */}
      <Dialog
        open={openModal === "reject"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          {willPublish
            ? "Reject for Publishing"
            : `Reject — ${roleLabel} Review`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {willPublish
              ? "The document will be sent back for revision. Please provide a clear rejection reason for the Change Authority."
              : `You are rejecting: `}
            {!willPublish && <strong>{task.Title}</strong>}
          </Typography>
          <TextField
            label="Rejection Reason *"
            multiline
            rows={4}
            fullWidth
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={
              willPublish
                ? "Explain why the document is not ready for publishing..."
                : "Explain what doesn't meet requirements..."
            }
          />
          <TextField
            label="Additional Comments (optional)"
            multiline
            rows={2}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any additional context..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disableElevation
            disabled={!rejectionReason.trim() || submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CloseIcon />
              )
            }
          >
            {submitting ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VerifyReviewTask;