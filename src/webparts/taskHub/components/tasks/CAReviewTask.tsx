// src/webparts/taskHub/components/tasks/CAReviewTask.tsx
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
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import { LookupFieldItem } from "../../../../shared/types/LookupFieldItem";
import SharePointService from "../../../../shared/services/SharePointService";
import { REVIEW_PERIOD_OPTIONS } from "../../../../shared/constants";

// ─── Required fields ──────────────────────────────────────────────────────────

const REQUIRED_FIELDS: { field: keyof IChangeRequest; label: string }[] = [
  { field: "ReleaseAuthority", label: "Release authority" },
  { field: "Author0", label: "Document author" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CAReviewTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

type ModalType = "complete" | "minor_change" | "obsolete" | null;

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

// ─── Main Component ───────────────────────────────────────────────────────────

const CAReviewTask = ({ task, cr, onTaskComplete }: CAReviewTaskProps) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewPeriod, setReviewPeriod] = useState<string | number>(
    cr?.ReviewPeriod ?? "",
  );
  const [downloadFormat, setDownloadFormat] = useState<"PDF" | "Original" | "">(
    cr?.DownloadFormat ?? "",
  );
  const [versionNumber, setVersionNumber] = useState(
    cr?.VersionNumber ?? (cr?.NewDocument ? "1.0" : ""),
  );

  // ── Read acknowledgement state ──
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
    setAudienceGroupsLoading(true);
    SharePointService.getAudienceGroups()
      .then(setAudienceGroups)
      .catch(console.error)
      .finally(() => setAudienceGroupsLoading(false));
  }, []);

  // ── Validation ──
  const missingFields = cr
    ? REQUIRED_FIELDS.filter(({ field }) => !cr[field])
    : REQUIRED_FIELDS;

  const canComplete =
    missingFields.length === 0 &&
    reviewPeriod !== "" &&
    downloadFormat !== "" &&
    versionNumber !== "" &&
    (!readAcknowledgementRequired || readAudienceIds.length > 0);

  const isNewDocument = cr?.NewDocument ?? false;

  // ── Warning list ──
  const warningFields = [
    ...missingFields.map((f) => f.label),
    ...(reviewPeriod === "" ? ["review period"] : []),
    ...(downloadFormat === "" ? ["download format"] : []),
    ...(versionNumber === "" ? ["version number"] : []),
    ...(readAcknowledgementRequired && readAudienceIds.length === 0
      ? ["audience"]
      : []),
  ];

  const handleClose = () => {
    setOpenModal(null);
    setComment("");
  };

  const handleComplete = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateChangeRequest(cr!.ID, {
        ReviewPeriod: reviewPeriod,
        DownloadFormat: downloadFormat,
        VersionNumber: versionNumber,
        ReadAcknowledgementRequired: readAcknowledgementRequired,
        ReadDueDate:
          readAcknowledgementRequired && readDueDate ? readDueDate : null,
ReadAudienceGroupsId: readAcknowledgementRequired && readAudienceIds.length > 0
  ? readAudienceIds
  : [],
      });
      await SharePointService.updateTask(task.Id, {
        Status: "Approved",
        Comments: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error completing review task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMinorChange = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Marked as Minor Change",
        Comments: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error marking as minor change:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleObsolete = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: "Marked for Document Obsoletion",
        Comments: comment || undefined,
      });
      handleClose();
      onTaskComplete?.();
    } catch (error) {
      console.error("Error marking for obsoletion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAudienceLabels = audienceGroups
    .filter((g) => readAudienceIds.includes(g.Id))
    .map((g) => g.Title)
    .join(", ");

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* ── Warning ── */}
        {warningFields.length > 0 && (
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
                {warningFields.length} field
                {warningFields.length > 1 ? "s" : ""} required
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#835B00",
                  mt: 0.25,
                  lineHeight: 1.5,
                }}
              >
                {warningFields.join(", ")}
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Review Period ── */}
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

        {/* ── Download Format ── */}
        <Box>
          <FieldLabel>Download format</FieldLabel>
          <FormControl fullWidth size="small">
            <Select
              value={downloadFormat}
              displayEmpty
              onChange={(e) =>
                setDownloadFormat(e.target.value as "PDF" | "Original" | "")
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

        {/* ── Document Version ── */}
        <Box>
          <FieldLabel>Version number</FieldLabel>
          <TextField
            fullWidth
            size="small"
            value={versionNumber}
            onChange={(e) => setVersionNumber(e.target.value)}
            placeholder="e.g. 1.0"
            sx={{ "& input": { fontSize: 13 } }}
          />
        </Box>
        {!isNewDocument && cr?.DocumentNumber && (
          <Box>
            <FieldLabel optional>Document number</FieldLabel>
            <Typography sx={{ fontSize: 13, color: "#323130" }}>
              {cr.DocumentNumber}
            </Typography>
          </Box>
        )}

        <Divider sx={{ borderColor: "#EDEBE9" }} />

        {/* ── Read Acknowledgement ── */}
        <Box>
          {/* Toggle row */}
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

          {/* Conditional fields */}
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
                        <Typography sx={{ fontSize: 13, color: "#A19F9D" }}>
                          Select audience
                        </Typography>
                      ) : (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
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
                        <MenuItem key={g.Id} value={g.Id} sx={{ fontSize: 13 }}>
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
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                  sx={{ "& input": { fontSize: 13 } }}
                />
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: "#EDEBE9" }} />

        {/* ── Primary Action ── */}
        <Box
          component="button"
          onClick={() => canComplete && setOpenModal("complete")}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%",
            py: 1.25,
            px: 2,
            borderRadius: "8px",
            border: "none",
            backgroundColor: !canComplete ? "#F3F2F1" : "#0F4C81",
            color: !canComplete ? "#A19F9D" : "#fff",
            fontSize: 13,
            fontWeight: 500,
            cursor: !canComplete ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            "&:hover": canComplete ? { backgroundColor: "#0A3D6B" } : {},
          }}
        >
          <CheckIcon sx={{ fontSize: 15 }} />
          Mark review as complete
        </Box>

        {/* ── Other Actions ── */}
        {!isNewDocument && (
          <Box display="flex" flexDirection="column" gap={0.75}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 500,
                color: "#A19F9D",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Other actions
            </Typography>
            <Box
              component="button"
              onClick={() => setOpenModal("minor_change")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                py: 0.875,
                px: 1.5,
                borderRadius: "8px",
                border: "0.5px solid #EDEBE9",
                backgroundColor: "#fff",
                color: "#323130",
                fontSize: 13,
                fontWeight: 400,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": {
                  backgroundColor: "#F9F9F9",
                  borderColor: "#C8C6C4",
                },
              }}
            >
              <EditNoteIcon sx={{ fontSize: 15, color: "#605E5C" }} />
              Add to minor change register
            </Box>
            <Box
              component="button"
              onClick={() => setOpenModal("obsolete")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                py: 0.875,
                px: 1.5,
                borderRadius: "8px",
                border: "0.5px solid #EDEBE9",
                backgroundColor: "#fff",
                color: "#A4262C",
                fontSize: 13,
                fontWeight: 400,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": {
                  backgroundColor: "#FDF6F6",
                  borderColor: "#F09595",
                },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 15, color: "#A4262C" }} />
              Mark for obsoletion
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Complete Modal ── */}
      <Dialog
        open={openModal === "complete"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 500, pb: 1 }}>
          Complete review
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.75,
                borderBottom: "0.5px solid #F3F2F1",
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                Review period
              </Typography>
              <Typography
                sx={{ fontSize: 12, fontWeight: 500, color: "#323130" }}
              >
                {
                  REVIEW_PERIOD_OPTIONS.find((o) => o.value === reviewPeriod)
                    ?.label
                }
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.75,
                borderBottom: "0.5px solid #F3F2F1",
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                Download format
              </Typography>
              <Typography
                sx={{ fontSize: 12, fontWeight: 500, color: "#323130" }}
              >
                {downloadFormat === "Original" ? "Original (Word)" : "PDF"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.75,
                borderBottom: "0.5px solid #F3F2F1",
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                Version number
              </Typography>
              <Typography
                sx={{ fontSize: 12, fontWeight: 500, color: "#323130" }}
              >
                {versionNumber}
              </Typography>
            </Box>
            {readAcknowledgementRequired && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.75,
                    borderBottom: "0.5px solid #F3F2F1",
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                    Audience
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 500, color: "#323130" }}
                  >
                    {selectedAudienceLabels}
                  </Typography>
                </Box>
                {readDueDate && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 0.75,
                      borderBottom: "0.5px solid #F3F2F1",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
                      Read by
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, fontWeight: 500, color: "#323130" }}
                    >
                      {new Date(readDueDate).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          <TextField
            label="Comments (optional)"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any review notes..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            size="small"
            disabled={submitting}
            sx={{ textTransform: "none", fontSize: 13 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            variant="contained"
            size="small"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <CheckIcon sx={{ fontSize: 14 }} />
              )
            }
            sx={{
              textTransform: "none",
              fontSize: 13,
              backgroundColor: "#0F4C81",
              "&:hover": { backgroundColor: "#0A3D6B" },
            }}
          >
            {submitting ? "Completing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Minor Change Modal ── */}
      <Dialog
        open={openModal === "minor_change"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 500, pb: 1 }}>
          Add to minor change register
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: 13, color: "#605E5C", mb: 2, lineHeight: 1.6 }}
          >
            This change request will be added to the minor change register and
            implemented during the next scheduled review.
          </Typography>
          <TextField
            label="Notes (optional)"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Why is this a minor change?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            size="small"
            disabled={submitting}
            sx={{ textTransform: "none", fontSize: 13 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMinorChange}
            variant="contained"
            size="small"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <EditNoteIcon sx={{ fontSize: 14 }} />
              )
            }
            sx={{
              textTransform: "none",
              fontSize: 13,
              backgroundColor: "#0078D4",
              "&:hover": { backgroundColor: "#006CBE" },
            }}
          >
            {submitting ? "Adding..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Obsolete Modal ── */}
      <Dialog
        open={openModal === "obsolete"}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 500, pb: 1 }}>
          Mark for obsoletion
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: 13, color: "#605E5C", mb: 2, lineHeight: 1.6 }}
          >
            This will start the document obsoletion process. The document will
            be unpublished and archived after approval.
          </Typography>
          <TextField
            label="Reason for obsoletion"
            multiline
            rows={3}
            fullWidth
            size="small"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Why should this document be obsoleted?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            size="small"
            disabled={submitting}
            sx={{ textTransform: "none", fontSize: 13 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleObsolete}
            variant="contained"
            color="error"
            size="small"
            disabled={!comment.trim() || submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              )
            }
            sx={{ textTransform: "none", fontSize: 13 }}
          >
            {submitting ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CAReviewTask;
