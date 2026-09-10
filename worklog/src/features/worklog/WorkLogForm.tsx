import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Combobox } from "../../shared/ui/Combobox";
import { useBeep } from "../../lib/sound/useBeep";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { format } from "../../lib/i18n/dictionary";
import { todayIso } from "./period";
import type { WorkLog, WorkLogInput } from "./workLogApi";

type Errors = Partial<Record<"businessUnit" | "projectOrClient" | "hours" | "workDate", string>>;

// The slider covers a realistic working day at fine resolution; the typed
// value may still go higher, so the ceiling below is validation, not the range.
const SLIDER_MAX = 12;
const HOURS_MAX = 24;
const STEP = 0.25;

/**
 * Entry form for one work log.
 *
 * Hours lead the card: a slider for the common case, with the figure itself
 * editable for anything the slider cannot reach. Validation runs on blur and
 * again on submit, never only on submit, and a failed submit moves focus to a
 * summary so a keyboard or screen-reader user is told what went wrong.
 */
export function WorkLogForm({
  entry,
  onCancel,
  onSubmit,
  pending,
  suggestions
}: {
  entry?: WorkLog;
  onCancel?: () => void;
  onSubmit: (input: WorkLogInput) => void;
  pending: boolean;
  suggestions: { businessUnits: string[]; projects: string[] };
}) {
  const [businessUnit, setBusinessUnit] = useState(entry?.businessUnit ?? "");
  const [projectOrClient, setProjectOrClient] = useState(entry?.projectOrClient ?? "");
  const [hours, setHours] = useState(entry?.hours != null ? String(entry.hours) : "0");
  const [workDate, setWorkDate] = useState(entry?.workDate ?? todayIso());
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [editingHours, setEditingHours] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const beep = useBeep();
  const { t } = useT();

  const values = useMemo(
    () => ({ businessUnit, projectOrClient, hours, workDate }),
    [businessUnit, projectOrClient, hours, workDate]
  );

  useEffect(() => {
    if (showSummary) summaryRef.current?.focus();
  }, [showSummary]);

  useEffect(() => {
    if (editingHours) hoursInputRef.current?.select();
  }, [editingHours]);

  function validate(): Errors {
    const next: Errors = {};

    if (!values.businessUnit.trim()) next.businessUnit = t("worklog.valid.unit");
    if (!values.projectOrClient.trim()) next.projectOrClient = t("worklog.valid.project");

    const parsed = Number(values.hours);
    if (!values.hours.trim() || !Number.isFinite(parsed)) next.hours = t("worklog.valid.hoursRequired");
    else if (parsed <= 0) next.hours = t("worklog.valid.hoursMin");
    else if (parsed > HOURS_MAX) next.hours = format(t("worklog.valid.hoursMax"), { max: HOURS_MAX });

    if (!values.workDate) next.workDate = t("worklog.valid.dateRequired");
    else if (values.workDate > todayIso()) next.workDate = t("worklog.valid.dateFuture");

    return next;
  }

  function validateField(field: keyof Errors) {
    const all = validate();
    setErrors((current) => ({ ...current, [field]: all[field] }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setShowSummary(true);
      return;
    }

    setShowSummary(false);
    onSubmit({
      businessUnit: businessUnit.trim(),
      projectOrClient: projectOrClient.trim(),
      hours: Number(hours),
      workDate,
      notes: notes.trim()
    });

    if (!entry) {
      // Unit, project and date persist -- several entries for one day is the
      // dominant path, and retyping them is what makes a timesheet tedious.
      setHours("0");
      setNotes("");
      setErrors({});
    }
  }

  function handleReset() {
    if (onCancel) return onCancel();
    setHours("0");
    setNotes("");
    setBusinessUnit("");
    setProjectOrClient("");
    setWorkDate(todayIso());
    setErrors({});
    setShowSummary(false);
  }

  const numeric = Number(hours);
  const display = Number.isFinite(numeric) ? numeric.toFixed(2).replace(/\.?0+$/, "") || "0" : "0";
  const sliderValue = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), SLIDER_MAX) : 0;
  const pct = (sliderValue / SLIDER_MAX) * 100;

  const errorList = (Object.entries(errors) as [keyof Errors, string | undefined][]).filter(
    (pair): pair is [keyof Errors, string] => Boolean(pair[1])
  );

  return (
    <form className="worklog-form" noValidate onSubmit={handleSubmit}>
      {showSummary && errorList.length > 0 ? (
        <div className="alert alert-error" role="alert" tabIndex={-1} ref={summaryRef} aria-labelledby="worklog-error-title">
          <strong id="worklog-error-title">{t("worklog.form.errorSummary")}</strong>
          <ul className="error-summary">
            {errorList.map(([field, message]) => (
              <li key={field}><a href={`#worklog-${field}`}>{message}</a></li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Hours lead the card. The figure is the control: click it to type. */}
      <div className="hours-hero">
        {editingHours ? (
          <input
            ref={hoursInputRef}
            id="worklog-hours"
            className="hours-figure-input"
            type="number"
            inputMode="decimal"
            min="0"
            max={String(HOURS_MAX)}
            step={String(STEP)}
            aria-label={t("worklog.form.hours")}
            aria-describedby="worklog-hours-hint"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            onBlur={() => { setEditingHours(false); validateField("hours"); }}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setEditingHours(false); validateField("hours"); } }}
          />
        ) : (
          <button
            type="button"
            className="hours-figure"
            onClick={() => setEditingHours(true)}
            aria-label={format(t("worklog.form.hoursAria"), { value: display })}
          >
            <span className="hours-value">{display}</span>
            <span className="hours-unit">h</span>
          </button>
        )}

        <input
          className="hours-slider"
          type="range"
          min="0"
          max={String(SLIDER_MAX)}
          step={String(STEP)}
          value={sliderValue}
          aria-label={t("worklog.form.hours")}
          aria-describedby="worklog-hours-hint"
          style={{ ["--pct" as string]: `${pct}%` }}
          onChange={(event) => {
            const next = event.target.value;
            // Only sound an actual step change -- a repeated value from a
            // stalled pointer should stay silent. Covers arrow keys too.
            if (next !== hours) beep(Number(next) / SLIDER_MAX);
            setHours(next);
          }}
          onBlur={() => validateField("hours")}
          list="worklog-hour-ticks"
        />
        <datalist id="worklog-hour-ticks">
          {Array.from({ length: SLIDER_MAX + 1 }, (_, i) => <option key={i} value={i} />)}
        </datalist>

        {errors.hours ? (
          <p className="field-error" id="worklog-hours-error">{errors.hours}</p>
        ) : (
          <p className="field-hint" id="worklog-hours-hint">
            {t("worklog.form.hoursHint")}
          </p>
        )}
      </div>

      <div className="entry-fields">
        <div className="entry-field">
          <span className="entry-field-label" id="worklog-businessUnit-label">{t("worklog.form.unit")}</span>
          <div className="entry-field-control">
            <Combobox
              id="worklog-businessUnit"
              value={businessUnit}
              onChange={setBusinessUnit}
              onBlur={() => validateField("businessUnit")}
              options={suggestions.businessUnits}
              invalid={Boolean(errors.businessUnit)}
              ariaDescribedBy="worklog-businessUnit-label"
              placeholder={t("worklog.form.unitPlaceholder")}
            />
          </div>
          {errors.businessUnit ? <p className="field-error">{errors.businessUnit}</p> : null}
        </div>

        <div className="entry-field">
          <span className="entry-field-label" id="worklog-projectOrClient-label">{t("worklog.form.project")}</span>
          <div className="entry-field-control">
            <Combobox
              id="worklog-projectOrClient"
              value={projectOrClient}
              onChange={setProjectOrClient}
              onBlur={() => validateField("projectOrClient")}
              options={suggestions.projects}
              invalid={Boolean(errors.projectOrClient)}
              ariaDescribedBy="worklog-projectOrClient-label"
              placeholder={t("worklog.form.projectPlaceholder")}
            />
          </div>
          {errors.projectOrClient ? <p className="field-error">{errors.projectOrClient}</p> : null}
        </div>

        <div className="entry-field">
          <span className="entry-field-label" id="worklog-workDate-label">{t("worklog.form.date")}</span>
          <div className="entry-field-control has-trailing-icon">
            <input
              id="worklog-workDate"
              type="date"
              max={todayIso()}
              value={workDate}
              aria-describedby="worklog-workDate-label"
              aria-invalid={errors.workDate ? true : undefined}
              className={errors.workDate ? "has-error" : undefined}
              onChange={(event) => setWorkDate(event.target.value)}
              onBlur={() => validateField("workDate")}
            />
            <CalendarDays className="field-trailing-icon" size={18} aria-hidden="true" />
          </div>
          {errors.workDate ? <p className="field-error">{errors.workDate}</p> : null}
        </div>
      </div>

      <div className="entry-field notes-field">
        <span className="entry-field-label" id="worklog-notes-label">
          {t("worklog.form.notes")} <span className="field-optional">{t("worklog.form.optional")}</span>
        </span>
        <textarea
          id="worklog-notes"
          rows={3}
          aria-describedby="worklog-notes-label"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t("worklog.form.notesPlaceholder")}
        />
      </div>

      <div className="worklog-form-actions">
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? t("worklog.form.saving") : entry ? t("worklog.form.save") : t("worklog.form.add")}
        </button>
        <button className="icon-button" type="button" onClick={handleReset}>
          {entry ? t("worklog.form.cancel") : t("worklog.form.reset")}
        </button>
      </div>
    </form>
  );
}
