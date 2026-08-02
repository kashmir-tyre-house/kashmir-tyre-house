"use client";

import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CLAIM_PHOTO_ACCEPT,
  CLAIM_PHOTO_MAX,
  CLAIM_PHOTO_MAX_BYTES,
  CLAIM_PHOTO_MIN
} from "../lib/claims";

type ClaimImageUploaderProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

const ACCEPT_ATTR = CLAIM_PHOTO_ACCEPT.join(",");
const MAX_MB = Math.round(CLAIM_PHOTO_MAX_BYTES / (1024 * 1024));

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Object URLs for previews — kept in a parallel map keyed by a stable id so we
// can revoke them precisely when a file is removed, avoiding leaks.
type Preview = { id: string; file: File; url: string };

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `photo-${idCounter}`;
}

export function ClaimImageUploader({
  files,
  onChange,
  disabled = false
}: ClaimImageUploaderProps) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rebuild previews whenever the file list identity changes (add/remove/reset).
  useEffect(() => {
    setPreviews((current) => {
      const byFile = new Map(current.map((p) => [p.file, p]));
      const next = files.map(
        (file) =>
          byFile.get(file) ?? {
            id: nextId(),
            file,
            url: URL.createObjectURL(file)
          }
      );
      // Revoke URLs for files that are no longer present.
      for (const prev of current) {
        if (!files.includes(prev.file)) {
          URL.revokeObjectURL(prev.url);
        }
      }
      return next;
    });
  }, [files]);

  // Revoke everything on unmount.
  useEffect(() => {
    return () => {
      setPreviews((current) => {
        for (const p of current) URL.revokeObjectURL(p.url);
        return current;
      });
    };
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const list = Array.from(incoming);
      const accepted: File[] = [];
      const rejected: string[] = [];

      for (const file of list) {
        if (!CLAIM_PHOTO_ACCEPT.includes(file.type)) {
          rejected.push(`${file.name} — unsupported format`);
          continue;
        }
        if (file.size > CLAIM_PHOTO_MAX_BYTES) {
          rejected.push(`${file.name} — larger than ${MAX_MB} MB`);
          continue;
        }
        // Skip obvious duplicates (same name + size).
        const isDuplicate = files.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!isDuplicate) accepted.push(file);
      }

      const room = CLAIM_PHOTO_MAX - files.length;
      const toAdd = accepted.slice(0, Math.max(0, room));

      if (accepted.length > room) {
        rejected.push(`Only ${CLAIM_PHOTO_MAX} photos allowed in total`);
      }

      if (toAdd.length > 0) {
        onChange([...files, ...toAdd]);
      }
      if (rejected.length > 0) {
        setError(rejected[0]);
      }
    },
    [files, onChange]
  );

  function removeAt(index: number) {
    setError(null);
    const next = files.filter((_, i) => i !== index);
    onChange(next);
  }

  const atMax = files.length >= CLAIM_PHOTO_MAX;
  const remaining = Math.max(0, CLAIM_PHOTO_MIN - files.length);

  return (
    <div>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled || atMax ? -1 : 0}
        aria-disabled={disabled || atMax}
        onClick={() => !disabled && !atMax && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !atMax) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !atMax) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && !atMax && e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files);
          }
        }}
        className={[
          "flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed px-6 py-8 text-center transition-colors duration-200",
          atMax
            ? "cursor-not-allowed border-[#ead9c9] bg-[#faf3ec] opacity-70"
            : "cursor-pointer",
          dragging
            ? "border-[#a85d00] bg-[#fff1de]"
            : !atMax
              ? "border-[#e0cbb6] bg-[#fff8f5] hover:border-[#d8b997] hover:bg-[#fff1e3]"
              : ""
        ].join(" ")}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1de] text-[#a85d00]">
          <UploadCloud aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
        </span>
        <p className="mt-3 text-[13px] font-semibold text-[#231a12]">
          {atMax ? "Maximum photos added" : "Drag photos here, or click to browse"}
        </p>
        <p className="mt-1 text-[11.5px] leading-[1.6] text-[#8b7a6c]">
          JPG, PNG or WebP · up to {MAX_MB} MB each · {CLAIM_PHOTO_MIN}–
          {CLAIM_PHOTO_MAX} photos
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="hidden"
          disabled={disabled || atMax}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            // Reset so re-selecting the same file re-triggers change.
            e.target.value = "";
          }}
        />
      </div>

      {/* Counter + guidance */}
      <div className="mt-3 flex items-center justify-between text-[11.5px]">
        <span className="font-semibold text-[#6f6258]">
          {files.length} / {CLAIM_PHOTO_MAX} added
        </span>
        {remaining > 0 ? (
          <span className="font-medium text-[#a85d00]">
            Add at least {remaining} more
          </span>
        ) : (
          <span className="font-medium text-[#0a7d40]">Minimum reached</span>
        )}
      </div>

      {error ? (
        <p className="mt-2 rounded-[10px] border border-[#f3c0c0] bg-[#fff5f5] px-3 py-2 text-[11.5px] font-medium text-[#a82424]">
          {error}
        </p>
      ) : null}

      {/* Thumbnails */}
      {previews.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {previews.map((preview, index) => (
            <li
              key={preview.id}
              className="group relative aspect-square overflow-hidden rounded-[12px] border border-[#ead9c9] bg-[#fff8f5]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={`Claim photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                disabled={disabled}
                onClick={() => removeAt(index)}
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#231a12]/70 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-[#231a12] group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <span className="absolute inset-x-0 bottom-0 truncate bg-[linear-gradient(0deg,rgba(35,26,18,0.72),transparent)] px-2 pb-1 pt-3 text-[9.5px] font-medium text-white/90">
                {formatSize(preview.file.size)}
              </span>
            </li>
          ))}

          {!atMax ? (
            <li>
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-[12px] border-2 border-dashed border-[#e0cbb6] bg-[#fff8f5] text-[#a85d00] transition-colors duration-200 hover:border-[#d8b997] hover:bg-[#fff1e3]"
              >
                <ImagePlus aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                <span className="text-[10.5px] font-semibold">Add more</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
