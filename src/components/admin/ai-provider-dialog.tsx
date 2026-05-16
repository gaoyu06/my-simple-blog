"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIProviderForm } from "@/components/admin/ai-provider-form";
import { useT } from "@/components/i18n-provider";

export function AddAIProviderDialog() {
  const { t } = useT();
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button leftIcon={<Plus className="h-4 w-4" />}>{t("admin.ai.add")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.ai.addDialogTitle")}</DialogTitle>
          <DialogDescription>{t("admin.ai.addDialogDesc")}</DialogDescription>
        </DialogHeader>
        <AIProviderForm onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
