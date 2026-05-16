import React from "react";

export interface EditorialProps {
  title: string;
  summary?: string;
  eyebrow?: string;
  background?: string;
  textColor?: string;
  accent?: string;
}

export function Editorial(props: EditorialProps): React.ReactElement {
  const background = props.background ?? "#16110b";
  const textColor = props.textColor ?? "#f4ecd9";
  const accent = props.accent ?? "#c08560";
  const title = (props.title ?? "Untitled").slice(0, 140);
  const summary = (props.summary ?? "").slice(0, 240);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background,
        color: textColor,
        fontFamily: "Hanken Grotesk",
        padding: "64px 80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
        <div style={{ fontSize: 18, letterSpacing: "0.24em", textTransform: "uppercase", opacity: 0.72 }}>
          {props.eyebrow ?? "Editorial"}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontSize: 84,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          lineHeight: 1.02,
        }}
      >
        {title}
      </div>
      {summary ? (
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 22,
            opacity: 0.7,
            lineHeight: 1.45,
            maxWidth: "88%",
          }}
        >
          {summary}
        </div>
      ) : null}
      <div style={{ display: "flex", marginTop: 36, height: 1, background: textColor, opacity: 0.18 }} />
    </div>
  );
}
