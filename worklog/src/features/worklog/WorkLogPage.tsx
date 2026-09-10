import { useMemo, useState } from "react";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import { Alert } from "../../shared/ui/Alert";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Skeleton } from "../../shared/ui/Skeleton";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { format } from "../../lib/i18n/dictionary";
import { WorkLogForm } from "./WorkLogForm";
import { bucketLabel, formatHours, todayIso, totalHours } from "./period";
import { useWorkLogMutations, useWorkLogsQuery } from "./useWorkLogs";
import { workLogId } from "./workLogApi";
import type { WorkLog, WorkLogInput } from "./workLogApi";
import type { TranslationKey } from "../../lib/i18n/dictionary";

export function WorkLogPage() {
  const { data: entries, error, isLoading } = useWorkLogsQuery();
  const { create, remove, update } = useWorkLogMutations();
  const [editing, setEditing] = useState<WorkLog | undefined>();
  const [pendingDelete, setPendingDelete] = useState<WorkLog | undefined>();
  const { t } = useT();

  const all = useMemo(() => entries ?? [], [entries]);

  // Previously used values feed the datalists, so a returning user picks rather
  // than retypes -- the same reason the form keeps the unit and project after
  // an entry is added.
  const suggestions = useMemo(
    () => ({
      businessUnits: unique(all.map((entry) => entry.businessUnit)),
      projects: unique(all.map((entry) => entry.projectOrClient))
    }),
    [all]
  );

  const today = todayIso();
  const todayEntries = useMemo(() => all.filter((entry) => entry.workDate === today), [all, today]);
  const recent = useMemo(
    () => [...all].sort(byNewest).slice(0, 10),
    [all]
  );

  function handleSubmit(input: WorkLogInput) {
    if (editing) {
      update.mutate({ id: workLogId(editing), input }, { onSuccess: () => setEditing(undefined) });
    } else {
      create.mutate(input);
    }
  }

  const saveError = create.error ?? update.error;

  return (
    <section className="page">
      <PageHeader
        title={t("worklog.page.title")}
        subtitle={t("worklog.page.subtitle")}
        actions={
          <div className="today-total">
            <span className="today-total-label">{t("worklog.loggedToday")}</span>
            <strong>{formatHours(totalHours(todayEntries))}</strong>
          </div>
        }
      />

      {saveError ? <Alert tone="error">{t("worklog.error.save")} {messageOf(saveError)}</Alert> : null}

      <div className="card">
        {editing ? <h3 className="card-title">{t("worklog.entry.edit")}</h3> : null}
        <WorkLogForm
          key={editing ? workLogId(editing) : "new"}
          entry={editing}
          suggestions={suggestions}
          pending={create.isPending || update.isPending}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(undefined) : undefined}
        />
      </div>

      <div className="card">
        <h3 className="card-title">{t("worklog.recent.title")}</h3>

        {isLoading ? (
          <Skeleton />
        ) : error ? (
          <Alert tone="error">{t("worklog.error.load")} {messageOf(error)}</Alert>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={20} />}
            title={t("worklog.empty.title")}
            description={t("worklog.empty.body")}
          />
        ) : (
          <DataTable
            caption={t("worklog.recent.caption")}
            rows={recent}
            rowKey={(entry) => workLogId(entry)}
            columns={entryColumns({ onEdit: setEditing, onDelete: setPendingDelete, t })}
          />
        )}
      </div>

      {pendingDelete ? (
        <ConfirmDialog
          title={t("worklog.delete.title")}
          message={format(t("worklog.delete.body"), {
            hours: formatHours(Number(pendingDelete.hours) || 0),
            name: pendingDelete.projectOrClient || t("worklog.unspecified")
          })}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            const id = workLogId(pendingDelete);
            setPendingDelete(undefined);
            if (editing && workLogId(editing) === id) setEditing(undefined);
            remove.mutate(id);
          }}
        />
      ) : null}
    </section>
  );
}

/** Column set for the recent-entries table. */
function entryColumns({
  onDelete,
  onEdit,
  t
}: {
  onDelete: (entry: WorkLog) => void;
  onEdit: (entry: WorkLog) => void;
  t: (key: TranslationKey) => string;
}): Column<WorkLog>[] {
  return [
    {
      key: "project",
      header: t("worklog.col.project"),
      render: (entry) => (
        <>
          <span className="cell-strong">{entry.projectOrClient || t("worklog.unspecified")}</span>
          {entry.notes ? <span className="cell-note">{entry.notes}</span> : null}
        </>
      )
    },
    {
      key: "unit",
      header: t("worklog.col.unit"),
      render: (entry) => entry.businessUnit || t("worklog.unspecified")
    },
    {
      key: "date",
      header: t("worklog.col.date"),
      render: (entry) => (entry.workDate ? bucketLabel(entry.workDate, "day") : t("worklog.noDate"))
    },
    {
      key: "hours",
      header: t("worklog.col.hours"),
      align: "end",
      render: (entry) => <span className="cell-hours">{formatHours(Number(entry.hours) || 0)}</span>
    },
    {
      key: "actions",
      header: <span className="visually-hidden">{t("worklog.col.actions")}</span>,
      align: "end",
      render: (entry) => (
        <div className="row-actions">
          <button
            className="icon-button"
            type="button"
            aria-label={format(t("worklog.action.editRow"), { name: entry.projectOrClient || t("worklog.unspecified") })}
            onClick={() => onEdit(entry)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={format(t("worklog.action.deleteRow"), { name: entry.projectOrClient || t("worklog.unspecified") })}
            onClick={() => onDelete(entry)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];
}

function byNewest(a: WorkLog, b: WorkLog): number {
  const byDate = (b.workDate ?? "").localeCompare(a.workDate ?? "");
  if (byDate !== 0) return byDate;
  return (b.CreatedDate ?? "").localeCompare(a.CreatedDate ?? "");
}

function unique(values: (string | undefined)[]): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))].sort();
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "";
}
