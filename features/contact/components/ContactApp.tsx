"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactEmail, socials } from "@/lib/content";
import { useContactForm } from "../hooks/useContactForm";

export function ContactApp() {
  const t = useTranslations("contact");
  const { status, submit } = useContactForm();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="c-name">{t("name")}</Label>
          <Input id="c-name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-email">{t("email")}</Label>
          <Input id="c-email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-msg">{t("message")}</Label>
          <Textarea id="c-msg" required rows={4} />
        </div>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t("sending") : t("send")}
        </Button>
        {status === "success" && (
          <p className="text-sm text-green-600">{t("success")}</p>
        )}
        {status === "error" && (
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
