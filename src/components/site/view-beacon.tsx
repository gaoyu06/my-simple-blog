"use client";

import { useEffect } from "react";

export function ViewBeacon({ id }: { id: string }) {
  useEffect(() => {
    fetch("/api/views", { method: "POST", body: id, keepalive: true }).catch(() => {});
  }, [id]);
  return null;
}
