import { useState } from 'react';

export function FishIllustration({
  speciesId,
  alt,
  className = 'h-36 w-full',
}: {
  speciesId: string;
  alt?: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const src = `${import.meta.env.BASE_URL}fish/${speciesId}.jpg`;

  if (errored) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 text-xs text-slate-400 ${className}`}>
        {alt ?? speciesId}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? speciesId}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
}
