import React from "react";

export interface MinimalGradientProps {
  title: string;
  summary?: string;
  eyebrow?: string;
  gradientFrom?: string;
  gradientTo?: string;
  textColor?: string;
}

export function MinimalGradient(props: MinimalGradientProps): React.ReactElement {
  const from = props.gradientFrom ?? "#c08560";
  const to = props.gradientTo ?? "#5a2e18";
  const text = props.textColor ?? "#fbf7ef";
  const title = (props.title ?? "Untitled").slice(0, 140);
  const summary = (props.summary ?? "").slice(0, 220);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "72px 80px",
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        color: text,
        fontFamily: "Hanken Grotesk",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 20,
          opacity: 0.78,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 22,
        }}
      >
        {props.eyebrow ?? "Essay"}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontFamily: "Fraunces",
          fontWeight: 500,
          letterSpacing: "-0.025em",
          lineHeight: 1.04,
          maxWidth: "92%",
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
            opacity: 0.82,
            lineHeight: 1.4,
            maxWidth: "85%",
          }}
        >
          {summary}
        </div>
      ) : null}
    </div>
  );
}
