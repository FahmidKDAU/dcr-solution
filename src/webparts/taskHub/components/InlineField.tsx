import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

// ─── Inline Field Component ───────────────────────────────────────────────────

export interface InlineFieldProps {
  label: string;
  value: string | undefined | null;
  onSave: (val: string) => Promise<void>;
  type?: "text" | "select" | "textarea" | "date";
  options?: string[];
  required?: boolean;
  saving?: boolean;
  renderValue?: (val: string | undefined | null) => React.ReactNode;
  placeholder?: string;
  editMode?: "read" | "edit";
}

export const InlineField = ({
  label,
  value,
  onSave,
  type = "text",
  options = [],
  required = false,
  saving = false,
  renderValue,
  placeholder = "None",
  editMode = "edit",
}: InlineFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<
    HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement
  >(null);

  const isReadOnly = editMode === "read";

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
  const isRequired = required && isEmpty && !isReadOnly;

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
        {required && !isReadOnly && (
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
        onMouseEnter={() => !isReadOnly && setHovered(true)}
        onMouseLeave={() => !isReadOnly && setHovered(false)}
        onClick={() => {
          if (!editing && !isReadOnly) setEditing(true);
        }}
        sx={{
          borderRadius: "4px",
          cursor: isReadOnly ? "default" : "pointer",
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
        {editing && !isReadOnly ? (
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
      </Box>
    </Box>
  );
};
