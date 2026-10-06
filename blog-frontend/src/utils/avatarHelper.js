/**
 * Avatar Helper Utility for Blog Application
 * Provides initial extraction, color generation, and SVG data URI avatars
 * with the name's first letter for users with missing or broken profile pictures.
 */

export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
};

export const getAvatarColor = (name) => {
  const colors = [
    "#2563EB", // Blue
    "#7C3AED", // Violet
    "#DB2777", // Pink
    "#D97706", // Amber
    "#059669", // Emerald
    "#DC2626", // Red
    "#0284C7", // Sky
    "#4F46E5", // Indigo
    "#0D9488", // Teal
    "#E11D48", // Rose
    "#9333EA", // Purple
    "#16A34A", // Green
  ];
  const charCode = (name || "U").trim().charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

export const getInitialsAvatar = (name, customColor) => {
  const initial = getInitials(name);
  const bgColor = customColor || getAvatarColor(name);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="50" fill="${bgColor}"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="46" font-weight="600">${initial}</text>
  </svg>`;

  let base64 = "";
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    base64 = window.btoa(unescape(encodeURIComponent(svg)));
  } else {
    base64 = Buffer.from(svg, "utf8").toString("base64");
  }

  return `data:image/svg+xml;base64,${base64}`;
};

export const getProfileImageUrl = (profilePicture, name) => {
  if (!profilePicture) {
    return getInitialsAvatar(name);
  }

  const str = String(profilePicture).trim();
  if (!str || str === "undefined" || str === "null") {
    return getInitialsAvatar(name);
  }

  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:")) {
    return str;
  }

  return getInitialsAvatar(name);
};

export const handleImageError = (event, name, customColor) => {
  if (!event || !event.currentTarget) return;
  event.currentTarget.onerror = null;
  event.currentTarget.src = getInitialsAvatar(name, customColor);
};
