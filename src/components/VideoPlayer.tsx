import {
  X, Heart, Plus, Star, Clock, Tag, Download, ExternalLink,
  Youtube, AlertCircle, ChevronDown, ChevronUp, Film, Zap,
  Shield, HardDrive, Play, CheckCircle,
} from "lucide-react";
import { Movie } from "../types";
import { useState } from "react";

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
  onAddList: (movie: Movie) => void;
  myList: string[];
  onOpenDownload?: () => void;
}

const getYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/
  );
  return match ? match[1] : null;
};

const getMegaEmbedUrl = (url: string): string => {
  if (url.includes("mega.nz/embed")) return url;
  if (url.includes("mega.nz/file/")) {
    const parts = url.replace("https://mega.nz/file/", "");
    return `https://mega.nz/embed/${parts}`;
  }
  if (url.includes("mega.nz/#!")) {
    const parts = url.split("#!")[1];
    return `https://mega.nz/embed#!${parts}`;
  }
  return url;
};

type LinkType = "youtube" | "mega" | "direct";

const getLinkType = (url: string): LinkType => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("mega.nz")) return "mega";
  return "direct";
};

// Returns the real URL to open directly in a new tab
const getDirectOpenUrl = (url: string): string => {
  const type = getLinkType(url);
  if (type === "youtube") {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube.com/watch?v=${id}` : url;
  }
  if (type === "mega") {
    return url.replace("mega.nz/embed/", "mega.nz/file/");
  }
  return url;
};

// Open link directly in a new tab
const openInNewTab = (url: string) => {
  window.open(getDirectOpenUrl(url), "_blank", "noopener,noreferrer");
};

const qualityColors: Record<string, string> = {
  "4k": "bg-purple-600 border-purple-400 text-white",
  "2160p": "bg-purple-600 border-purple-400 text-white",
  "1080p": "bg-blue-600 border-blue-400 text-white",
  "1080": "bg-blue-600 border-blue-400 text-white",
  "fhd": "bg-blue-600 border-blue-400 text-white",
  "hd": "bg-blue-500 border-blue-300 text-white",
  "720p": "bg-green-600 border-green-400 text-white",
  "720": "bg-green-600 border-green-400 text-white",
  "480p": "bg-yellow-600 border-yellow-400 text-white",
  "480": "bg-yellow-600 border-yellow-400 text-white",
  "360p": "bg-orange-600 border-orange-400 text-white",
  "sd": "bg-orange-500 border-orange-300 text-white",
};

const getQualityColor = (label: string): string => {
  const lower = label.toLowerCase();
  for (const key of Object.keys(qualityColors)) {
    if (lower.includes(key)) return qualityColors[key];
  }
  return "bg-gray-700 border-gray-500 text-white";
};

const LinkTypeBadge = ({ type }: { type: LinkType }) => {
  if (type === "youtube")
    return (
      <span className="flex items-center gap-1 text-[10px] bg-red-900/60 text-red-300 border border-red-700/50 px-1.5 py-0.5 rounded">
        <Youtube size={9} /> YouTube
      </span>
    );
  if (type === "mega")
    return (
      <span className="flex items-center gap-1 text-[10px] bg-orange-900/40 text-orange-300 border border-orange-700/50 px-1.5 py-0.5 rounded">
        <Zap size={9} /> Mega.nz
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] bg-green-900/40 text-green-300 border border-green-700/50 px-1.5 py-0.5 rounded">
      <HardDrive size={9} /> Direct
    </span>
  );
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  onClose,
  onAddList,
  myList,
  onOpenDownload,
}) => {
  const inList = myList.includes(movie.id || "");
  const [showDownload, setShowDownload] = useState(false);
  const [clickedLink, setClickedLink] = useState<number | null>(null);

  const hasMultiLinks = movie.downloadLinks && movie.downloadLinks.length > 0;
  const hasSingleLink = !!movie.downloadUrl;
  const hasAnyDownload = hasMultiLinks || hasSingleLink;
  const downloadCount = movie.downloadLinks?.length || (hasSingleLink ? 1 : 0);

  const handleDirectDownload = (url: string, idx?: number) => {
    openInNewTab(url);
    if (idx !== undefined) {
      setClickedLink(idx);
      setTimeout(() => setClickedLink(null), 3000);
    }
  };

  const renderVideo = () => {
    const url = movie.videoUrl;
    if (
      movie.videoType === "youtube" ||
      url.includes("youtube.com") ||
      url.includes("youtu.be")
    ) {
      const videoId = getYouTubeId(url);
      const embedUrl = videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
        : url;
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={movie.title}
        />
      );
    }
    if (movie.videoType === "mega" || url.includes("mega.nz")) {
      const embedUrl = getMegaEmbedUrl(url);
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          title={movie.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      );
    }
    return (
      <video src={url} controls autoPlay className="w-full h-full">
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      <div
        className="relative flex flex-col w-full h-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#141414] border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[#E50914] font-black text-xl tracking-wider">KELLYBOX</span>
            <div className="w-px h-6 bg-gray-700" />
            <div>
              <h2 className="text-white font-bold text-base leading-tight">{movie.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {movie.duration}
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star size={11} fill="currentColor" /> {movie.rating}
                </span>
                <span>{movie.year}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* My List */}
            <button
              onClick={() => onAddList(movie)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition-all ${
                inList
                  ? "border-white/60 text-white bg-white/20"
                  : "border-white/30 text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {inList ? <Heart size={13} fill="white" /> : <Plus size={13} />}
              {inList ? "In List" : "My List"}
            </button>

            {/* ─── DOWNLOAD BUTTON in header ─── */}
            {hasAnyDownload && (
              <button
                onClick={() => {
                  // Multiple links → toggle panel
                  // Single link → open directly
                  if (hasMultiLinks) {
                    setShowDownload((v) => !v);
                  } else if (hasSingleLink) {
                    handleDirectDownload(movie.downloadUrl!);
                  }
                }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-semibold transition-all ${
                  showDownload
                    ? "border-green-400 text-green-300 bg-green-900/40 shadow-lg shadow-green-900/30"
                    : "border-green-600 text-green-400 bg-green-900/20 hover:bg-green-900/40 hover:border-green-400"
                }`}
              >
                <Download size={13} />
                {hasSingleLink && !hasMultiLinks ? (
                  <>
                    Download
                    <ExternalLink size={11} className="opacity-70" />
                  </>
                ) : (
                  <>
                    Download
                    <span className="bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                      {downloadCount}
                    </span>
                    {showDownload ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </>
                )}
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1.5 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Multi-link Download Panel (dropdown) ── */}
        {showDownload && hasMultiLinks && (
          <div className="bg-[#0a1a0a] border-b border-green-900/60 px-5 py-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Download size={15} className="text-green-400" />
              <span className="text-green-400 font-bold text-sm">Choose Quality to Download</span>
              <span className="text-gray-500 text-xs">— click any button to open directly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {movie.downloadLinks!.map((dl, i) => {
                const type = getLinkType(dl.url);
                const isClicked = clickedLink === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleDirectDownload(dl.url, i)}
                    className={`flex flex-col gap-1.5 border rounded-xl px-3 py-2.5 transition-all text-left active:scale-95 ${
                      isClicked
                        ? "border-green-500 bg-green-900/30 shadow-lg shadow-green-900/30"
                        : "border-gray-700 bg-gray-800/60 hover:border-green-600 hover:bg-gray-700/80 hover:shadow-md hover:shadow-green-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${getQualityColor(dl.label)}`}>
                        {dl.label}
                      </span>
                      <LinkTypeBadge type={type} />
                    </div>
                    {dl.size && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <HardDrive size={9} /> {dl.size}
                      </span>
                    )}
                    <div className={`flex items-center gap-1 mt-0.5 ${isClicked ? "text-green-300" : "text-green-400"}`}>
                      {isClicked ? (
                        <><CheckCircle size={11} /><span className="text-[11px] font-semibold">Opening...</span></>
                      ) : (
                        <><Download size={11} /><span className="text-[11px] font-semibold">Download</span><ExternalLink size={9} className="opacity-60 ml-auto" /></>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {onOpenDownload && (
              <button
                onClick={onOpenDownload}
                className="mt-3 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
              >
                <ExternalLink size={11} /> View full download page
              </button>
            )}
          </div>
        )}

        {/* ── Single-link Download Panel ── */}
        {showDownload && !hasMultiLinks && hasSingleLink && (() => {
          const url = movie.downloadUrl!;
          const label = movie.downloadLabel || "Download";
          const type = getLinkType(url);
          return (
            <div className="bg-[#0a1a0a] border-b border-green-900/60 px-5 py-4 flex-shrink-0">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-shrink-0 w-10 h-10 bg-green-900/40 border border-green-700/50 rounded-xl flex items-center justify-center">
                  <Download size={18} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-400 font-bold text-sm">Download Available</span>
                    <LinkTypeBadge type={type} />
                  </div>
                  <p className="text-gray-400 text-xs mb-3 flex items-center gap-1">
                    <Shield size={10} className="text-green-500" />
                    {type === "youtube" && "Opens YouTube — use y2mate.com or 9xbuddy.in to download"}
                    {type === "mega" && "Opens Mega.nz directly — click Download on the Mega page"}
                    {type === "direct" && "Click to download directly to your device"}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleDirectDownload(url)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm px-5 py-2.5 rounded-lg font-bold transition-all hover:shadow-lg hover:shadow-green-900/50 hover:-translate-y-0.5 active:scale-95"
                    >
                      <Download size={15} />
                      {label}
                      <ExternalLink size={12} className="opacity-70" />
                    </button>
                    {type === "youtube" && (
                      <>
                        <button
                          onClick={() => openInNewTab("https://y2mate.com")}
                          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-800/50 bg-blue-900/20 px-3 py-2 rounded-lg transition-colors"
                        >
                          <ExternalLink size={11} /> y2mate.com
                        </button>
                        <button
                          onClick={() => openInNewTab("https://9xbuddy.in")}
                          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-800/50 bg-blue-900/20 px-3 py-2 rounded-lg transition-colors"
                        >
                          <ExternalLink size={11} /> 9xbuddy.in
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Video Area ── */}
        <div className="flex-1 bg-black relative" style={{ minHeight: "280px" }}>
          {renderVideo()}

          {/* Floating download bar at bottom of video */}
          {hasAnyDownload && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film size={14} className="text-gray-400" />
                <span className="text-gray-300 text-xs font-medium truncate max-w-[200px]">{movie.title}</span>
                {movie.genre.slice(0, 2).map((g) => (
                  <span key={g} className="text-[10px] text-gray-500 bg-gray-800/80 px-1.5 py-0.5 rounded hidden sm:block">
                    {g}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  if (hasMultiLinks) {
                    setShowDownload((v) => !v);
                  } else if (hasSingleLink) {
                    handleDirectDownload(movie.downloadUrl!);
                  }
                }}
                className="flex items-center gap-1.5 bg-green-600/90 hover:bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:shadow-lg hover:shadow-green-900/50 backdrop-blur-sm active:scale-95"
              >
                <Download size={12} />
                {hasMultiLinks ? `Download (${downloadCount})` : "Download"}
                <ExternalLink size={10} className="opacity-70" />
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom Info + Full Download Grid ── */}
        <div className="bg-[#141414] border-t border-gray-800 flex-shrink-0">

          {/* Full download grid always shown at bottom */}
          {hasAnyDownload && (
            <div className="border-b border-gray-800/60 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-green-500 rounded-full" />
                  <Download size={14} className="text-green-400" />
                  <span className="text-green-400 font-bold text-sm">Download</span>
                  {hasMultiLinks && (
                    <span className="text-gray-400 text-xs">— {downloadCount} qualities available</span>
                  )}
                </div>
                {onOpenDownload && hasMultiLinks && (
                  <button
                    onClick={onOpenDownload}
                    className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={11} /> Full page
                  </button>
                )}
              </div>

              {/* Multi-quality grid */}
              {hasMultiLinks ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {movie.downloadLinks!.map((dl, i) => {
                    const type = getLinkType(dl.url);
                    const isClicked = clickedLink === (i + 100);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          openInNewTab(dl.url);
                          setClickedLink(i + 100);
                          setTimeout(() => setClickedLink(null), 3000);
                        }}
                        className={`group flex flex-col gap-1.5 border rounded-xl px-3 py-2.5 transition-all text-left active:scale-95 ${
                          isClicked
                            ? "border-green-500 bg-green-900/20"
                            : "border-gray-700 bg-gray-800/60 hover:border-green-600 hover:bg-gray-700/80 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-900/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${getQualityColor(dl.label)}`}>
                            {dl.label}
                          </span>
                          <LinkTypeBadge type={type} />
                        </div>
                        {dl.size && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <HardDrive size={9} /> {dl.size}
                          </span>
                        )}
                        <div className={`flex items-center gap-1 mt-0.5 ${isClicked ? "text-green-300" : "text-green-400 group-hover:text-green-300"}`}>
                          {isClicked ? (
                            <><CheckCircle size={11} /><span className="text-[11px] font-semibold">Opening...</span></>
                          ) : (
                            <><Play size={11} fill="currentColor" /><span className="text-[11px] font-semibold">Download Now</span><ExternalLink size={9} className="opacity-60 ml-auto" /></>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : hasSingleLink ? (
                /* Single download link */
                <div className="flex items-center gap-3 flex-wrap">
                  {(() => {
                    const url = movie.downloadUrl!;
                    const label = movie.downloadLabel || "Download";
                    const type = getLinkType(url);
                    return (
                      <>
                        <button
                          onClick={() => handleDirectDownload(url)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm px-5 py-2.5 rounded-lg font-bold transition-all hover:shadow-lg hover:shadow-green-900/40 active:scale-95"
                        >
                          <Download size={15} />
                          {label}
                          <ExternalLink size={12} className="opacity-70" />
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg">
                          <AlertCircle size={11} className="text-yellow-400" />
                          <LinkTypeBadge type={type} />
                          {type === "youtube" && <span>Opens YouTube → use y2mate to download</span>}
                          {type === "mega" && <span>Opens Mega.nz → click Download there</span>}
                          {type === "direct" && <span>Direct file download</span>}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : null}
            </div>
          )}

          {/* Movie Info */}
          <div className="px-5 py-3">
            <div className="flex items-start gap-4">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-12 object-cover rounded hidden md:block flex-shrink-0"
                style={{ height: "72px" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                  {movie.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded"
                    >
                      <Tag size={9} /> {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
