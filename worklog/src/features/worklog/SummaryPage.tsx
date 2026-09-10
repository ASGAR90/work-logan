import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Alert } from "../../shared/ui/Alert";
import { EmptyState } from "../../shared/ui/EmptyState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Skeleton } from "../../shared/ui/Skeleton";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { format } from "../../lib/i18n/dictionary";
import { formatHours, groupByPeriod, round2, totalHours } from "./period";
import type { Breakdown, Period } from "./period";
import { useWorkLogsQuery } from "./useWorkLogs";
import { workLogId } from "./workLogApi";
import type { TranslationKey } from "../../lib/i18n/dictionary";

// Labels resolve at render so a language switch re-reads them.
const PERIODS = [
  { value: "day", labelKey: "worklog.summary.daily", blurbKey: "worklog.summary.dailyBlurb" },
  { value: "week", labelKey: "worklog.summary.weekly", blurbKey: "worklog.summary.weeklyBlurb" },
  { value: "month", labelKey: "worklog.summary.monthly", blurbKey: "worklog.summary.monthlyBlurb" }
] as const satisfies readonly { value: Period; labelKey: TranslationKey; blurbKey: TranslationKey }[];

export function SummaryPage() {
  const { data: entries, error, isLoading } = useWorkLogsQuery();
  const [period, setPeriod] = useState<Period>("week");
  const { t } = useT();

  const all = useMemo(() => entries ?? [], [entries]);
  const unspecified = t("worklog.unspecified");
  const buckets = useMemo(() => groupByPeriod(all, period, unspecified), [all, period, unspecified]);
  const active = PERIODS.find((option) => option.value === period);

  return (
    <section className="page">
      <PageHeader
        title={t("worklog.summary.title")}
        subtitle={active ? t(active.blurbKey) : ""}
        actions={
          <div className="total-pill">
            <span>{t("worklog.summary.allTime")}</span>
            <strong>{formatHours(totalHours(all))}</strong>
          </div>
        }
      />

      <div className="period-tabs" role="tablist" aria-label={t("worklog.summary.period")}>
        {PERIODS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            id={`period-tab-${option.value}`}
            aria-selected={period === option.value}
            aria-controls="period-panel"
            className={period === option.value ? "period-tab active" : "period-tab"}
            onClick={() => setPeriod(option.value)}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      <div id="period-panel" role="tabpanel" aria-labelledby={`period-tab-${period}`}>
        {isLoading ? (
          <Skeleton />
        ) : error ? (
          <Alert tone="error">{t("worklog.error.load")} {error instanceof Error ? error.message : ""}</Alert>
        ) : buckets.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={20} />}
            title={t("worklog.summary.emptyTitle")}
            description={t("worklog.summary.emptyBody")}
          />
        ) : (
          <div className="bucket-list">
            {buckets.map((bucket) => (
              <article className="card bucket" key={bucket.key}>
                <header className="bucket-header">
                  <div>
                    <h3>{bucket.label}</h3>
                    <p className="bucket-count">
                      {format(t(bucket.entries.length === 1 ? "worklog.summary.entryOne" : "worklog.summary.entryMany"), { count: bucket.entries.length })}
                    </p>
                  </div>
                  <strong className="bucket-hours">{formatHours(bucket.hours)}</strong>
                </header>

                <div className="bucket-breakdowns">
                  <BreakdownList title={t("worklog.summary.byUnit")} rows={bucket.byBusinessUnit} total={bucket.hours} />
                  <BreakdownList title={t("worklog.summary.byProject")} rows={bucket.byProject} total={bucket.hours} />
                </div>

                <details className="bucket-entries">
                  <summary>{t("worklog.summary.showEntries")}</summary>
                  <ul className="entry-list">
                    {bucket.entries.map((entry) => (
                      <li className="entry-row" key={workLogId(entry)}>
                        <div className="entry-main">
                          <span className="entry-project">{entry.projectOrClient || t("worklog.unspecified")}</span>
                          <span className="entry-meta">
                            {entry.businessUnit || t("worklog.unspecified")} · {entry.workDate}
                          </span>
                          {entry.notes ? <span className="entry-notes">{entry.notes}</span> : null}
                        </div>
                        <span className="entry-hours">{formatHours(Number(entry.hours) || 0)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Share of time per unit/project. The bar is a visual aid only -- the hours and
 * percentage are written out, so nothing here depends on seeing the colour.
 */
function BreakdownList({ rows, title, total }: { rows: Breakdown[]; title: string; total: number }) {
  return (
    <div className="breakdown">
      <h4>{title}</h4>
      <ul>
        {rows.map((row) => {
          const share = total > 0 ? round2((row.hours / total) * 100) : 0;
          return (
            <li key={row.label}>
              <div className="breakdown-row">
                <span className="breakdown-label">{row.label}</span>
                <span className="breakdown-value">
                  {formatHours(row.hours)} <span className="breakdown-share">({share}%)</span>
                </span>
              </div>
              <div className="breakdown-bar" aria-hidden="true">
                <span style={{ width: `${share}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
