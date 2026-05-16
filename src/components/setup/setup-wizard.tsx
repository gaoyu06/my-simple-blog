"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Feather, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import {
  LOCALES,
  LOCALE_LABELS,
  type Locale,
} from "@/components/i18n-provider";
import { completeSetup } from "@/server/actions/setup";

const COLOR_OPTIONS = [
  { value: "pink", label: "Rose", swatch: "oklch(0.74 0.12 8)" },
  { value: "mono", label: "Mono", swatch: "oklch(0.30 0.005 80)" },
  { value: "blue", label: "Blue", swatch: "oklch(0.62 0.14 250)" },
  { value: "green", label: "Green", swatch: "oklch(0.60 0.13 150)" },
] as const;

type Step = "welcome" | "site" | "admin" | "ai" | "done";

interface WizardProps {
  needsAdmin: boolean;
  defaultLocale: Locale;
  db: { label: string; url: string };
}

interface FormState {
  site: { name: string; description: string };
  locale: Locale;
  color: string;
  admin: { email: string; password: string; name: string };
  enableAi: boolean;
  ai: { name: string; kind: "LLM" | "IMAGE"; baseUrl: string; model: string; apiKey: string };
}

export function SetupWizard({ needsAdmin, defaultLocale, db }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("welcome");
  const [data, setData] = React.useState<FormState>({
    site: { name: "My Blog", description: "" },
    locale: defaultLocale,
    color: "pink",
    admin: { email: "", password: "", name: "" },
    enableAi: false,
    ai: { name: "OpenAI", kind: "LLM", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", apiKey: "" },
  });
  const [submitting, setSubmitting] = React.useState(false);

  const STEP_ORDER: Step[] = needsAdmin
    ? ["welcome", "site", "admin", "ai", "done"]
    : ["welcome", "site", "ai", "done"];
  const currentIdx = STEP_ORDER.indexOf(step);

  function goNext() {
    setStep(STEP_ORDER[Math.min(currentIdx + 1, STEP_ORDER.length - 1)]);
  }
  function goBack() {
    setStep(STEP_ORDER[Math.max(currentIdx - 1, 0)]);
  }

  function siteStepValid() {
    return data.site.name.trim().length > 0;
  }
  function adminStepValid() {
    if (!needsAdmin) return true;
    return /\S+@\S+\.\S+/.test(data.admin.email) && data.admin.password.length >= 8;
  }
  function aiStepValid() {
    if (!data.enableAi) return true;
    return data.ai.apiKey.trim().length > 0 && data.ai.model.trim().length > 0;
  }

  async function onFinish() {
    if (!siteStepValid()) {
      setStep("site");
      toast.error("Please fill in the site name.");
      return;
    }
    if (!adminStepValid()) {
      setStep("admin");
      toast.error("Provide a valid email and a password (8+ characters).");
      return;
    }
    if (!aiStepValid()) {
      setStep("ai");
      toast.error("AI section is incomplete. Fill it in or disable AI.");
      return;
    }
    setSubmitting(true);
    const result = await completeSetup({
      site: data.site,
      locale: data.locale,
      color: data.color,
      admin: needsAdmin
        ? {
            email: data.admin.email,
            password: data.admin.password,
            name: data.admin.name || undefined,
          }
        : undefined,
      ai: data.enableAi ? data.ai : undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setStep("done");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 py-12">
      <header className="mb-6">
        <p className="eyebrow mb-2">Setup</p>
        <Stepper steps={STEP_ORDER} current={step} />
      </header>

      <Card className="rise rise-1 flex-1">
        <CardContent className="p-8">
          {step === "welcome" ? <WelcomeStep db={db} /> : null}

          {step === "site" ? (
            <SiteStep
              data={data}
              onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
            />
          ) : null}

          {step === "admin" && needsAdmin ? (
            <AdminStep
              data={data}
              onChange={(patch) => setData((d) => ({ ...d, admin: { ...d.admin, ...patch } }))}
            />
          ) : null}

          {step === "ai" ? (
            <AiStep
              data={data}
              onToggle={(v) => setData((d) => ({ ...d, enableAi: v }))}
              onChange={(patch) => setData((d) => ({ ...d, ai: { ...d.ai, ...patch } }))}
            />
          ) : null}

          {step === "done" ? (
            <DoneStep
              onGoToAdmin={() => {
                router.push("/admin");
                router.refresh();
              }}
            />
          ) : null}
        </CardContent>
      </Card>

      <footer className="mt-6 flex items-center justify-between">
        {step === "welcome" || step === "done" ? (
          <span />
        ) : (
          <Button variant="ghost" onClick={goBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        )}
        {step === "welcome" ? (
          <Button onClick={goNext} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Get started
          </Button>
        ) : null}
        {step === "site" ? (
          <Button onClick={goNext} disabled={!siteStepValid()} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
        ) : null}
        {step === "admin" ? (
          <Button onClick={goNext} disabled={!adminStepValid()} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
        ) : null}
        {step === "ai" ? (
          <Button onClick={onFinish} loading={submitting} disabled={!aiStepValid()}>
            Finish setup
          </Button>
        ) : null}
      </footer>
    </div>
  );
}

function Stepper({ steps, current }: { steps: Step[]; current: Step }) {
  const idx = steps.indexOf(current);
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] tabular-nums shadow-[inset_0_0_0_1px_var(--color-border)]",
              i < idx && "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]",
              i === idx && "bg-[var(--color-primary)] text-[var(--color-primary-fg)]",
              i > idx && "text-[var(--color-foreground-subtle)]",
            )}
          >
            {i < idx ? "✓" : i + 1}
          </span>
          {i < steps.length - 1 ? (
            <span
              aria-hidden
              className={cn(
                "h-px w-6 transition-colors",
                i < idx ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]",
              )}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function WelcomeStep({ db }: { db: { label: string; url: string } }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.20)]">
        <Feather className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="font-serif text-3xl font-medium tracking-tight">Welcome.</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground-muted)]">
        A few quick questions and your blog is ready: site identity, an admin account, optionally an AI
        provider. You can change everything later from the admin area.
      </p>
      <div className="mx-auto mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-foreground-muted)] shadow-[inset_0_0_0_1px_var(--color-border)]">
        <Database className="h-3.5 w-3.5 text-[var(--color-foreground-subtle)]" aria-hidden />
        <span>
          Database: <span className="font-medium text-[var(--color-foreground)]">{db.label}</span>
        </span>
        {db.url ? (
          <span className="truncate font-mono text-[10px] text-[var(--color-foreground-subtle)]">
            {db.url}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] text-[var(--color-foreground-subtle)]">
        Chosen at install time via <code className="text-[11px]">pnpm setup</code>. Run it again to switch.
      </p>
    </div>
  );
}

