"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactEmail, socials } from "@/lib/content";

interface ContactValues {
  name: string;
  email: string;
  message: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function ContactApp() {
  const t = useTranslations("contact");

  // Demo submit — no backend, so the mutation just models a round-trip.
  const mutation = useMutation({
    mutationFn: async (_values: ContactValues) => {
      await new Promise((r) => setTimeout(r, 700));
      return true;
    },
  });

  const form = useForm({
    defaultValues: { name: "", email: "", message: "" } as ContactValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-3"
        noValidate
      >
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (value.trim() ? undefined : t("required")),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor="c-name">{t("name")}</Label>
              <Input
                id="c-name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-xs text-red-600">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value.trim()
                ? t("required")
                : EMAIL_RE.test(value)
                  ? undefined
                  : t("invalidEmail"),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor="c-email">{t("email")}</Label>
              <Input
                id="c-email"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-xs text-red-600">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="message"
          validators={{
            onChange: ({ value }) => (value.trim() ? undefined : t("required")),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor="c-msg">{t("message")}</Label>
              <Textarea
                id="c-msg"
                rows={4}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-xs text-red-600">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || mutation.isPending}
            >
              {isSubmitting || mutation.isPending ? t("sending") : t("send")}
            </Button>
          )}
        </form.Subscribe>

        {mutation.isSuccess && (
          <p className="text-sm text-green-600">{t("success")}</p>
        )}
        {mutation.isError && (
          <p className="text-sm text-red-600">{t("error")}</p>
        )}
      </form>

      <div className="border-t border-black/10 pt-3 text-sm dark:border-white/10">
        <a
          href={`mailto:${contactEmail}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {contactEmail}
        </a>
        <div className="mt-2 flex gap-3">
          {socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
