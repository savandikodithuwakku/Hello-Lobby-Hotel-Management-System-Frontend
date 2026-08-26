import { useId, useState } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import type { RoomTypeImage } from "../../../shared/api/types.ts";
import {
  buttonSecondary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
} from "../../../shared/ui/styles.ts";

type EditableImage = Pick<RoomTypeImage, "url" | "alt" | "isPrimary">;

interface ImagesEditorProps {
  images: EditableImage[];
  onChange: (images: EditableImage[]) => void;
  max?: number;
}

/**
 * Collects image URLs for a room type and marks one as the primary photo -
 * the one shown in listings.
 *
 * URLs rather than uploads: HelloLobby has no file storage yet, so pictures
 * live wherever they are already hosted. Swapping this for an upload widget
 * later only changes how `url` is produced.
 */
const ImagesEditor = ({ images, onChange, max = 12 }: ImagesEditorProps) => {
  const urlId = useId();
  const altId = useId();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  const add = () => {
    const trimmed = url.trim();
    if (!trimmed || images.length >= max) return;

    if (images.some((image) => image.url === trimmed)) {
      setUrl("");
      return;
    }

    // The first picture added becomes the primary one until told otherwise.
    onChange([...images, { url: trimmed, alt: alt.trim(), isPrimary: images.length === 0 }]);
    setUrl("");
    setAlt("");
  };

  const remove = (target: string) => {
    const next = images.filter((image) => image.url !== target);
    // Removing the primary promotes whatever is now first.
    if (next.length > 0 && !next.some((image) => image.isPrimary)) {
      next[0] = { ...next[0]!, isPrimary: true };
    }
    onChange(next);
  };

  const makePrimary = (target: string) =>
    onChange(images.map((image) => ({ ...image, isPrimary: image.url === target })));

  return (
    <div className={fieldGroup}>
      <span className={fieldLabel}>Images</span>

      <div className="grid grid-cols-1 gap-3 min-[720px]:grid-cols-[2fr_1fr_auto]">
        <input
          id={urlId}
          type="url"
          className={input}
          value={url}
          placeholder="https://example.com/deluxe-room.jpg"
          onChange={(event) => setUrl(event.target.value)}
          aria-label="Image URL"
        />
        <input
          id={altId}
          type="text"
          className={input}
          value={alt}
          placeholder="Short description"
          onChange={(event) => setAlt(event.target.value)}
          aria-label="Image description"
        />
        <button
          type="button"
          className={buttonSecondary}
          onClick={add}
          disabled={!url.trim() || images.length >= max}
        >
          <ImagePlus size={16} aria-hidden="true" /> Add
        </button>
      </div>

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {images.map((image) => (
            <li key={image.url} className="border border-line bg-canvas">
              <img
                src={image.url}
                alt={image.alt || "Room type photograph"}
                className="h-28 w-full object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-2 border-t border-line px-2 py-1.5">
                <button
                  type="button"
                  className={
                    image.isPrimary
                      ? "inline-flex cursor-default items-center gap-1 text-[0.72rem] font-semibold text-amber-400"
                      : "inline-flex cursor-pointer items-center gap-1 text-[0.72rem] text-ink-dim transition-colors duration-300 hover:text-amber-400"
                  }
                  onClick={() => makePrimary(image.url)}
                  aria-label={image.isPrimary ? "Primary image" : "Make this the primary image"}
                >
                  <Star size={12} aria-hidden="true" />
                  {image.isPrimary ? "Primary" : "Set primary"}
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-ink-dim transition-colors duration-300 hover:text-danger"
                  onClick={() => remove(image.url)}
                  aria-label={`Remove ${image.alt || image.url}`}
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className={fieldHint}>
        Paste the address of a hosted image. The primary photo is the one guests see first, and up
        to {max} images can be attached.
      </p>
    </div>
  );
};

export default ImagesEditor;
