export interface DownloadLink {
  url: string;
  label: string; // e.g. "1080p HD", "720p", "4K BluRay"
  size?: string; // e.g. "2.1 GB"
  type: "mega" | "youtube" | "direct";
}

export interface Movie {
  id?: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  year: number;
  rating: number;
  duration: string;
  genre: string[];
  type: "movie" | "series";
  videoUrl: string;
  videoType: "youtube" | "mega" | "other";
  downloadUrl?: string;
  downloadLabel?: string;
  downloadLinks?: DownloadLink[];
  featured?: boolean;
  createdAt?: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
