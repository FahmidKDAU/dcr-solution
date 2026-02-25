import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Task } from "../../../shared/types/Task";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import { Document } from "../../../shared/types/Document";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import SharePointService from "../../../shared/services/SharePointService";
import { PeoplePicker } from "../../dcrForm/components/PeoplePicker";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskDetailProps {
  cr: IChangeRequest | null;
  crLoading: boolean;
  onCRUpdate: () => void;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; dot: string }
> = {
  Submitted: { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "CA Review": { bg: "#FFF4CE", color: "#835B00", dot: "#FFB900" },
  Approved: { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  "Document Creation": { bg: "#F0E6FF", color: "#5C2D91", dot: "#8764B8" },
  "Document Review": { bg: "#FFF4CE", color: "#835B00", dot: "#FFB900" },
  Published: { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  Rejected: { bg: "#FDE7E9", color: "#A4262C", dot: "#D13438" },
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status)
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  const s = STATUS_STYLES[status] ?? {
    bg: "#F3F2F1",
    color: "#605E5C",
    dot: "#A19F9D",
  };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
        px: "10px",
        py: "3px",
        borderRadius: "20px",
        letterSpacing: 0.3,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: s.dot,
        }}
      />
      {status}
    </Box>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#0078D4",
  "#107C10",
  "#5C2D91",
  "#D83B01",
  "#008575",
  "#C239B3",
];

const getColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Avatar = ({ name, size = 26 }: { name: string; size?: number }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: getColor(name),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.36,
      fontWeight: 600,
      color: "#fff",
      flexShrink: 0,
    }}
  >
    {getInitials(name)}
  </Box>
);

// ─── Inline Field ─────────────────────────────────────────────────────────────

interface InlineFieldProps {
  label: string;
  value: string | undefined | null;
  onSave: (val: string) => Promise<void>;
  type?: "text" | "select" | "textarea" | "date";
  options?: string[];
  required?: boolean;
  saving?: boolean;
  renderValue?: (val: string | undefined | null) => React.ReactNode;
  placeholder?: string;
}

const InlineField = ({
  label,
  value,
  onSave,
  type = "text",
  options = [],
  required = false,
  saving = false,
  renderValue,
  placeholder = "None",
}: InlineFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<
    HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement
  >(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    setEditing(false);
    if (draft !== (value ?? "")) await onSave(draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") commit();
    if (e.key === "Escape") {
      setDraft(value ?? "");
      setEditing(false);
    }
  };

  const isEmpty = !value && value !== "0";
  const isRequired = required && isEmpty;

  const displayContent = renderValue ? (
    renderValue(value)
  ) : isEmpty ? (
    <Typography variant="body2" color="text.disabled">
      {placeholder}
    </Typography>
  ) : (
    <Typography variant="body2" color="text.primary">
      {value}
    </Typography>
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        alignItems: "start",
        py: "5px",
        gap: 1,
      }}
    >
      {/* Label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pt: "6px" }}>
        <Typography
          variant="caption"
          sx={{ color: "#605E5C", fontWeight: 500, fontSize: 13 }}
        >
          {label}
        </Typography>
        {required && (
          <Typography
            component="span"
            sx={{ color: "#D13438", fontSize: 11, lineHeight: 1 }}
          >
            *
          </Typography>
        )}
      </Box>

      {/* Value */}
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (!editing) setEditing(true);
        }}
        sx={{
          borderRadius: "4px",
          cursor: "pointer",
          transition: "background 0.12s, border-color 0.12s",
       backgroundColor: editing
  ? "#fff"
  : hovered
    ? "#F3F2F1"
    : isRequired
      ? "#FDE7E9"
      : "transparent",
border: "2px solid",
borderColor: editing ? "#0078D4" : "transparent",
          px: "8px",
          py: "4px",
          minHeight: 32,
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        {editing ? (
          type === "select" ? (
            <Box
              component="select"
              ref={inputRef}
              value={draft}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDraft(e.target.value)
              }
              onBlur={commit}
              onKeyDown={handleKeyDown}
              sx={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: "text.primary",
                width: "100%",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <option value="">None</option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Box>
          ) : type === "textarea" ? (
            <Box
              component="textarea"
              ref={inputRef}
              value={draft}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDraft(e.target.value)
              }
              onBlur={commit}
              onKeyDown={handleKeyDown}
              rows={3}
              sx={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: "text.primary",
                width: "100%",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
            />
          ) : (
            <Box
              component="input"
              ref={inputRef}
              type={type}
              value={draft}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDraft(e.target.value)
              }
              onBlur={commit}
              onKeyDown={handleKeyDown}
              sx={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: "text.primary",
                width: "100%",
                fontFamily: "inherit",
              }}
            />
          )
        ) : (
          <Box sx={{ width: "100%", lineHeight: 1.5 }}>
            {displayContent}
            {isRequired && (
              <Typography
                variant="caption"
                color="error"
                display="block"
                sx={{ fontSize: 11, mt: 0.25 }}
              >
                Required to complete this task
              </Typography>
            )}
          </Box>
        )}

        {/* Saving indicator */}
        {saving && !editing && (
          <CircularProgress
            size={12}
            sx={{ position: "absolute", right: 8, color: "#0078D4" }}
          />
        )}
        {/* Saved flash */}
      </Box>
    </Box>
  );
};

