export const REVIEW_PERIOD_OPTIONS = [
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "12 months", value: 12 },
  { label: "18 months", value: 18 },
  { label: "24 months", value: 24 },
  { label: "36 months", value: 36 },
];

export const getReviewPeriodLabel = (value?: number): string => {
  if (!value) return "Not set";

  return (
    REVIEW_PERIOD_OPTIONS.find((option) => option.value === value)?.label ??
    `${value} months`
  );
};