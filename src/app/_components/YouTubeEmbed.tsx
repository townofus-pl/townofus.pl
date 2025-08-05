'use client';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
}

export function YouTubeEmbed({ 
  videoId, 
  title = "YouTube video",
  className = ""
}: YouTubeEmbedProps) {
  if (!videoId) {
    return (
      <div className={`bg-gray-800 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-400">Link do filmu będzie tutaj...</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 aspect ratio */}
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
