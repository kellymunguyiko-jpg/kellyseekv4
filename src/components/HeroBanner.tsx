import { useState, useEffect } from "react";
import { Play, Plus, Star, Clock, Download } from "lucide-react";
import { Movie } from "../types";

interface HeroBannerProps {
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onAddList: (movie: Movie) => void;
  onDownload?: (movie: Movie) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onWatch, onAddList, onDownload }) => {
  const [current, setCurrent] = useState(0);
  const featured = movies.filter((m) => m.featured || m.backdropUrl);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) {
    return (
      <div className="w-full h-[60vh] md:h-[85vh] bg-gradient-to-b from-gray-900 to-[#141414] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl">No featured content yet</p>
          <p className="text-sm mt-2">Add movies from the admin panel</p>
        </div>
      </div>
    );
  }

  const movie = featured[current];
  const hasDownload =
    (movie.downloadLinks && movie.downloadLinks.length > 0) || !!movie.downloadUrl;

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden">
      {/* Background */}
      {featured.map((m, i) => (
        <div
          key={m.id || i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${m.backdropUrl || m.posterUrl})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-16 pb-16 md:pb-24">
        <div className="max-w-lg">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-3 text-xs md:text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {movie.duration}
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Star size={14} fill="currentColor" />
              {movie.rating}
            </span>
            <span>{movie.genre.slice(0, 2).join(" · ")}</span>
            <span className="text-gray-500">{movie.year}</span>
            {hasDownload && (
              <span className="flex items-center gap-1 text-green-400 bg-green-900/30 border border-green-700/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Download size={10} /> DOWNLOAD
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight drop-shadow-lg">
            {movie.title}
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-200 mb-6 line-clamp-3 leading-relaxed max-w-md">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Watch */}
            <button
              onClick={() => onWatch(movie)}
              className="flex items-center gap-2 bg-[#E50914] hover:bg-[#f40612] text-white font-bold px-6 py-3 rounded-md transition-all hover:scale-105 shadow-lg"
            >
              <Play size={18} fill="white" />
              WATCH
            </button>

            {/* Download */}
            {hasDownload && onDownload && (
              <button
                onClick={() => onDownload(movie)}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-3 rounded-md transition-all hover:scale-105 shadow-lg border border-green-500/30"
              >
                <Download size={18} />
                DOWNLOAD
              </button>
            )}

            {/* Add to List */}
            <button
              onClick={() => onAddList(movie)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-5 py-3 rounded-md transition-all border border-white/30"
            >
              <Plus size={18} />
              ADD LIST
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all ${
                i === current ? "w-8 bg-white" : "w-4 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
