import { useState, useRef } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Movie, DownloadLink } from "../types";
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Film,
  Youtube,
  Link,
  Save,
  LogOut,
  Shield,
  Star,
  Eye,
  Upload,
  ImageIcon,
  CheckCircle,
  Loader2,
  Download,
  HardDrive,
  PlusCircle,
} from "lucide-react";

interface AdminPanelProps {
  movies: Movie[];
  onClose: () => void;
  onLogout: () => void;
}

const CLOUDINARY_CLOUD_NAME = "dhgwgdmql";
const CLOUDINARY_UPLOAD_PRESET = "image_30p";

const GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy",
  "Crime", "Documentary", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller",
];

const emptyMovie: Omit<Movie, "id"> = {
  title: "",
  description: "",
  posterUrl: "",
  backdropUrl: "",
  year: new Date().getFullYear(),
  rating: 7.0,
  duration: "2h 0m",
  genre: [],
  type: "movie",
  videoUrl: "",
  videoType: "youtube",
  downloadUrl: "",
  downloadLabel: "",
  downloadLinks: [],
  featured: false,
  createdAt: Date.now(),
};

const emptyDownloadLink: DownloadLink = {
  url: "",
  label: "",
  size: "",
  type: "mega",
};

// ─── Cloudinary Upload Hook ───────────────────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
}