function SiteStep({
  data,
  onChange,
}: {
  data: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-serif text-2xl font-medium tracking-tight">Site basics</h2>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
          Name, description, language and color palette.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="s-name">Site name</Label>
        <Input
          id="s-name"
          value={data.site.name}
          onChange={(e) => onChange({ site: { ...data.site, name: e.target.value } })}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="s-desc">Description</Label>
        <Textarea
          id="s-desc"
          value={data.site.description}
          onChange={(e) => onChange({ site: { ...data.site, description: e.target.value } })}
          rows={2}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="s-locale">Default language</Label>
          <Select value={data.locale} onValueChange={(v) => onChange({ locale: v as Locale })}>
            <SelectTrigger id="s-locale">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((l) => (
                <SelectItem key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Color palette</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onChange({ color: c.value })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-2 transition-shadow",
                  data.color === c.value
                    ? "shadow-[inset_0_0_0_2px_var(--color-primary)]"
                    : "shadow-[inset_0_0_0_1px_var(--color-border)] hover:shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
                )}
              >
                <span
                  aria-hidden
                  className="h-6 w-6 rounded-full shadow-[inset_0_0_0_1px_oklch(0_0_0/0.20)]"
                  style={{ background: c.swatch }}
                />
                <span className="text-[11px] text-[var(--color-foreground-muted)]">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminStep({
  data,
  onChange,
}: {
  data: FormState;
  onChange: (patch: Partial<FormState["admin"]>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-serif text-2xl font-medium tracking-tight">Administrator account</h2>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
          This account has full control. You can add authors later from the admin area.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="a-name">Name</Label>
        <Input
          id="a-name"
          value={data.admin.name}
          onChange={(e) => onChange({ name: e.target.value })}
          autoComplete="name"
          placeholder="Your name"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="a-email">Email</Label>
        <Input
          id="a-email"
          type="email"
          value={data.admin.email}
          onChange={(e) => onChange({ email: e.target.value })}
          required
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="a-pass">Password</Label>
        <Input
          id="a-pass"
          type="password"
          value={data.admin.password}
          onChange={(e) => onChange({ password: e.target.value })}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-[var(--color-foreground-subtle)]">At least 8 characters.</p>
      </div>
    </div>
  );
}

function AiStep({
  data,
  onToggle,
  onChange,
}: {
  data: FormState;
  onToggle: (v: boolean) => void;
  onChange: (patch: Partial<FormState["ai"]>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-serif text-2xl font-medium tracking-tight">AI provider</h2>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
          Optional. Any OpenAI-compatible base URL works. You can change or add more later.
        </p>
      </div>
      <label className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-sm shadow-[inset_0_0_0_1px_var(--color-border)]">
        <input
          type="checkbox"
          checked={data.enableAi}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        Configure an AI provider now
      </label>
      {data.enableAi ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-name">Name</Label>
            <Input id="ai-name" value={data.ai.name} onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-kind">Kind</Label>
            <Select
              value={data.ai.kind}
              onValueChange={(v) => onChange({ kind: v as "LLM" | "IMAGE" })}
            >
              <SelectTrigger id="ai-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LLM">LLM</SelectItem>
                <SelectItem value="IMAGE">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="ai-url">Base URL</Label>
            <Input
              id="ai-url"
              value={data.ai.baseUrl}
              onChange={(e) => onChange({ baseUrl: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-model">Model</Label>
            <Input id="ai-model" value={data.ai.model} onChange={(e) => onChange({ model: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-key">API key</Label>
            <Input
              id="ai-key"
              type="password"
              value={data.ai.apiKey}
              onChange={(e) => onChange({ apiKey: e.target.value })}
              placeholder="sk-…"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DoneStep({ onGoToAdmin }: { onGoToAdmin: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(from_var(--color-success)_l_c_h/0.14)] text-[var(--color-success)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-success)_l_c_h/0.30)]">
        <CheckCircle2 className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="font-serif text-3xl font-medium tracking-tight">All set.</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground-muted)]">
        Your blog is ready. The admin area is where you write, configure, and customize everything.
      </p>
      <div className="mt-6 flex justify-center">
        <Button onClick={onGoToAdmin} rightIcon={<Sparkles className="h-4 w-4" />}>
          Open the dashboard
        </Button>
      </div>
    </div>
  );
}
