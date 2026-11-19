"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Manually chosen cover. Empty means the article has no cover. */
export function CoverField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? `上传失败（${res.status}）`);
      onChange(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="cover">封面</Label>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="aspect-[16/9] w-full rounded-[var(--radius-sm)] object-cover shadow-[inset_0_0_0_1px_var(--color-border)]"
        />
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          loading={uploading}
          leftIcon={<ImagePlus className="h-3.5 w-3.5" />}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "更换图片" : "上传图片"}
        </Button>
        {value ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => onChange("")}
          >
            移除
          </Button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>
      <Input
        id="cover"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="或填写图片地址，如 /uploads/…"
      />
    </div>
  );
}
