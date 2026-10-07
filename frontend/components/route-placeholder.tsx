type RoutePlaceholderProps = {
  title: string;
  path: string;
};

export function RoutePlaceholder({ title, path }: RoutePlaceholderProps) {
  return (
    <div className="mx-auto max-w-5xl rounded-xl border border-dashed border-border bg-surface p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-heading">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">This section is a placeholder and will be implemented in a later phase.</p>
      <p className="mt-1 text-xs text-muted-foreground">{path}</p>
    </div>
  );
}
