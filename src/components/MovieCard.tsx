import { Star, Heart, Play, Plus, Download, CheckCircle, ExternalLink } from "lucide-react";
import { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
  onWatch: (movie: Movie) => void;
  onAddList: (movie: Movie) => void;
  myList: string[];
  onDownload?: (movie: Movie) => void;
}

// Detect link type from URL
const getLinkType = (url: string): "mega" | "youtube" | "direct" => {
  if (url.includes("mega.nz")) return "mega";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return "direct";
};

// Get the real URL to open
const getOpenUrl = (url: string): string => {
  const type = getLinkType(url);
  if (type === "mega") {
    // Convert embed to file link if needed
    return url.replace("mega.nz/embed/", "mega.nz/file/");
  }
  return url;
};

// Get badge label for link type
const getLinkBadge = (url: string) => {
  const type = getLinkType(url);
  if (type === "mega") return { label: "MEGA", color: "bg-red-600" };
  if (type === "youtube") return { label: "YT", color: "bg-red-700" };
  return { label: "DL", color: "bg-green-700" };
};

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onWatch,
  onAddList,
  myList,
  onDownload,
}) => {
  const inList = myList.includes(movie.id || "");
  const links = movie.downloadLinks || [];
  const singleUrl = movie.downloadUrl;
  const hasDownload = links.length > 0 || !!singleUrl;
  const downloadCount = links.length || (singleUrl ? 1 : 0);
  const hasMultiple = downloadCount > 1;

  // Handle download button click on card
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasDownload) return;

    if (hasMultiple && onDownload) {
      // Multiple links → open download page
      onDownload(movie);
      return;
    }

    // Single link → open directly
    const url = links.length > 0 ? links[0].url : singleUrl!;
    window.open(getOpenUrl(url), "_blank", "noopener,noreferrer");
  };

  // Get first link badge info
  const firstUrl = links.length > 0 ? links[0].url : singleUrl || "";
  const badge = getLinkBadge(firstUrl);

  return (
    <div className="group relative flex-shrink-0 w-36 md:w-44 cursor-pointer">
      {/* Poster */}
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-800 shadow-lg shadow-black/50">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image";
          }}
        />

        {/* Dark gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-2">
          {/* Watch */}
          <button
            onClick={(e) => { e.stopPropagation(); onWatch(movie); }}
            className="flex items-center gap-1 bg-[#E50914] hover:bg-[#f40612] text-white text-xs font-bold px-4 py-2 rounded-md w-full justify-center transition-all active:scale-95 shadow-lg shadow-red-900/40"
          >
            <Play size={12} fill="white" /> Watch Now
          </button>

          {/* My List */}
          <button
            onClick={(e) => { e.stopPropagation(); onAddList(movie); }}
            className={`flex items-center gap-1 text-white text-xs font-semibold px-4 py-2 rounded-md w-full justify-center transition-all border active:scale-95 ${
              inList
                ? "bg-white/30 border-white/60"
                : "bg-white/10 hover:bg-white/20 border-white/30"
            }`}
          >
            {inList ? <CheckCircle size={12} /> : <Plus size={12} />}
            {inList ? "In My List" : "My List"}
          </button>

          {/* Download on hover — shows per quality if multiple */}
          {hasDownload && (
            <>
              {hasMultiple ? (
                // Multiple links → show "X Qualities" button → open download page
                <button
                  onClick={handleDownloadClick}
                  className="flex items-center gap-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-md w-full justify-center transition-all active:scale-95 shadow-lg shadow-green-900/40"
                >
                  <Download size={12} />
                  {downloadCount} Qualities
                  <ExternalLink size={10} className="opacity-70" />
                </button>
              ) : (
                // Single link → open directly
                <button
                  onClick={handleDownloadClick}
                  className="flex items-center gap-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-md w-full justify-center transition-all active:scale-95 shadow-lg shadow-green-900/40"
                >
                  <Download size={12} /> Download
                  <ExternalLink size={10} className="opacity-70" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Type badge top-left */}
        <div className="absolute top-2 left-2">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              movie.type === "series"
                ? "bg-blue-600 text-white"
                : "bg-[#E50914] text-white"
            }`}
          >
            {movie.type === "series" ? "SERIES" : "MOVIE"}
          </span>
        </div>

        {/* Download source badge top-right */}
        {hasDownload && (
          <div className="absolute top-2 right-2">
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white flex items-center gap-0.5 shadow ${badge.color}`}
            >
              <Download size={8} />
              {hasMultiple ? `${downloadCount}` : badge.label}
            </span>
          </div>
        )}

        {/* Rating badge bottom-right on hover */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-0.5 bg-black/70 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
            <Star size={8} fill="currentColor" /> {movie.rating}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <p className="text-white text-xs font-semibold truncate leading-tight">{movie.title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-400 text-[10px]">{movie.year}</span>
          <div className="flex items-center gap-1">
            <Heart size={9} className="text-gray-500" />
            <Star size={9} className="text-yellow-400" fill="currentColor" />
            <span className="text-yellow-400 text-[10px] font-medium">{movie.rating}</span>
          </div>
        </div>

        {/* Genre */}
        <div className="flex flex-wrap gap-1 mt-1">
          {movie.genre.slice(0, 1).map((g) => (
            <span key={g} className="text-[9px] text-gray-400 bg-gray-800/80 px-1.5 py-0.5 rounded">
              {g}
            </span>
          ))}
        </div>

        {/* ─── DOWNLOAD BUTTON always visible below card ─── */}
        {hasDownload ? (
          <>
            {hasMultiple ? (
              // Multiple links → show download page
              <button
                onClick={handleDownloadClick}
                className="mt-2 flex items-center justify-center gap-1.5 w-full text-[10px] font-bold py-1.5 rounded-md transition-all active:scale-95 border shadow-sm bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white border-green-600/50 shadow-green-900/30"
              >
                <Download size={10} className="text-green-300" />
                DOWNLOAD
                <span className="ml-0.5 bg-green-600 text-white text-[8px] px-1 py-0.5 rounded-full">
                  {downloadCount}
                </span>
              </button>
            ) : (
              // Single link → one big direct open button
              <button
                onClick={handleDownloadClick}
                className="mt-2 flex items-center justify-center gap-1.5 w-full text-[10px] font-bold py-1.5 rounded-md transition-all active:scale-95 border shadow-sm bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white border-green-600/50 shadow-green-900/30"
              >
                <Download size={10} className="text-green-300" />
                {(() => {
                  const url = links.length > 0 ? links[0].url : singleUrl!;
                  const type = getLinkType(url);
                  if (type === "mega") return "DOWNLOAD • MEGA";
                  if (type === "youtube") return "DOWNLOAD • YT";
                  return "DOWNLOAD";
                })()}
                <ExternalLink size={8} className="opacity-60" />
              </button>
            )}
          </>
        ) : (
          <button
            disabled
            className="mt-2 flex items-center justify-center gap-1.5 w-full text-[10px] font-bold py-1.5 rounded-md border bg-gray-800 text-gray-600 border-gray-700/50 cursor-not-allowed"
          >
            <Download size={10} className="text-gray-600" />
            NO DOWNLOAD
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
