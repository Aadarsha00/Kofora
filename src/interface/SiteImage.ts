export interface SiteImage {
  id: number;
  key: string;
  /** Absolute URL of the uploaded picture, or null when the slot holds only a video. */
  image: string | null;
  /** Absolute URL of the uploaded video, for slots that support one (e.g. the hero). */
  video: string | null;
  alt_text: string;
}
