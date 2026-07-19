export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow && (
        <span className="chip bg-sunny-100 text-sunny-700 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-navy-600 sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 animate-ping rounded-full bg-teal-300 opacity-60" />
        <span className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-500 via-hotpink-500 to-sunny-400" />
      </div>
      <p className="font-bold text-navy-600">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card mx-auto max-w-md border-hotpink-200 bg-hotpink-50 p-8 text-center">
      <p className="font-display text-lg font-extrabold text-hotpink-700">
        Hmm, something glitched.
      </p>
      <p className="mt-2 text-sm text-hotpink-600">{message}</p>
    </div>
  );
}
