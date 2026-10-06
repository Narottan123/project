"use client";

import React, { useState } from "react";
import { getInitials, getAvatarColor, getProfileImageUrl } from "@/utils/avatarHelper";

export default function UserAvatar({
  src,
  name,
  alt,
  className = "",
  style = {},
  width = 52,
  height = 52,
  ...props
}) {
  const [hasError, setHasError] = useState(!src);
  const firstLetter = getInitials(name);
  const bgColor = getAvatarColor(name);

  if (hasError || !src) {
    return (
      <span
        className={`user-avatar-initial ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: width,
          height: height,
          minWidth: width,
          minHeight: height,
          borderRadius: "50%",
          backgroundColor: bgColor,
          color: "#ffffff",
          fontWeight: 600,
          fontSize: Math.round(Number(width || 40) * 0.45),
          textTransform: "uppercase",
          userSelect: "none",
          ...style,
        }}
        {...props}
      >
        {firstLetter}
      </span>
    );
  }

  return (
    <img
      src={getProfileImageUrl(src, name)}
      alt={alt || firstLetter}
      className={className}
      style={{ objectFit: "cover", borderRadius: "50%", ...style }}
      width={width}
      height={height}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
