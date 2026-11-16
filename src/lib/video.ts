import { youtubeVideoId } from "./adminValidation";

/** Solo reproduce videos HTTPS del dominio oficial www.youtube.com. */
export function urlDeIncrustacion(url: string | null | undefined): string | null {
  const id = url ? youtubeVideoId(url) : null;
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
