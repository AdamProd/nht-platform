import {
  hasPermission,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type Permission,
} from "@/features/staff/permissions";
import { STAFF_EMPLOYEE_ROLES } from "@/features/staff/types";

type Props = {
  labels: {
    title: string;
    description: string;
    module: string;
    role: string;
  };
  roleLabels: Record<string, string>;
  moduleLabels: Record<string, string>;
  actionLabels: Record<string, string>;
};

export default function PermissionsMatrix({
  labels,
  roleLabels,
  moduleLabels,
  actionLabels,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-white">{labels.title}</h2>
        <p className="mt-1 text-sm text-[var(--nht-text-secondary)]">
          {labels.description}
        </p>
      </div>
      <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-white/[0.06] bg-white/[0.02]">
            <tr>
              <th className="px-3 py-3 text-[var(--nht-text-tertiary)]">
                {labels.module}
              </th>
              <th className="px-3 py-3 text-[var(--nht-text-tertiary)]">
                {labels.role}
              </th>
              {PERMISSION_ACTIONS.map((action) => (
                <th
                  key={action}
                  className="px-3 py-3 text-[var(--nht-text-tertiary)]"
                >
                  {actionLabels[action] ?? action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map((module) =>
              STAFF_EMPLOYEE_ROLES.map((role, index) => (
                <tr
                  key={`${module}-${role}`}
                  className="border-b border-white/[0.04]"
                >
                  {index === 0 ? (
                    <td
                      rowSpan={STAFF_EMPLOYEE_ROLES.length}
                      className="px-3 py-2 align-top font-medium text-white"
                    >
                      {moduleLabels[module] ?? module}
                    </td>
                  ) : null}
                  <td className="px-3 py-2 text-[var(--nht-text-secondary)]">
                    {roleLabels[role] ?? role}
                  </td>
                  {PERMISSION_ACTIONS.map((action) => {
                    const permission = `${module}.${action}` as Permission;
                    const allowed = hasPermission(role, permission);
                    return (
                      <td key={action} className="px-3 py-2">
                        <span
                          className={
                            allowed
                              ? "text-[var(--nht-gold)]"
                              : "text-[var(--nht-text-tertiary)]"
                          }
                        >
                          {allowed ? "✓" : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
