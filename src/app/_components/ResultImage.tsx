import Image from 'next/image';

interface ResultImageProps {
  src: string;
  label: string;
  won: boolean;
  avatar?: boolean;
  colorblindMode?: boolean;
}

export default function ResultImage({ src, label, won, avatar = false, colorblindMode = false }: ResultImageProps) {
  const description = `${label} — ${won ? 'Wygrana' : 'Przegrana'}`;

  return (
    <span className="relative inline-flex shrink-0">
      <Image
        src={src}
        alt={description}
        width={28}
        height={28}
        className={`shrink-0 object-contain ${avatar ? 'rounded-full' : ''}`}
        style={{
          filter: won
            ? 'grayscale(1) sepia(1) saturate(2) hue-rotate(75deg)'
            : 'grayscale(1) sepia(1) saturate(2) hue-rotate(310deg)',
        }}
      />
      {colorblindMode && (
        <span aria-hidden="true" className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded border border-white/70 bg-zinc-950 px-0.5 text-[10px] leading-none font-bold text-white shadow">
          {won ? 'W' : 'L'}
        </span>
      )}
    </span>
  );
}
