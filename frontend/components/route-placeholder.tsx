type RoutePlaceholderProps = {
  title: string;
  path: string;
};

export function RoutePlaceholder({ title, path }: RoutePlaceholderProps) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-heading">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{path}</p>
    </main>
  );
}
