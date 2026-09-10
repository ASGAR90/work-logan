export const defaultDictionary = {
  "app.name": "MyTime",
  "nav.profile": "Profile",
  "nav.worklog": "Log work",
  "nav.summary": "Summary",
  "theme.toDark": "Switch to dark theme",
  "theme.toLight": "Switch to light theme",
  "nav.logout": "Log out",
  "auth.welcome": "Welcome back",
  "auth.subtitle": "Sign in with your Blocks account to continue.",
  "auth.continue": "Continue with Blocks",
  "auth.redirecting": "Redirecting...",
  "auth.notConfigured": "Login is not configured yet. Register a public OIDC client and set VITE_BLOCKS_OIDC_CLIENT_ID in .env.",
  "auth.failed": "Sign-in failed",
  "auth.back": "Back to sign in",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.refresh": "Refresh",
  "common.loading": "Loading",
  "common.error": "Something went wrong",
  "profile.title": "Profile",
  "profile.subtitle": "Signed-in user details from Blocks IAM.",
  "notFound.title": "404",
  "notFound.message": "This page does not exist.",
  "notFound.home": "Back home",

  // --- worklog feature -------------------------------------------------
  // Cloud counterparts live in the `worklog` module, whose name supplies the
  // namespace: the key `page.title` there resolves to `worklog.page.title`.
  "worklog.page.title": "Log your work",
  "worklog.page.subtitle": "Record what you worked on, for whom, and for how long.",
  "worklog.loggedToday": "Logged today",
  "worklog.recent.title": "Recent entries",
  "worklog.recent.caption": "Your ten most recent work log entries",
  "worklog.entry.edit": "Edit entry",
  "worklog.empty.title": "No entries yet",
  "worklog.empty.body": "Add your first work log above and it will show up here.",
  "worklog.error.save": "Could not save that entry.",
  "worklog.error.load": "Could not load your work logs.",
  "worklog.col.project": "Project or client",
  "worklog.col.unit": "Business unit",
  "worklog.col.date": "Date",
  "worklog.col.hours": "Hours",
  "worklog.col.actions": "Actions",
  "worklog.unspecified": "Unspecified",
  "worklog.noDate": "No date",
  "worklog.action.editRow": "Edit entry for {name}",
  "worklog.action.deleteRow": "Delete entry for {name}",
  "worklog.delete.title": "Delete this entry?",
  "worklog.delete.body": "{hours} on {name} will be removed. This cannot be undone.",

  "worklog.form.errorSummary": "Check these fields before saving",
  "worklog.form.hours": "Hours worked",
  "worklog.form.hoursHint": "Drag for quarter-hour steps, or tap the number to type an exact value.",
  "worklog.form.hoursAria": "Hours worked: {value}. Activate to type an exact value.",
  "worklog.form.unit": "Business unit",
  "worklog.form.unitPlaceholder": "e.g. Engineering",
  "worklog.form.project": "Project or client",
  "worklog.form.projectPlaceholder": "e.g. Acme Corp",
  "worklog.form.date": "Date",
  "worklog.form.notes": "Notes",
  "worklog.form.optional": "(optional)",
  "worklog.form.notesPlaceholder": "Anything worth remembering about this entry",
  "worklog.form.add": "Add",
  "worklog.form.save": "Save",
  "worklog.form.reset": "Reset",
  "worklog.form.cancel": "Cancel",
  "worklog.form.saving": "Saving...",
  "worklog.valid.unit": "Choose the business unit this work belongs to.",
  "worklog.valid.project": "Choose the project or client you worked on.",
  "worklog.valid.hoursRequired": "Enter how many hours you worked.",
  "worklog.valid.hoursMin": "Hours must be greater than 0.",
  "worklog.valid.hoursMax": "Hours cannot be more than {max} in a single day.",
  "worklog.valid.dateRequired": "Choose the date you did this work.",
  "worklog.valid.dateFuture": "The date cannot be in the future.",

  "worklog.summary.title": "Where your time goes",
  "worklog.summary.allTime": "All time",
  "worklog.summary.period": "Summary period",
  "worklog.summary.daily": "Daily",
  "worklog.summary.weekly": "Weekly",
  "worklog.summary.monthly": "Monthly",
  "worklog.summary.dailyBlurb": "Every day you logged work, newest first.",
  "worklog.summary.weeklyBlurb": "Grouped into weeks running Monday to Sunday.",
  "worklog.summary.monthlyBlurb": "Grouped by calendar month.",
  "worklog.summary.emptyTitle": "Nothing to summarise yet",
  "worklog.summary.emptyBody": "Once you log some work, your daily, weekly and monthly totals appear here.",
  "worklog.summary.entryOne": "{count} entry",
  "worklog.summary.entryMany": "{count} entries",
  "worklog.summary.byUnit": "By business unit",
  "worklog.summary.byProject": "By project or client",
  "worklog.summary.showEntries": "Show individual entries",

  "worklog.combobox.show": "Show suggestions",
  "worklog.combobox.hide": "Hide suggestions"
} as const;

export type TranslationKey = keyof typeof defaultDictionary;

/**
 * Fills `{name}` placeholders. The Blocks `t()` returns a plain string, so
 * interpolation happens here rather than in the translation layer — keeping
 * the placeholder inside the translated value lets a translator move it.
 */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match
  );
}
