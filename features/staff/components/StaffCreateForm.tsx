"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createStaff } from "@/features/staff/actions/staff";
import {
  ASSIGNABLE_STAFF_ROLES,
  STAFF_DEPARTMENTS,
} from "@/features/staff/types";
import FlashToast from "@/features/creators/components/FlashToast";

type Props = {
  labels: {
    create: string;
    title: string;
    email: string;
    fullName: string;
    role: string;
    department: string;
    departmentCustom: string;
    language: string;
    timezone: string;
    temporaryPassword: string;
    phone: string;
    cancel: string;
    submit: string;
    submitting: string;
    created: string;
  };
  roleLabels: Record<string, string>;
  departmentLabels: Record<string, string>;
};

export default function StaffCreateForm({
  labels,
  roleLabels,
  departmentLabels,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [department, setDepartment] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const payload = {
      email: formData.get("email"),
      full_name: formData.get("full_name"),
      role: formData.get("role"),
      department: formData.get("department") || null,
      department_custom: formData.get("department_custom") || null,
      locale: formData.get("locale") || "en",
      timezone: formData.get("timezone") || null,
      temporary_password: formData.get("temporary_password"),
      phone: formData.get("phone") || null,
    };

    startTransition(async () => {
      const result = await createStaff(payload);
      if (!result.success) {
        setError(result.error);
        setToastTone("error");
        setToast(result.error);
        return;
      }
      setToastTone("success");
      setToast(labels.created);
      setOpen(false);
      if (result.id) router.push(`/admin/staff/${result.id}`);
      else router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[var(--nht-gold)]/40 bg-[var(--nht-gold-muted)] px-4 py-2 text-sm font-medium text-[var(--nht-gold)] hover:border-[var(--nht-gold)]"
      >
        {labels.create}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={labels.title}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-[var(--nht-black)] p-5 shadow-xl"
          >
            <h2 className="text-lg font-medium text-white">{labels.title}</h2>
            <form action={handleSubmit} className="mt-4 space-y-3">
              <Field label={labels.fullName} name="full_name" required />
              <Field label={labels.email} name="email" type="email" required />
              <Field label={labels.phone} name="phone" />
              <label className="block text-xs text-[var(--nht-text-tertiary)]">
                {labels.role}
                <select
                  name="role"
                  required
                  className="mt-1.5 w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {ASSIGNABLE_STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role] ?? role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-[var(--nht-text-tertiary)]">
                {labels.department}
                <select
                  name="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1.5 w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
                >
                  <option value="">—</option>
                  {STAFF_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {departmentLabels[dept] ?? dept}
                    </option>
                  ))}
                </select>
              </label>
              {department === "custom" ? (
                <Field label={labels.departmentCustom} name="department_custom" />
              ) : null}
              <Field label={labels.language} name="locale" defaultValue="en" />
              <Field label={labels.timezone} name="timezone" />
              <Field
                label={labels.temporaryPassword}
                name="temporary_password"
                type="password"
                required
              />
              {error ? (
                <p className="text-sm text-red-300" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-white"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full border border-[var(--nht-gold)]/40 bg-[var(--nht-gold-muted)] px-4 py-2 text-xs text-[var(--nht-gold)] disabled:opacity-60"
                >
                  {isPending ? labels.submitting : labels.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <FlashToast message={toast} tone={toastTone} />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-xs text-[var(--nht-text-tertiary)]">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
