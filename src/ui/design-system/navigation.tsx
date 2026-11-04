import { Button } from './primitives';
/** Section links keep the page route and all unsaved form fields intact. */
export function SectionNavigation({
  label,
  items,
}: {
  label: string;
  items: readonly { id: string; label: string }[];
}) {
  return (
    <nav className="ui-section-navigation" aria-label={label}>
      {items.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          onClick={() =>
            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

export interface TabItem {
  id: string;
  label: string;
}
/** Controlled tabs keep panels mounted and support the standard roving keyboard focus pattern. */
export function Tabs({
  label,
  items,
  activeId,
  onChange,
  prefix,
}: {
  label: string;
  items: readonly TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  prefix: string;
}) {
  return (
    <div className="ui-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <Button
          key={item.id}
          id={`${prefix}-tab-${item.id}`}
          type="button"
          role="tab"
          variant="ghost"
          aria-selected={activeId === item.id}
          aria-controls={`${prefix}-panel-${item.id}`}
          tabIndex={activeId === item.id ? 0 : -1}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => {
            const key = event.key;
            if (
              !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(key) ||
              event.altKey ||
              event.ctrlKey ||
              event.metaKey
            )
              return;
            event.preventDefault();
            const next =
              key === 'Home'
                ? 0
                : key === 'End'
                  ? items.length - 1
                  : (index + (key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
            onChange(items[next].id);
            document.getElementById(`${prefix}-tab-${items[next].id}`)?.focus();
          }}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
