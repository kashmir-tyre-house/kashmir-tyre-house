"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_IMAGES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

type UploadingItem = {
  uid: string;
  file: File;
  previewUrl: string;
  progress: "uploading" | "done" | "error";
  error?: string;
};

export default function GalleryUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  // Maps image DB id → local blob URL so we can render a preview if the R2 URL is broken
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function fetchImages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (!data.ok) throw new Error(data.message ?? "Failed to load gallery.");
      setImages(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchImages(); }, []);

  // ── Upload ─────────────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const available = MAX_IMAGES - images.length - uploading.filter((u) => u.progress === "uploading").length;
    if (available <= 0) return;

    const toUpload = files.slice(0, available).filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_BYTES) return false;
      return true;
    });

    const newItems: UploadingItem[] = toUpload.map((file) => ({
      uid: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: "uploading",
    }));

    setUploading((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => uploadOne(item));
  }

  async function uploadOne(item: UploadingItem) {
    try {
      const form = new FormData();
      form.append("file", item.file);
      form.append("alt", item.file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));

      const res = await fetch("/api/gallery", { method: "POST", body: form });
      const data = await res.json();

      if (!data.ok) throw new Error(data.message ?? "Upload failed.");

      setUploading((prev) => prev.map((u) => u.uid === item.uid ? { ...u, progress: "done" } : u));

      // Store local blob URL so the card renders immediately even if R2 URL isn't public yet
      setLocalPreviews((prev) => ({ ...prev, [data.data.id]: item.previewUrl }));

      // Re-fetch the full list so the grid reflects the actual DB state
      const refreshed = await fetch("/api/gallery").then((r) => r.json());
      if (refreshed.ok) setImages(refreshed.data);
    } catch (err) {
      setUploading((prev) =>
        prev.map((u) =>
          u.uid === item.uid
            ? { ...u, progress: "error", error: err instanceof Error ? err.message : "Upload failed." }
            : u
        )
      );
    } finally {
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.uid !== item.uid));
      }, 2000);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const fakeEvent = { target: { files, value: "" }, currentTarget: { value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(fakeEvent);
  }

  // ── Alt text editing ───────────────────────────────────────────────────────

  function startEditAlt(img: GalleryImage) {
    setEditingId(img.id);
    setEditingAlt(img.alt);
  }

  async function saveAlt(id: string) {
    if (!editingAlt.trim()) return;
    setSavingAlt(true);
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: editingAlt.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setImages((prev) => prev.map((img) => img.id === id ? { ...img, alt: editingAlt.trim() } : img));
      setEditingId(null);
    } catch {
      // keep editing open on error
    } finally {
      setSavingAlt(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function confirmDelete(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Reorder ────────────────────────────────────────────────────────────────

  async function move(index: number, direction: "up" | "down") {
    const next = [...images];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    const reindexed = next.map((img, i) => ({ ...img, sortOrder: i }));
    setImages(reindexed);

    setReordering(true);
    try {
      await fetch("/api/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reindexed.map(({ id, sortOrder }) => ({ id, sortOrder }))),
      });
    } catch {
      // silently revert
      fetchImages();
    } finally {
      setReordering(false);
    }
  }

  const activeUploads = uploading.filter((u) => u.progress === "uploading").length;
  const canUploadMore = images.length + activeUploads < MAX_IMAGES;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-(--foreground)">
            Gallery Upload
          </h1>
          <p className="mt-0.5 text-[12px] text-(--muted-foreground)">
            {images.length} / {MAX_IMAGES} images uploaded
          </p>
        </div>
      </div>

      {/* Upload zone */}
      {canUploadMore ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-(--border) bg-white py-12 transition hover:border-slate-400 hover:bg-slate-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
            <ImagePlus className="size-5 text-(--muted-foreground)" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-(--foreground)">
              Drag & drop images here
            </p>
            <p className="mt-0.5 text-[12px] text-(--muted-foreground)">
              PNG, JPG, WEBP — max 5 MB per file
            </p>
          </div>
          <button
            className="flex h-8 items-center gap-1.5 rounded-lg bg-(--foreground) px-4 text-[12px] font-medium text-white transition hover:opacity-90"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ImagePlus className="size-3.5" />
            Browse files
          </button>
          <input
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            multiple
            onChange={handleFileSelect}
            type="file"
          />
          <p className="text-[11px] text-(--muted-foreground)">
            {MAX_IMAGES - images.length - activeUploads} slot{MAX_IMAGES - images.length - activeUploads !== 1 ? "s" : ""} remaining
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-(--border) bg-[#f9fafb] py-6">
          <p className="text-[13px] text-(--muted-foreground)">
            Gallery is full ({MAX_IMAGES}/{MAX_IMAGES}). Delete an image to upload more.
          </p>
        </div>
      )}

      {/* Uploading queue */}
      {uploading.length > 0 ? (
        <div className="flex flex-col gap-2">
          {uploading.map((item) => (
            <div
              key={item.uid}
              className="flex items-center gap-3 rounded-xl border border-(--border) bg-white p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="size-12 shrink-0 rounded-lg object-cover"
                src={item.previewUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-(--foreground)">
                  {item.file.name}
                </p>
                <p className={[
                  "text-[12px]",
                  item.progress === "error" ? "text-red-500" : "text-(--muted-foreground)",
                ].join(" ")}>
                  {item.progress === "uploading" ? "Uploading…"
                    : item.progress === "done" ? "Done"
                    : item.error ?? "Upload failed"}
                </p>
              </div>
              {item.progress === "uploading" ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-(--muted-foreground)" />
              ) : item.progress === "done" ? (
                <Check className="size-4 shrink-0 text-green-500" />
              ) : (
                <X className="size-4 shrink-0 text-red-500" />
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Gallery grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-28">
            <DotLottieReact autoplay loop src="/lottie/loading-animation.lottie" />
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-[13px] text-red-500">{error}</p>
          <button
            className="rounded-lg border border-(--border) bg-white px-3 py-1.5 text-[13px] font-medium text-(--foreground) transition hover:bg-slate-50"
            onClick={fetchImages}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-(--muted-foreground)">
          <p className="text-[13px]">No images yet. Upload your first gallery image above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group relative flex flex-col gap-2 rounded-xl border border-(--border) bg-white p-2"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                <GalleryThumbnail
                  alt={img.alt}
                  fallback={localPreviews[img.id]}
                  src={img.url}
                />

                {/* Order badge */}
                <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-semibold text-white">
                  {index + 1}
                </span>

                {/* Delete overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg opacity-0 transition-opacity group-hover:opacity-100">
                  {confirmDeleteId === img.id ? (
                    <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                      <p className="text-[11px] font-medium text-white">Delete?</p>
                      <div className="flex gap-1.5">
                        <button
                          className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
                          disabled={deletingId === img.id}
                          onClick={() => confirmDelete(img.id)}
                          type="button"
                        >
                          {deletingId === img.id ? "…" : "Yes"}
                        </button>
                        <button
                          className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-(--foreground) transition hover:bg-white"
                          onClick={() => setConfirmDeleteId(null)}
                          type="button"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="flex size-8 items-center justify-center rounded-full bg-red-500/90 text-white transition hover:bg-red-500"
                      onClick={() => setConfirmDeleteId(img.id)}
                      type="button"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Alt text */}
              {editingId === img.id ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    className="h-7 min-w-0 flex-1 rounded-md border border-(--foreground) bg-white px-2 text-[11px] text-(--foreground) outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveAlt(img.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onChange={(e) => setEditingAlt(e.target.value)}
                    value={editingAlt}
                  />
                  <button
                    className="flex size-7 shrink-0 items-center justify-center rounded-md bg-(--foreground) text-white disabled:opacity-50"
                    disabled={savingAlt}
                    onClick={() => saveAlt(img.id)}
                    type="button"
                  >
                    {savingAlt ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                  </button>
                  <button
                    className="flex size-7 shrink-0 items-center justify-center rounded-md border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50"
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="min-w-0 flex-1 truncate text-[11px] text-(--muted-foreground)" title={img.alt}>
                    {img.alt}
                  </p>
                  <button
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-(--muted-foreground) opacity-0 transition hover:bg-slate-100 hover:text-(--foreground) group-hover:opacity-100"
                    onClick={() => startEditAlt(img)}
                    type="button"
                  >
                    <Pencil className="size-3" />
                  </button>
                </div>
              )}

              {/* Order controls */}
              <div className="flex items-center gap-1">
                <button
                  aria-label="Move up"
                  className="flex h-6 flex-1 items-center justify-center rounded-md border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50 hover:text-(--foreground) disabled:pointer-events-none disabled:opacity-30"
                  disabled={index === 0 || reordering}
                  onClick={() => move(index, "up")}
                  type="button"
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  aria-label="Move down"
                  className="flex h-6 flex-1 items-center justify-center rounded-md border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50 hover:text-(--foreground) disabled:pointer-events-none disabled:opacity-30"
                  disabled={index === images.length - 1 || reordering}
                  onClick={() => move(index, "down")}
                  type="button"
                >
                  <ArrowDown className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDeleteId && !images.find((img) => img.id === confirmDeleteId) ? null : null}
    </div>
  );
}

function GalleryThumbnail({ src, alt, fallback }: { src: string; alt: string; fallback?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
          <div className="w-24">
            <DotLottieReact autoplay loop src="/lottie/loading-animation.lottie" />
          </div>
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className="size-full object-cover"
        onError={(e) => {
          if (fallback && e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback;
          }
          setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        src={src}
      />
    </>
  );
}
