export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} WatchFinder AI. Tutti i diritti riservati.</p>
        <p className="mt-1">Realizzato con passione per gli orologi di lusso.</p>
      </div>
    </footer>
  );
}