// ─── Person Field — inline editable via PeoplePicker ─────────────────────────

interface PersonFieldProps {
  label: string;
  person: SharePointPerson | undefined | null;
  onSave: (person: SharePointPerson | undefined) => Promise<void>;
  required?: boolean;
  saving?: boolean;
}

const PersonField = ({
  label,
  person,
  onSave,
  required = false,
  saving = false,
}: PersonFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isEmpty = !person;
  const isRequired = required && isEmpty;

  const handleChange = async (selected: SharePointPerson | undefined) => {
    setEditing(false);
    await onSave(selected);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        alignItems: "start",
        py: "5px",
        gap: 1,
      }}
    >
      {/* Label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pt: "6px" }}>
        <Typography
          variant="caption"
          sx={{ color: "#605E5C", fontWeight: 500, fontSize: 13 }}
        >
          {label}
        </Typography>
        {required && (
          <Typography
            component="span"
            sx={{ color: "#D13438", fontSize: 11, lineHeight: 1 }}
          >
            *
          </Typography>
        )}
      </Box>

      {/* Value / Editor */}
      {editing ? (
        <Box sx={{ py: "2px" }}>
          <PeoplePicker
            label=""
            value={person ?? undefined}
            onChange={handleChange}
          />
        </Box>
      ) : (
        <Box
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setEditing(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: "8px",
            py: "4px",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background 0.12s, border-color 0.12s",
            backgroundColor: hovered ? "#F3F2F1" : "transparent",
            border: "2px solid",
            borderColor: isRequired ? "#D13438" : "transparent",
            minHeight: 32,
            position: "relative",
          }}
        >
          {person ? (
            <>
              <Avatar name={person.Title} size={22} />
              <Typography variant="body2" color="text.primary">
                {person.Title}
              </Typography>
            </>
          ) : (
            <Typography
              variant="body2"
              color={isRequired ? "error" : "text.disabled"}
            >
              {isRequired ? "Required — assign before completing" : "None"}
            </Typography>
          )}
          {isRequired && (
            <Typography
              variant="caption"
              color="error"
              display="block"
              sx={{ fontSize: 11, mt: 0.25, gridColumn: "2" }}
            >
              Required to complete this task
            </Typography>
          )}
          {saving && (
            <CircularProgress
              size={12}
              sx={{ position: "absolute", right: 8, color: "#0078D4" }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

// ─── Multi Person Field — add/remove people ───────────────────────────────────

interface MultiPersonFieldProps {
  label: string;
  people: SharePointPerson[] | undefined;
  onSave: (people: SharePointPerson[]) => Promise<void>;
  saving?: boolean;
}

const MultiPersonField = ({
  label,
  people = [],
  onSave,
  saving = false,
}: MultiPersonFieldProps) => {
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAdd = async (person: SharePointPerson | undefined) => {
    setAdding(false);
    if (!person) return;
    const alreadyAdded = people.some((p) => p.Id === person.Id);
    if (alreadyAdded) return;
    await onSave([...people, person]);
  };

  const handleRemove = async (id: number) => {
    await onSave(people.filter((p) => p.Id !== id));
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        alignItems: "start",
        py: "5px",
        gap: 1,
      }}
    >
      {/* Label */}
      <Typography
        variant="caption"
        sx={{ color: "#605E5C", fontWeight: 500, fontSize: 13, pt: "6px" }}
      >
        {label}
      </Typography>

      {/* People chips + add */}
      <Box sx={{ px: "8px", py: "4px", minHeight: 32 }}>
        {/* Existing people */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            mb: people.length > 0 ? 1 : 0,
          }}
        >
          {people.map((person) => (
            <Box
              key={person.Id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                backgroundColor: "#F3F2F1",
                borderRadius: "4px",
                pl: 0.75,
                pr: 0.5,
                py: 0.25,
              }}
            >
              <Avatar name={person.Title} size={18} />
              <Typography
                variant="caption"
                sx={{ fontSize: 12, color: "#323130" }}
              >
                {person.Title}
              </Typography>
              {/* Remove button */}
              <Box
                component="button"
                onClick={() => handleRemove(person.Id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#A19F9D",
                  fontSize: 14,
                  lineHeight: 1,
                  p: 0,
                  "&:hover": { backgroundColor: "#EDEBE9", color: "#323130" },
                }}
              >
                ×
              </Box>
            </Box>
          ))}
        </Box>

        {/* Add person */}
        {adding ? (
          <Box sx={{ maxWidth: 280 }}>
            <PeoplePicker label="" value={undefined} onChange={handleAdd} />
          </Box>
        ) : (
          <Box
            component="button"
            onClick={() => setAdding(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: hovered ? "#0078D4" : "#A19F9D",
              fontSize: 12,
              fontWeight: 500,
              p: 0,
              transition: "color 0.15s",
            }}
          >
            <Typography sx={{ fontSize: 16, lineHeight: 1, color: "inherit" }}>
              +
            </Typography>
            Add person
          </Box>
        )}
        {saving && (
          <CircularProgress size={12} sx={{ ml: 1, color: "#0078D4" }} />
        )}
      </Box>
    </Box>
  );
};

