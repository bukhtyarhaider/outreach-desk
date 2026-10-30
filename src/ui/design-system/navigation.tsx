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
