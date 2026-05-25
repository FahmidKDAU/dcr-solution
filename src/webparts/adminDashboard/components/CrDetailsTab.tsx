// src/webparts/adminDashboard/components/CRDetailsTab.tsx
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { getAvatarColor, getAvatarInitials } from "../../../shared/utils/avatarUtils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CRDetailsTabProps {
  cr: IChangeRequest;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.6, mt: 2, mb: 1 }}>
    {children}
  </Typography>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "6px 10px", py: 0.75, borderBottom: "1px solid #F3F2F1" }}>
    <Typography sx={{ fontSize: 11, color: "#A19F9D", pt: "1px" }}>{label}</Typography>
    <Box sx={{ fontSize: 12, color: "#323130", lineHeight: 1.5 }}>{children || <Typography sx={{ fontSize: 12, color: "#C8C6C4", fontStyle: "italic" }}>—</Typography>}</Box>
  </Box>
);

const Avatar = ({ name, size = 20 }: { name: string; size?: number }) => (
  <Box sx={{ width: size, height: size, borderRadius: "50%", backgroundColor: getAvatarColor(name), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Typography sx={{ fontSize: size * 0.36, fontWeight: 600, color: "#fff", lineHeight: 1 }}>{getAvatarInitials(name)}</Typography>
  </Box>
);

const PersonField = ({ label, person }: { label: string; person: SharePointPerson | undefined | null }) => (
  <Field label={label}>
    {person?.Title ? (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Avatar name={person.Title} size={18} />
        <Typography sx={{ fontSize: 12, color: "#323130" }}>{person.Title}</Typography>
      </Box>
    ) : null}
  </Field>
);

const ClassificationChip = ({ value }: { value: string }) => {
  const cfg: Record<string, { bg: string; color: string }> = {
    Public:       { bg: "#EFF6FC", color: "#0078D4" },
    Internal:     { bg: "#DFF6DD", color: "#107C10" },
    Confidential: { bg: "#FFF4CE", color: "#835B00" },
    Restricted:   { bg: "#FDE7E9", color: "#A4262C" },
  };
  const c = cfg[value] ?? { bg: "#F3F2F1", color: "#605E5C" };
  return (
    <Box sx={{ display: "inline-block", px: 1, py: 0.25, borderRadius: "10px", backgroundColor: c.bg }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.color }}>{value}</Typography>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CRDetailsTab = ({ cr }: CRDetailsTabProps): React.ReactElement => {
  const reviewPeriodLabel = cr.ReviewPeriod ? `${cr.ReviewPeriod} months` : undefined;

  return (
    <Box sx={{ px: 2, pb: 3 }}>
      <SectionLabel>General</SectionLabel>
      <Field label="Scope">{cr.ScopeofChange}</Field>
      <Field label="Urgency">{cr.Urgency}</Field>
      <Field label="New document">{cr.NewDocument ? "Yes" : "No"}</Field>
      <Field label="Review period">{reviewPeriodLabel}</Field>
      {cr.DraftDocumentName && (
        <Field label="Draft doc name">{cr.DraftDocumentName}</Field>
      )}

      <SectionLabel>Document</SectionLabel>
      <Field label="Classification">
        {cr.Classification ? <ClassificationChip value={cr.Classification} /> : null}
      </Field>
      <Field label="Document type">{cr.DocumentType?.Title}</Field>
      <Field label="Category">
        {cr.Category?.length ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {cr.Category.map((c) => (
              <Box key={c.Id} sx={{ px: 0.75, py: 0.15, backgroundColor: "#F3F2F1", borderRadius: "4px" }}>
                <Typography sx={{ fontSize: 11, color: "#323130" }}>{c.Title}</Typography>
              </Box>
            ))}
          </Box>
        ) : null}
      </Field>
      <Field label="Audience">{cr.Audience?.Title}</Field>
      <Field label="Business function">
        {cr.BusinessFunction?.length ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {cr.BusinessFunction.map((b) => (
              <Box key={b.Id} sx={{ px: 0.75, py: 0.15, backgroundColor: "#F3F2F1", borderRadius: "4px" }}>
                <Typography sx={{ fontSize: 11, color: "#323130" }}>{b.Title}</Typography>
              </Box>
            ))}
          </Box>
        ) : null}
      </Field>

      <SectionLabel>People</SectionLabel>
      <PersonField label="Requestor"    person={cr.Requestor ?? cr.Author0} />
      <PersonField label="Change auth." person={cr.ChangeAuthority} />
      <PersonField label="Author"       person={cr.Author0} />
      <PersonField label="Release auth." person={cr.ReleaseAuthority} />
    </Box>
  );
};

export default CRDetailsTab;