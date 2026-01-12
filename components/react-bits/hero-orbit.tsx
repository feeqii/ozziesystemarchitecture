export function HeroOrbit() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30">
        <div className="absolute inset-6 rounded-full border border-primary/20 animate-orbit" />
        <div className="absolute inset-16 rounded-full border border-primary/10 animate-orbit-reverse" />
      </div>
    </div>
  );
}
