// src/shared/utils/avatarUtils.ts
// Single source of truth for avatar colours — used by both PeoplePicker and MultiPeoplePicker

const AVATAR_COLORS = [
  "#0F6CBD", // Microsoft blue
  "#107C10", // Microsoft green
  "#5C2D91", // Microsoft purple
  "#C50F1F", // Microsoft red
  "#986F0B", // Microsoft gold
  "#0099BC", // Microsoft teal
];

export const getAvatarColor = (name: string): string =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const getAvatarInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();