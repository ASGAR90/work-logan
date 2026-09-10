import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "../../lib/i18n/LocalizationProvider";

/**
 * Type-or-pick field.
 *
 * The chevron opens previously used values, but the input stays free text, so
 * a unit or client that does not exist yet can still be logged against — no
 * other screen creates one, so a strict select would be a dead end.
 */
export function Combobox({
  ariaDescribedBy,
  id,
  invalid,
  onBlur,
  onChange,
  options,
  placeholder,
  value
}: {
  ariaDescribedBy?: string;
  id: string;
  invalid?: boolean;
  onBlur?: () => void;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const { t } = useT();

  const matches = options.filter((option) =>
    value.trim() ? option.toLowerCase().includes(value.trim().toLowerCase()) : true
  );

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function commit(option: string) {
    onChange(option);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) return setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && open && active >= 0) {
      event.preventDefault();
      commit(matches[active]!);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="combobox" ref={wrapRef}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid ? true : undefined}
        className={invalid ? "has-error" : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(event) => { onChange(event.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      <button
        type="button"
        className="combobox-toggle"
        // The input already carries the label, so this control only needs to
        // describe what it does, not repeat the field name.
        aria-label={open ? t("worklog.combobox.hide") : t("worklog.combobox.show")}
        tabIndex={-1}
        onClick={() => { setOpen((o) => !o); inputRef.current?.focus(); }}
      >
        <ChevronDown size={18} />
      </button>

      {open && matches.length > 0 ? (
        <ul className="combobox-list" id={listId} role="listbox">
          {matches.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                className={index === active ? "active" : undefined}
                onMouseEnter={() => setActive(index)}
                onClick={() => commit(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