// ─── Image Upload Field Component ─────────────────────────────────────────────
interface ImageUploadFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
  previewClass?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  required,
  value,
  onChange,
  previewClass = "h-24 w-16",
}) => {
  const [mode, setMode] = useState<"url" | "upload">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, WebP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be under 10MB");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError("❌ " + msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              mode === "upload"
                ? "bg-[#E50914] text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Upload size={10} className="inline mr-1" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              mode === "url"
                ? "bg-[#E50914] text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Link size={10} className="inline mr-1" />
            URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div>
          {/* Drop Zone */}
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-[#E50914] bg-[#E50914]/10"
                : uploading
                ? "border-gray-600 bg-[#1f1f1f] cursor-not-allowed"
                : "border-gray-700 bg-[#1f1f1f] hover:border-[#E50914]/60 hover:bg-[#E50914]/5"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={28} className="text-[#E50914] animate-spin" />
                <p className="text-gray-300 text-sm font-medium">Uploading to Cloudinary...</p>
                <p className="text-gray-500 text-xs">Please wait</p>
              </div>
            ) : uploadSuccess ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={28} className="text-green-400" />
                <p className="text-green-300 text-sm font-medium">Upload Successful!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E50914]/10 flex items-center justify-center">
                  <ImageIcon size={20} className="text-[#E50914]" />
                </div>
                <p className="text-gray-300 text-sm font-medium">
                  Click to browse or drag & drop
                </p>
                <p className="text-gray-500 text-xs">
                  JPG, PNG, WebP — Max 10MB
                </p>
                <div className="mt-1 flex items-center gap-1.5 bg-[#E50914]/10 border border-[#E50914]/30 rounded px-2 py-1">
                  <span className="text-[10px] text-[#E50914] font-semibold">☁ Cloudinary</span>
                  <span className="text-[10px] text-gray-400">Auto-optimized CDN</span>
                </div>
              </div>
            )}
          </div>
          {uploadError && (
            <p className="mt-1.5 text-red-400 text-xs">{uploadError}</p>
          )}
        </div>
      ) : (
        <div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-[#E50914] text-white rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          <img
            src={value}
            alt="preview"
            className={`${previewClass} object-cover rounded-lg border border-gray-700 flex-shrink-0`}
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            onLoad={(e) => ((e.target as HTMLImageElement).style.display = "")}
          />
          <div className="min-w-0">
            <p className="text-green-400 text-xs font-medium flex items-center gap-1">
              <CheckCircle size={11} /> Image ready
            </p>
            <p className="text-gray-500 text-xs truncate max-w-[200px] mt-0.5">{value}</p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-red-400 hover:text-red-300 text-xs mt-0.5 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Admin Panel ───────────────────────────────────────────────────────────────
const AdminPanel: React.FC<AdminPanelProps> = ({ movies, onClose, onLogout }) => {
  const [form, setForm] = useState<Omit<Movie, "id">>(emptyMovie);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<"list" | "add">("list");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ ...emptyMovie, createdAt: Date.now() });
    setDownloadLinks([]);
    setEditingId(null);
    setError("");
  };

  const addDownloadLink = () => {
    setDownloadLinks((prev) => [...prev, { ...emptyDownloadLink }]);
  };

  const updateDownloadLink = (idx: number, field: keyof DownloadLink, value: string) => {
    setDownloadLinks((prev) =>
      prev.map((dl, i) => (i === idx ? { ...dl, [field]: value } : dl))
    );
  };

  const removeDownloadLink = (idx: number) => {
    setDownloadLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const autoDetectType = (url: string): DownloadLink["type"] => {
    if (url.includes("mega.nz")) return "mega";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    return "direct";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) return setError("Title is required");
    if (!form.posterUrl.trim()) return setError("Poster image is required — upload or paste a URL");
    if (!form.videoUrl.trim()) return setError("Video URL is required");

    setLoading(true);
    try {
      const movieData = {
        title: form.title.trim(),
        description: form.description.trim(),
        posterUrl: form.posterUrl.trim(),
        backdropUrl: form.backdropUrl.trim(),
        year: form.year,
        rating: form.rating,
        duration: form.duration.trim(),
        genre: form.genre,
        type: form.type,
        videoUrl: form.videoUrl.trim(),
        videoType: form.videoType,
        downloadUrl: form.downloadUrl?.trim() || "",
        downloadLabel: form.downloadLabel?.trim() || "",
        downloadLinks: downloadLinks.filter((dl) => dl.url.trim() !== "").map((dl) => ({
          url: dl.url.trim(),
          label: dl.label.trim() || "Download",
          size: dl.size?.trim() || "",
          type: dl.type || autoDetectType(dl.url),
        })),
        featured: form.featured,
        createdAt: Date.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, "movies", editingId), movieData);
        setSuccess("✅ Movie updated successfully!");
      } else {
        await addDoc(collection(db, "movies"), movieData);
        setSuccess("✅ Movie added successfully!");
      }
      resetForm();
      setTab("list");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save.";
      if (msg.includes("permission") || msg.includes("insufficient")) {
        setError("❌ Permission denied. Make sure Firestore rules allow authenticated writes.");
      } else {
        setError("❌ " + msg);
      }
    }
    setLoading(false);
  };

  const handleEdit = (movie: Movie) => {
    setForm({
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      year: movie.year,
      rating: movie.rating,
      duration: movie.duration,
      genre: movie.genre,
      type: movie.type,
      videoUrl: movie.videoUrl,
      videoType: movie.videoType,
      downloadUrl: movie.downloadUrl || "",
      downloadLabel: movie.downloadLabel || "",
      downloadLinks: movie.downloadLinks || [],
      featured: movie.featured || false,
      createdAt: movie.createdAt || Date.now(),
    });
    setDownloadLinks(movie.downloadLinks || []);
    setEditingId(movie.id || null);
    setTab("add");
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "movies", id));
      setSuccess("✅ Deleted successfully!");
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      setError("❌ " + msg);
    }
    setLoading(false);
  };

  const toggleGenre = (genre: string) => {
    setForm((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield size={22} className="text-[#E50914]" />
          <span className="text-white font-bold text-xl">Admin Panel</span>
          <span className="text-xs bg-[#E50914] text-white px-2 py-0.5 rounded font-medium">
            KELLYBOX
          </span>
          <span className="text-xs bg-green-700/40 border border-green-600/50 text-green-400 px-2 py-0.5 rounded">
            🔐 Logged In
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 bg-red-900/20 hover:bg-red-900/40 border border-red-800/50 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <X size={16} /> Close
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#1f1f1f] px-6 py-3 flex gap-6 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Film size={16} className="text-[#E50914]" />
          <span>{movies.filter((m) => m.type === "movie").length} Movies</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Eye size={16} className="text-blue-400" />
          <span>{movies.filter((m) => m.type === "series").length} Series</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Star size={16} className="text-yellow-400" />
          <span>{movies.filter((m) => m.featured).length} Featured</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300 ml-auto">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-400 text-xs">☁ Cloudinary CDN Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-6 bg-[#1a1a1a] flex-shrink-0">
        <button
          onClick={() => { setTab("list"); resetForm(); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "list"
              ? "border-[#E50914] text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Content List ({movies.length})
        </button>
        <button
          onClick={() => setTab("add")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "add"
              ? "border-[#E50914] text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          {editingId ? "✏️ Edit Content" : "➕ Add Content"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* LIST TAB */}
        {tab === "list" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">All Content</h3>
              <button
                onClick={() => { resetForm(); setTab("add"); }}
                className="flex items-center gap-2 bg-[#E50914] hover:bg-[#f40612] text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            {movies.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Film size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No content yet</p>
                <p className="text-sm mt-1">Add your first movie or series</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex items-center gap-4 bg-[#1f1f1f] hover:bg-[#252525] border border-gray-800 rounded-xl p-3 transition-colors"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/100x150/1a1a1a/666?text=?";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm truncate">
                          {movie.title}
                        </p>
                        {movie.featured && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-1.5 py-0.5 rounded">
                            FEATURED
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            movie.type === "series"
                              ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                              : "bg-red-600/20 text-red-400 border border-red-500/40"
                          }`}
                        >
                          {movie.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        <span>{movie.year}</span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star size={10} fill="currentColor" /> {movie.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          {movie.videoType === "youtube" ? (
                            <Youtube size={10} className="text-red-400" />
                          ) : (
                            <Link size={10} className="text-green-400" />
                          )}
                          {movie.videoType}
                        </span>
                        <span className="text-gray-500">{movie.genre.slice(0, 2).join(", ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 p-2 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      {deleteConfirm === movie.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(movie.id!)}
                            className="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-2 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(movie.id!)}
                          className="text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 p-2 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD/EDIT TAB */}
        {tab === "add" && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 space-y-5">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Film size={18} className="text-[#E50914]" />
                {editingId ? "Edit Content" : "Add New Content"}
              </h3>

              {/* Type */}
              <div className="flex gap-3">
                {(["movie", "series"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                      form.type === t
                        ? "bg-[#E50914] border-[#E50914] text-white"
                        : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {t === "movie" ? "🎬 Movie" : "📺 Series"}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Rampage"
                  className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-[#E50914] text-white rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Plot summary..."
                  rows={3}
                  className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-[#E50914] text-white rounded-lg px-4 py-2.5 text-sm outline-none resize-none transition-colors"
                />
              </div>

              {/* ─── Poster Image (Cloudinary Upload) ─── */}
              <ImageUploadField
                label="Poster Image"
                required
                value={form.posterUrl}
                onChange={(url) => setForm((p) => ({ ...p, posterUrl: url }))}
                previewClass="h-28 w-20"
              />

              {/* ─── Backdrop Image (Cloudinary Upload) ─── */}
              <ImageUploadField
                label="Backdrop / Banner Image"
                value={form.backdropUrl}
                onChange={(url) => setForm((p) => ({ ...p, backdropUrl: url }))}
                previewClass="h-20 w-36"
              />

              {/* Video Source */}
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                  Video Source <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  {([
                    { value: "youtube", icon: "🎥", label: "YouTube" },
                    { value: "mega", icon: "☁️", label: "Mega.nz" },
                    { value: "other", icon: "🔗", label: "Direct URL" },
                  ] as const).map((vt) => (
                    <button
                      key={vt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, videoType: vt.value }))}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors border ${
                        form.videoType === vt.value
                          ? "bg-[#E50914]/20 border-[#E50914] text-white"
                          : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {vt.icon} {vt.label}
                    </button>
                  ))}
                </div>
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder={
                    form.videoType === "youtube"
                      ? "https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      : form.videoType === "mega"
                      ? "https://mega.nz/file/... or https://mega.nz/embed/..."
                      : "https://example.com/video.mp4"
                  }
                  className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-[#E50914] text-white rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                />
                <p className="text-gray-600 text-xs mt-1">
                  {form.videoType === "youtube" && "Supports: youtube.com/watch?v=ID or youtu.be/ID"}
                  {form.videoType === "mega" && "Supports: mega.nz/file/... or mega.nz/embed/..."}
                  {form.videoType === "other" && "Any direct video URL or embed link"}
                </p>
              </div>

              {/* ─── Download Links (Multi-Quality) ─── */}
              <div className="bg-[#1a1a1a] border border-green-900/40 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download size={15} className="text-green-400" />
                    <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
                      Download Links
                    </label>
                    <span className="text-gray-500 text-xs font-normal">(optional — add multiple qualities)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addDownloadLink}
                    className="flex items-center gap-1.5 bg-green-800/40 hover:bg-green-700/50 border border-green-700/60 text-green-400 hover:text-green-300 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <PlusCircle size={13} /> Add Link
                  </button>
                </div>

                {downloadLinks.length === 0 ? (
                  <div
                    onClick={addDownloadLink}
                    className="border-2 border-dashed border-green-900/40 rounded-xl p-6 text-center cursor-pointer hover:border-green-700/60 hover:bg-green-900/5 transition-all"
                  >
                    <Download size={24} className="mx-auto mb-2 text-green-800" />
                    <p className="text-gray-500 text-sm">Click to add a download link</p>
                    <p className="text-gray-600 text-xs mt-1">Supports Mega.nz, YouTube, direct .mp4/.mkv</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {downloadLinks.map((dl, idx) => (
                      <div key={idx} className="bg-[#222] border border-gray-700 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs font-medium">Link #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeDownloadLink(idx)}
                            className="text-red-500 hover:text-red-400 p-1 rounded transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* URL */}
                        <div>
                          <label className="block text-gray-500 text-xs mb-1">URL <span className="text-red-400">*</span></label>
                          <input
                            value={dl.url}
                            onChange={(e) => {
                              updateDownloadLink(idx, "url", e.target.value);
                              const detected = autoDetectType(e.target.value);
                              updateDownloadLink(idx, "type", detected);
                            }}
                            placeholder="https://mega.nz/file/... or https://youtu.be/... or direct .mp4"
                            className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-green-500 text-white rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {/* Label */}
                          <div>
                            <label className="block text-gray-500 text-xs mb-1">Quality Label</label>
                            <input
                              value={dl.label}
                              onChange={(e) => updateDownloadLink(idx, "label", e.target.value)}
                              placeholder="1080p HD"
                              className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-green-500 text-white rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                            />
                          </div>

                          {/* Size */}
                          <div>
                            <label className="block text-gray-500 text-xs mb-1 flex items-center gap-1">
                              <HardDrive size={9} /> File Size
                            </label>
                            <input
                              value={dl.size || ""}
                              onChange={(e) => updateDownloadLink(idx, "size", e.target.value)}
                              placeholder="2.1 GB"
                              className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-green-500 text-white rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                            />
                          </div>

                          {/* Type */}
                          <div>
                            <label className="block text-gray-500 text-xs mb-1">Type</label>
                            <select
                              value={dl.type}
                              onChange={(e) => updateDownloadLink(idx, "type", e.target.value as DownloadLink["type"])}
                              className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-green-500 text-white rounded-lg px-2 py-2 text-xs outline-none transition-colors"
                            >
                              <option value="mega">☁️ Mega.nz</option>
                              <option value="youtube">▶️ YouTube</option>
                              <option value="direct">⬇️ Direct</option>
                            </select>
                          </div>
                        </div>

                        {/* Auto-detected badge */}
                        {dl.url && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500">Auto-detected:</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              dl.type === "mega" ? "bg-red-900/30 text-red-400 border border-red-700/50" :
                              dl.type === "youtube" ? "bg-red-900/30 text-red-400 border border-red-700/50" :
                              "bg-green-900/30 text-green-400 border border-green-700/50"
                            }`}>
                              {dl.type === "mega" ? "☁️ MEGA.NZ" : dl.type === "youtube" ? "▶️ YOUTUBE" : "⬇️ DIRECT"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addDownloadLink}
                      className="w-full border border-dashed border-green-800/50 hover:border-green-600/70 text-green-600 hover:text-green-400 text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={13} /> Add Another Quality
                    </button>
                  </div>
                )}

                <p className="text-gray-600 text-xs">
                  💡 Add multiple download links for different qualities (4K, 1080p, 720p, etc.). Users will see all options on the download page.
                </p>
              </div>

              {/* Year, Rating, Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                    Year
                  </label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, year: parseInt(e.target.value) || 2024 }))
                    }
                    min="1900"
                    max="2099"
                    className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-[#E50914] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                    Rating (0-10)
                  </label>
                  <input
                    type="number"
                    value={form.rating}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, rating: parseFloat(e.target.value) || 0 }))
                    }
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-[#E50914] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                    Duration
                  </label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                    placeholder="2h 30m"
                    className="w-full bg-[#2a2a2a] border border-gray-700 focus:border-[#E50914] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="block text-gray-400 text-xs mb-2 font-medium uppercase tracking-wide">
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors border ${
                        form.genre.includes(g)
                          ? "bg-[#E50914] border-[#E50914] text-white"
                          : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.featured ? "bg-[#E50914]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      form.featured ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-gray-300 text-sm">
                  Featured (show in hero banner)
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { resetForm(); setTab("list"); }}
                className="flex-1 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#f40612] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-colors"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Save size={16} />
                    {editingId ? "Update" : "Add Content"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