// ─── Section ─────────────────────────────────────────────────────────────────

const Section = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box>
      <Box
        component="button"
        onClick={() => setOpen(!open)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          background: "none",
          border: "none",
          cursor: "pointer",
          py: 1.25,
          px: 0,
          width: "100%",
          textAlign: "left",
          "&:hover .section-title": { color: "#0078D4" },
        }}
      >
        <ExpandMoreIcon
          sx={{
            fontSize: 18,
            color: "#605E5C",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
          }}
        />
        <Typography
          className="section-title"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "#323130",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            transition: "color 0.15s",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />
      {open && <Box pb={1.5}>{children}</Box>}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const TaskDetail = ({ cr, crLoading, onCRUpdate }: TaskDetailProps) => {
  const [tab, setTab] = useState(0);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [publishedDoc, setPublishedDoc] = useState<Document | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Fetch published doc when CR loads
  useEffect(() => {
    if (!cr?.TargetDocumentId) return;
    setDocLoading(true);
    setPublishedDoc(null);
    SharePointService.getDocumentById(cr.TargetDocumentId)
      .then(setPublishedDoc)
      .catch(console.error)
      .finally(() => setDocLoading(false));
  }, [cr?.TargetDocumentId]);

  // Reset tab when cr changes
  useEffect(() => {
    setTab(0);
  }, [cr?.ID]);

  // Auto-save — text/select fields
  const handleFieldSave = async (spFieldName: string, value: string) => {
    if (!cr) return;
    setSavingField(spFieldName);
    try {
      await SharePointService.updateChangeRequest(cr.ID, {
        [spFieldName]: value || null,
      });
      setSavedField(spFieldName);
      setTimeout(() => setSavedField(null), 2000);
      onCRUpdate();
    } catch (err) {
      console.error(`Failed to save ${spFieldName}:`, err);
    } finally {
      setSavingField(null);
    }
  };

  // Auto-save — single person fields (e.g. ReleaseAuthorityId)
  const handlePersonSave = async (
    spFieldName: string,
    person: SharePointPerson | undefined,
  ) => {
    if (!cr) return;
    setSavingField(spFieldName);
    try {
      console.log("Saving:", spFieldName, person?.Id);

      await SharePointService.updateChangeRequest(cr.ID, {
        [spFieldName]: person?.Id ?? null,
      });
      onCRUpdate();
    } catch (err) {
      console.error(`Failed to save ${spFieldName}:`, err);
    } finally {
      setSavingField(null);
    }
  };

  // Auto-save — multi-person fields (e.g. ReviewersId)
  const handleMultiPersonSave = async (
    spFieldName: string,
    people: SharePointPerson[],
    useResultsWrapper = true,
  ) => {
    if (!cr) return;
    setSavingField(spFieldName);
    try {
      const ids = people.map((p) => p.Id);
      const value = useResultsWrapper ? { results: ids } : ids;
      await SharePointService.updateChangeRequest(cr.ID, {
        [spFieldName]: value,
      });
      onCRUpdate();
    } catch (err) {
      console.error(`Failed to save ${spFieldName}:`, err);
    } finally {
      setSavingField(null);
    }
  };
  // ── Empty / Loading state ──
  if (crLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!cr) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        flexDirection="column"
        gap={1}
      >
        <Typography variant="h6" color="text.secondary">
          No change request found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          CR details will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      sx={{ backgroundColor: "#FAFAFA" }}
    >
      {/* ── CR Header Card ── */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #EDEBE9",
          px: 3,
          py: 2.5,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.75}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A19F9D",
              letterSpacing: 0.8,
            }}
          >
            {cr.ChangeRequestNumber ?? `CR-${cr.ID}`}
          </Typography>
          <StatusBadge status={cr.Status} />
        </Box>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: "#323130",
            lineHeight: 1.4,
            mb: 0.5,
          }}
        >
          {cr.Title}
        </Typography>
        {cr.ScopeOfChange && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6, fontSize: 13 }}
          >
            {cr.ScopeOfChange}
          </Typography>
        )}
      </Box>

      {/* ── Tabs ── */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #EDEBE9",
          px: 2,
          minHeight: 40,
          "& .MuiTab-root": { minHeight: 40, fontSize: 13, py: 0 },
        }}
      >
        <Tab label="Details" />
        <Tab
          label={`Attachments${attachments.length > 0 ? ` (${attachments.length})` : ""}`}
        />
        <Tab label="Published Document" />
      </Tabs>

      {/* ── Tab Content ── */}
      <Box flex={1} overflow="auto">
        {/* Tab 0 — Details */}
        {tab === 0 && (
          <Box
            sx={{
              maxWidth: 760,
              px: 3,
              py: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* ── General ── */}
            <Section title="General">
              <InlineField
                label="Title"
                value={cr.Title}
                onSave={(v) => handleFieldSave("Title", v)}
                saving={savingField === "Title"}
              />
              <InlineField
                label="Scope of Change"
                value={cr.ScopeOfChange}
                onSave={(v) => handleFieldSave("ScopeofChange", v)}
                type="textarea"
                saving={savingField === "ScopeofChange"}
              />
              <InlineField
                label="Urgency"
                value={cr.Urgency}
                onSave={(v) => handleFieldSave("Urgency", v)}
                type="select"
                options={["Standard", "Urgent", "Minor"]}
                saving={savingField === "Urgency"}
                renderValue={(v) => {
                  const colors: Record<string, string> = {
                    Urgent: "#A4262C",
                    Minor: "#107C10",
                    Standard: "#605E5C",
                  };
                  return v ? (
                    <Typography
                      variant="body2"
                      sx={{ color: colors[v] ?? "#605E5C", fontWeight: 600 }}
                    >
                      {v}
                    </Typography>
                  ) : null;
                }}
              />
              <InlineField
                label="New Document"
                value={cr.NewDocument ? "Yes" : "No"}
                onSave={() => Promise.resolve()}
                renderValue={(v) => (
                  <Typography variant="body2" color="text.primary">
                    {v}
                  </Typography>
                )}
              />
              <InlineField
                label="Draft Document Name"
                value={cr.DraftDocumentName}
                onSave={(v) => handleFieldSave("DraftDocumentName", v)}
                saving={savingField === "DraftDocumentName"}
                placeholder="Not set"
              />
            </Section>

            {/* ── Document ── */}
            <Section title="Document">
              <InlineField
                label="Classification"
                value={cr.Classification}
                onSave={(v) => handleFieldSave("Classification", v)}
                type="select"
                options={["Public", "Internal", "Confidential", "Restricted"]}
                saving={savingField === "Classification"}
                renderValue={(v) =>
                  v ? (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: "#EFF6FC",
                        color: "#0078D4",
                        fontSize: 12,
                        fontWeight: 600,
                        px: 1.25,
                        py: 0.25,
                        borderRadius: "10px",
                      }}
                    >
                      {v}
                    </Box>
                  ) : null
                }
              />
              <InlineField
                label="Document Type"
                value={cr.DocumentType?.Title}
                onSave={(v) => handleFieldSave("DocumentTypeId", v)}
                type="select"
                options={["Policy", "Procedure", "Work Instruction", "Form"]}
                saving={savingField === "DocumentTypeId"}
              />
              <InlineField
                label="Audience"
                value={cr.Audience?.Title}
                onSave={(v) => handleFieldSave("AudienceId", v)}
                type="select"
                options={[
                  "All Staff",
                  "Management",
                  "Department Specific",
                  "External",
                ]}
                saving={savingField === "AudienceId"}
              />
            </Section>

            {/* ── Department ── */}
            <Section title="Department">
              <InlineField
                label="Core Functionality"
                value={cr.CoreFunctionality?.Title}
                onSave={(v) => handleFieldSave("CoreFunctionalityId", v)}
                saving={savingField === "CoreFunctionalityId"}
                placeholder="Not assigned"
              />
              <InlineField
                label="Business Function"
                value={cr.BusinessFunction?.map((bf) => bf.Title).join(", ")}
                onSave={(v) => handleFieldSave("BusinessFunctionId", v)}
                saving={savingField === "BusinessFunctionId"}
                placeholder="Not assigned"
              />
            </Section>

            {/* ── People ── */}
            <Section title="People">
              <PersonField
                label="Change Authority"
                person={cr.ChangeAuthority}
                onSave={(p) => handlePersonSave("ChangeAuthorityId", p)}
                saving={savingField === "ChangeAuthorityId"}
              />
              <PersonField
                label="Release Authority"
                person={cr.ReleaseAuthority}
                onSave={(p) => handlePersonSave("ReleaseAuthorityId", p)}
                saving={savingField === "ReleaseAuthorityId"}
                required
              />
              <PersonField
                label="Author"
                person={cr.Author0}
                onSave={(p) => handlePersonSave("Author0Id", p)}
                saving={savingField === "Author0Id"}
              />
              <InlineField
                label="Submitted By"
                value={cr.Author?.Title}
                onSave={() => Promise.resolve()}
              />
              <MultiPersonField
                label="Reviewers"
                people={cr.Reviewers}
                onSave={(p) => handleMultiPersonSave("ReviewersId", p, true)}
              />
              <MultiPersonField
                label="Contributors"
                people={cr.Contributors}
                onSave={(p) =>
                  handleMultiPersonSave("ContributorsId", p, false)
                }
              />
            </Section>
          </Box>
        )}

        {/* Tab 1 — Attachments */}
        {tab === 1 && (
          <Box p={3}>
            {attachments.length === 0 ? (
              <Box
                sx={{
                  border: "1px dashed #D2D0CE",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                }}
              >
                <AttachFileIcon
                  sx={{ color: "#C8C6C4", fontSize: 32, mb: 1 }}
                />
                <Typography color="text.secondary" fontSize={13}>
                  No attachments
                </Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={1}>
                {attachments.map((file) => (
                  <Box
                    key={file.FileName}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.5,
                      px: 2,
                      backgroundColor: "#fff",
                      border: "1px solid #EDEBE9",
                      borderRadius: 1,
                      "&:hover": { backgroundColor: "#F3F2F1" },
                    }}
                  >
                    <AttachFileIcon
                      fontSize="small"
                      sx={{ color: "text.disabled" }}
                    />
                    <Typography variant="body2" flex={1}>
                      {file.FileName}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      href={file.ServerRelativeUrl}
                      target="_blank"
                    >
                      Open
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Tab 2 — Published Document */}
        {tab === 2 && (
          <Box display="flex" flexDirection="column" height="100%">
            {docLoading && (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!docLoading && !publishedDoc && (
              <Box p={3}>
                <Typography color="text.secondary" fontSize={13}>
                  No published document linked to this change request.
                </Typography>
              </Box>
            )}
            {!docLoading && publishedDoc?.FileRef && (
              <iframe
                src={publishedDoc.FileRef}
                style={{
                  flex: 1,
                  border: "none",
                  width: "100%",
                  height: "100%",
                }}
                title="Published Document"
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
