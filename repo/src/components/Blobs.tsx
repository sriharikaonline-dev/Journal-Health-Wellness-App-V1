export function Blobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-teal-300 opacity-20 blur-3xl animate-float-slow" />
      <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-hotpink-300 opacity-20 blur-3xl animate-float-slower" />
      <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-sunny-300 opacity-25 blur-3xl animate-float-slow" />
    </div>
  );
}
