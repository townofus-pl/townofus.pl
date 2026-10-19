import Image from 'next/image';

interface ResultImageProps {
  src: string;
  label: string;
  won: boolean;
  avatar?: boolean;
}

export default function ResultImage({ src, label, won, avatar = false }: ResultImageProps) {
  const description = `${label} — ${won ? 'Wygrana' : 'Przegrana'}`;

  return (
    <Image
      src={src}
      alt={description}
      title={description}
      width={28}
      height={28}
      className={`shrink-0 object-contain ${avatar ? 'rounded-full' : ''}`}
      style={{
        filter: won
          ? 'grayscale(1) sepia(1) saturate(2) hue-rotate(75deg)'
          : 'grayscale(1) sepia(1) saturate(2) hue-rotate(310deg)',
      }}
    />
  );
}
