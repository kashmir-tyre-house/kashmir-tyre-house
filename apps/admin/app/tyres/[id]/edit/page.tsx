"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Brand = { id: string; name: string; logoUrl: string | null };

const CATEGORIES = ["Radial", "Bais", "Solid"] as const;
const VEHICLE_TYPES = [
  "Earthmover",
  "Grader",
  "Loader and dozer",
  "Compactor",
  "Underground",
  "Mobile crane (High-speed)",
  "Mining and Logging",
  "Industrial",
] as const;
const MAX_IMAGES = 10;
const MAX_BROCHURE_SIZE = 2 * 1024 * 1024;

type ExistingBrochure = { name: string; url: string };

type ImageEntry = {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
};

type ExistingImage = {
  id: string;
  url: string;
  imageType: string;
  isPrimaryImage: boolean;
};

type FormValues = {
  name: string;
  brandId: string;
  pattern: string;
  description: string;
  category: string;
  tyreSize: string;
  tyreWeight: string;
  loadIndex: string;
  plyRating: string;
  rim: string;
  treadDepth: string;
  starRating: string;
  tyreType: string;
  application: string;
  vehicleType: string;
  tyreFeatures: string[];
  isActive: boolean;
};

const EMPTY_FORM: FormValues = {
  name: "",
  brandId: "",
  pattern: "",
  description: "",
  category: "",
  tyreSize: "",
  tyreWeight: "",
  loadIndex: "",
  plyRating: "",
  rim: "",
  treadDepth: "",
  starRating: "",
  tyreType: "",
  application: "",
  vehicleType: "",
  tyreFeatures: [],
  isActive: true,
};

export default function EditTyrePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [existingBrochure, setExistingBrochure] = useState<ExistingBrochure | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochureRemoved, setBrochureRemoved] = useState(false);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const [featureDraft, setFeatureDraft] = useState("");

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [productName, setProductName] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<FormValues>(EMPTY_FORM);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Load brands and product data in parallel
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setBrands(data.brands); })
      .catch(() => {})
      .finally(() => setBrandsLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFetchLoading(true);
    setFetchError(null);

    fetch(`/api/tyres/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.ok) throw new Error(data.message ?? "Failed to load product.");
        const p = data.data;
        setProductName(p.name);
        setExistingImages(p.images ?? []);
        setExistingBrochure(p.brochure ?? null);
        setForm({
          name:         p.name ?? "",
          brandId:      p.brand?.id ?? "",
          pattern:      p.pattern ?? "",
          description:  p.description ?? "",
          category:     p.category ?? "",
          tyreSize:     p.tyreSize ?? "",
          tyreWeight:   p.tyreWeight != null ? String(p.tyreWeight) : "",
          loadIndex:    p.loadIndex ?? "",
          plyRating:    p.plyRating ?? "",
          rim:          p.rim ?? "",
          treadDepth:   p.treadDepth ?? "",
          starRating:   p.starRating ?? "",
          tyreType:     p.tyreType ?? "",
          application:  p.application ?? "",
          vehicleType:  p.vehicleType ?? "",
          tyreFeatures: p.tyreFeatures ?? [],
          isActive:     p.isActive ?? true,
        });
      })
      .catch((err) => {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : "Failed to load product.");
      })
      .finally(() => { if (!cancelled) setFetchLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  // ── Image handlers ────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - existingImages.length - images.length;
    const toAdd = files.slice(0, remaining);
    const entries: ImageEntry[] = toAdd.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: existingImages.length === 0 && images.length === 0 && i === 0,
    }));
    setImages((prev) => [...prev, ...entries]);
    e.target.value = "";
  }

  function removeImage(imgId: string) {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== imgId);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) next[0].isPrimary = true;
      return next;
    });
  }

  function setPrimary(imgId: string) {
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imgId })));
  }

  function removeExistingImage(imageId: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setRemovedImageIds((prev) => [...prev, imageId]);
  }

  function handleBrochureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setSaveError("Brochure must be a PDF file.");
      return;
    }
    if (file.size > MAX_BROCHURE_SIZE) {
      setSaveError("Brochure is too large. Maximum 2 MB.");
      return;
    }
    setSaveError(null);
    setBrochureFile(file);
  }

  async function setExistingPrimary(imageId: string) {
    // Snapshot current flags so we can revert if the API call fails.
    const prevExisting = existingImages;
    const prevNew      = images;

    // Optimistic: flip flags locally so the UI updates instantly.
    setExistingImages((curr) =>
      curr.map((img) => ({ ...img, isPrimaryImage: img.id === imageId }))
    );
    // Newly-uploaded images can't also be primary if an existing one is chosen.
    setImages((curr) => curr.map((img) => ({ ...img, isPrimary: false })));

    try {
      const res = await fetch(`/api/tyres/${id}/images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimaryImage: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message ?? "Failed to set primary image.");
      }
    } catch (e) {
      setExistingImages(prevExisting);
      setImages(prevNew);
      setSaveError(e instanceof Error ? e.message : "Failed to set primary image.");
    }
  }

  // ── Feature tag handlers ──────────────────────────────────────────────────────

  function addFeature() {
    const trimmed = featureDraft.trim();
    if (!trimmed || form.tyreFeatures.includes(trimmed)) return;
    set("tyreFeatures", [...form.tyreFeatures, trimmed]);
    setFeatureDraft("");
    featureInputRef.current?.focus();
  }

  function removeFeature(feature: string) {
    set("tyreFeatures", form.tyreFeatures.filter((f) => f !== feature));
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaveError(null);

    if (!form.brandId)            { setSaveError("Please select a brand."); return; }
    if (!form.name.trim())        { setSaveError("Product name is required."); return; }
    if (!form.category)           { setSaveError("Please select a category."); return; }
    if (!form.pattern.trim())     { setSaveError("Pattern is required."); return; }
    if (!form.tyreSize.trim())    { setSaveError("Tyre size is required."); return; }
    if (!form.application.trim()) { setSaveError("Application is required."); return; }

    setSaving(true);
    try {
      const body = {
        brandId:      form.brandId,
        name:         form.name.trim(),
        description:  form.description.trim() || null,
        category:     form.category || null,
        pattern:      form.pattern.trim(),
        tyreSize:     form.tyreSize.trim(),
        tyreWeight:   form.tyreWeight ? parseFloat(form.tyreWeight) : null,
        application:  form.application.trim(),
        vehicleType:  form.vehicleType || null,
        tyreType:     form.tyreType.trim() || null,
        starRating:   form.starRating.trim() || null,
        plyRating:    form.plyRating.trim() || null,
        loadIndex:    form.loadIndex.trim() || null,
        rim:          form.rim.trim() || null,
        treadDepth:   form.treadDepth.trim() || null,
        tyreFeatures: form.tyreFeatures,
        isActive:     form.isActive,
      };

      const res = await fetch(`/api/tyres/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.errors) {
          const first = Object.values(data.errors as Record<string, string[]>)[0]?.[0];
          setSaveError(first ?? data.message ?? "Validation failed.");
        } else {
          setSaveError(data.message ?? "Failed to save product.");
        }
        return;
      }

      if (removedImageIds.length > 0) {
        await Promise.all(
          removedImageIds.map((imageId) =>
            fetch(`/api/tyres/${id}/images/${imageId}`, { method: "DELETE" })
          )
        );
      }

      if (images.length > 0) {
        const fd = new FormData();
        const primaryIdx = Math.max(0, images.findIndex((img) => img.isPrimary));
        fd.append("primaryIndex", String(primaryIdx));
        images.forEach((img, i) => fd.append(`image_${i}`, img.file));
        const imgRes = await fetch(`/api/tyres/${id}/images`, { method: "POST", body: fd });
        const imgData = await imgRes.json();
        if (!imgData.ok) {
          setSaveError(imgData.message ?? "Failed to upload images.");
          return;
        }
      }

      // Brochure: a new file replaces (and deletes) any existing one; removing
      // an existing brochure without a replacement deletes it.
      if (brochureFile) {
        const bfd = new FormData();
        bfd.append("brochure", brochureFile);
        const bRes = await fetch(`/api/tyres/${id}/brochure`, { method: "POST", body: bfd });
        const bData = await bRes.json().catch(() => null);
        if (!bRes.ok || !bData?.ok) {
          setSaveError(bData?.message ?? "Failed to upload brochure.");
          return;
        }
      } else if (brochureRemoved && existingBrochure) {
        await fetch(`/api/tyres/${id}/brochure`, { method: "DELETE" });
      }

      router.push("/tyres");
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Fetch error state ─────────────────────────────────────────────────────────

  if (fetchLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-28 mb-20">
          <DotLottieReact autoplay loop src="/lottie/loading-animation.lottie" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-[13px] text-red-500">{fetchError}</p>
        <Link
          className="flex h-9 items-center gap-1.5 rounded-lg border border-(--border) bg-white px-4 text-[13px] font-medium text-(--foreground) transition hover:bg-slate-50"
          href="/tyres"
        >
          <ArrowLeft className="size-3.5" />
          Back to products
        </Link>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            className="flex size-8 items-center justify-center rounded-lg border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50 hover:text-(--foreground)"
            href="/tyres"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-(--foreground)">
              {fetchLoading ? "Loading…" : `Edit: ${productName}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveError ? <p className="text-[13px] text-red-500">{saveError}</p> : null}
          <Link
            className="flex h-9 items-center gap-1.5 rounded-lg border border-(--border) bg-white px-4 text-[13px] font-medium text-(--foreground) transition hover:bg-slate-50"
            href="/tyres"
          >
            Cancel
          </Link>
          <button
            className="flex h-9 items-center gap-1.5 min-w-35.25 justify-center rounded-lg bg-(--foreground) px-4 text-[13px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            disabled={saving || fetchLoading}
            onClick={handleSave}
            type="button"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Product information */}
          <Card title="Product Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Product Name" required className="sm:col-span-2">
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. XDR Minemaster 40"
                  type="text"
                  value={form.name}
                />
              </Field>

              <Field label="Brand" required>
                <CustomSelect
                  disabled={fetchLoading}
                  loading={brandsLoading}
                  onChange={(v) => set("brandId", v)}
                  options={brands.map((b) => ({ value: b.id, label: b.name, icon: b.logoUrl ?? undefined }))}
                  placeholder="Select brand"
                  value={form.brandId}
                />
              </Field>

              <Field label="Pattern" required>
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("pattern", e.target.value)}
                  placeholder="e.g. XDR"
                  type="text"
                  value={form.pattern}
                />
              </Field>

              <Field label="Description" className="sm:col-span-2 mb-[-6]">
                <textarea
                  className={`${textareaCls} resize-none`}
                  disabled={fetchLoading}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Optional product description…"
                  rows={3}
                  value={form.description}
                />
              </Field>
            </div>
          </Card>

          {/* Specifications */}
          <Card title="Specifications">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Category" required>
                <CustomSelect
                  disabled={fetchLoading}
                  onChange={(v) => {
                    set("category", v);
                    if (v === "Radial") set("plyRating", "");
                    if (v === "Bais") set("starRating", "");
                  }}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  placeholder="Select category"
                  value={form.category}
                />
              </Field>

              <Field label="Tyre Size" required>
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("tyreSize", e.target.value)}
                  placeholder="e.g. 27.00 R49"
                  type="text"
                  value={form.tyreSize}
                />
              </Field>

              <Field label="Tyre Weight (kg)">
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  min="0"
                  onChange={(e) => set("tyreWeight", e.target.value)}
                  placeholder="e.g. 540.00"
                  step="0.01"
                  type="number"
                  value={form.tyreWeight}
                />
              </Field>

              <Field label="Load Index">
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("loadIndex", e.target.value)}
                  placeholder="e.g. 210A2"
                  type="text"
                  value={form.loadIndex}
                />
              </Field>

              <Field label="Rim">
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("rim", e.target.value)}
                  placeholder="e.g. 22.5 x 9.00"
                  type="text"
                  value={form.rim}
                />
              </Field>

              <Field label="Tread Depth">
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("treadDepth", e.target.value)}
                  placeholder="e.g. 24 mm"
                  type="text"
                  value={form.treadDepth}
                />
              </Field>

              <Field label="Ply Rating">
                <input
                  className={inputCls}
                  disabled={fetchLoading || (form.category !== "Bais" && form.category !== "Solid")}
                  onChange={(e) => set("plyRating", e.target.value)}
                  placeholder={form.category === "Radial" ? "Available for Bais or Solid" : "e.g. 16PR"}
                  type="text"
                  value={form.plyRating}
                />
              </Field>

              <Field label="Star Rating">
                <input
                  className={inputCls}
                  disabled={fetchLoading || (form.category !== "Radial" && form.category !== "Solid")}
                  onChange={(e) => set("starRating", e.target.value)}
                  placeholder={form.category === "Bais" ? "Available for Radial or Solid" : "e.g. 3★"}
                  type="text"
                  value={form.starRating}
                />
              </Field>

              <Field label="Tyre Type" className="sm:col-span-2 lg:col-span-3">
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("tyreType", e.target.value)}
                  placeholder="e.g. Tubeless, Tube-type"
                  type="text"
                  value={form.tyreType}
                />
              </Field>
            </div>
          </Card>

          {/* Application */}
          <Card title="Application">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Application" required>
                <input
                  className={inputCls}
                  disabled={fetchLoading}
                  onChange={(e) => set("application", e.target.value)}
                  placeholder="e.g. Mining, Construction"
                  type="text"
                  value={form.application}
                />
              </Field>

              <Field label="Vehicle Type">
                <CustomSelect
                  disabled={fetchLoading}
                  onChange={(v) => set("vehicleType", v)}
                  options={VEHICLE_TYPES.map((v) => ({ value: v, label: v }))}
                  placeholder="Select vehicle type"
                  value={form.vehicleType}
                />
              </Field>
            </div>
          </Card>

          {/* Features */}
          <Card title="Tyre Features">
            <div className="flex gap-2">
              <input
                ref={featureInputRef}
                className={`${inputCls} flex-1`}
                disabled={fetchLoading}
                onChange={(e) => setFeatureDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addFeature(); }
                }}
                placeholder="e.g. Self-cleaning tread"
                type="text"
                value={featureDraft}
              />
              <button
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-(--border) bg-white px-3 text-[13px] font-medium text-(--foreground) transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                disabled={fetchLoading}
                onClick={addFeature}
                type="button"
              >
                <Plus className="size-3.5" />
                Add
              </button>
            </div>

            {form.tyreFeatures.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.tyreFeatures.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-1.5 rounded-lg border border-(--border) bg-slate-50 py-1 pl-3 pr-2 text-[12px] font-medium text-(--foreground)"
                  >
                    {f}
                    <button
                      aria-label={`Remove ${f}`}
                      className="flex size-4 items-center justify-center rounded-full text-(--muted-foreground) transition hover:bg-slate-200 hover:text-(--foreground)"
                      onClick={() => removeFeature(f)}
                      type="button"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[12px] text-(--muted-foreground)">
                No features added yet. Press Enter or click Add.
              </p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 self-start lg:sticky lg:top-2 lg:max-h-[calc(100dvh-104px)] lg:overflow-y-auto">
          {/* Status */}
          <Card title="Status">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-(--foreground)">Active</p>
                <p className="text-[12px] text-(--muted-foreground)">Visible on the public site</p>
              </div>
              <Toggle
                checked={form.isActive}
                disabled={fetchLoading}
                onChange={(v) => set("isActive", v)}
              />
            </label>
          </Card>

          {/* Images */}
          <Card title={`Images (${existingImages.length + images.length}/${MAX_IMAGES})`}>
            <div className="flex flex-col gap-3">
              {existingImages.length + images.length < MAX_IMAGES ? (
                <>
                  <button
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-(--border) py-6 text-(--muted-foreground) transition hover:border-slate-400 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                    disabled={fetchLoading}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <ImagePlus className="size-6 opacity-50" />
                    <span className="text-[12px] font-medium">Click to upload</span>
                    <span className="text-[11px] opacity-60">PNG, JPG, WEBP — max {MAX_IMAGES} images</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    type="file"
                  />
                </>
              ) : null}

              {existingImages.length > 0 || images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-(--border) bg-slate-100"
                    >
                      <TyreThumbnail src={img.url} />
                      {img.isPrimaryImage ? (
                        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                          <Star className="size-2.5" />
                          Primary
                        </span>
                      ) : null}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {!img.isPrimaryImage ? (
                          <button
                            className="flex items-center gap-1 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-(--foreground) transition hover:bg-white"
                            onClick={() => setExistingPrimary(img.id)}
                            type="button"
                          >
                            <Star className="size-3" />
                            Set primary
                          </button>
                        ) : null}
                        <button
                          className="flex items-center gap-1 rounded-md bg-red-500/90 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-red-500"
                          onClick={() => removeExistingImage(img.id)}
                          type="button"
                        >
                          <X className="size-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-(--border) bg-slate-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="Tyre preview" className="size-full object-cover" src={img.previewUrl} />
                      {img.isPrimary ? (
                        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                          <Star className="size-2.5" />
                          Primary
                        </span>
                      ) : null}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {!img.isPrimary ? (
                          <button
                            className="flex items-center gap-1 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-(--foreground) transition hover:bg-white"
                            onClick={() => setPrimary(img.id)}
                            type="button"
                          >
                            <Star className="size-3" />
                            Set primary
                          </button>
                        ) : null}
                        <button
                          className="flex items-center gap-1 rounded-md bg-red-500/90 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-red-500"
                          onClick={() => removeImage(img.id)}
                          type="button"
                        >
                          <X className="size-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {existingImages.length === 0 && images.length === 0 ? (
                <p className="text-center text-[12px] text-(--muted-foreground)">
                  No images uploaded yet.
                </p>
              ) : null}

              <p className="text-[11px] text-(--muted-foreground)">
                The <strong>primary</strong> image is shown as the hero on product pages. Hover any image to change it.
              </p>
            </div>
          </Card>

          {/* Brochure */}
          <Card title="Brochure">
            <div className="flex flex-col gap-3">
              {brochureFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-slate-50 p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-white text-(--muted-foreground)">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-(--foreground)">
                      {brochureFile.name}
                    </p>
                    <p className="text-[11px] text-(--muted-foreground)">
                      {(brochureFile.size / 1024 / 1024).toFixed(2)} MB · replaces current
                    </p>
                  </div>
                  <button
                    aria-label="Remove selected brochure"
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-(--muted-foreground) transition hover:bg-slate-200 hover:text-(--foreground)"
                    onClick={() => setBrochureFile(null)}
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : existingBrochure && !brochureRemoved ? (
                <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-slate-50 p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-white text-(--muted-foreground)">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-(--foreground)">
                      {existingBrochure.name}
                    </p>
                    <a
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-(--muted-foreground) transition hover:text-(--foreground)"
                      href={existingBrochure.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Download className="size-3" />
                      Download
                    </a>
                  </div>
                  <button
                    aria-label="Remove brochure"
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-(--muted-foreground) transition hover:bg-slate-200 hover:text-red-600"
                    disabled={fetchLoading}
                    onClick={() => setBrochureRemoved(true)}
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-(--border) py-6 text-(--muted-foreground) transition hover:border-slate-400 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                    disabled={fetchLoading}
                    onClick={() => brochureInputRef.current?.click()}
                    type="button"
                  >
                    <FileText className="size-6 opacity-50" />
                    <span className="text-[12px] font-medium">Click to upload PDF</span>
                    <span className="text-[11px] opacity-60">PDF — max 2 MB</span>
                  </button>
                  <input
                    ref={brochureInputRef}
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleBrochureChange}
                    type="file"
                  />
                </>
              )}
              <p className="text-[11px] text-(--muted-foreground)">
                Optional. Shown as a download button on the product page.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Shared style helpers ──────────────────────────────────────────────────────

const inputBaseCls =
  "w-full rounded-lg border border-(--border) bg-white px-3 text-[13px] text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition focus:border-(--foreground) focus:ring-2 focus:ring-(--foreground)/8 disabled:cursor-not-allowed disabled:bg-[#f9fafb] disabled:text-(--muted-foreground) disabled:opacity-70";

const inputCls = `h-9 ${inputBaseCls}`;
const textareaCls = `py-2 ${inputBaseCls}`;

// ── Sub-components ────────────────────────────────────────────────────────────

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  loading,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: string }[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        className={[
          "flex h-9 w-full items-center justify-between rounded-lg border border-(--border) bg-white px-3 text-[13px] transition",
          "outline-none focus:border-(--foreground) focus:ring-2 focus:ring-(--foreground)/8",
          open ? "border-(--foreground) ring-2 ring-(--foreground)/8" : "",
          selected ? "text-(--foreground)" : "text-(--muted-foreground)",
          disabled ? "cursor-not-allowed bg-[#f9fafb] opacity-70" : "",
        ].join(" ")}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-4 shrink-0 rounded object-contain" src={selected.icon} />
          ) : null}
          <span className="truncate">
            {loading ? "Loading…" : (selected?.label ?? placeholder)}
          </span>
        </span>
        <ChevronDown
          className={[
            "ml-2 size-3.5 shrink-0 text-(--muted-foreground) transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open ? (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto rounded-lg border border-(--border) bg-white py-1 shadow-lg shadow-black/8">
          {options.length === 0 ? (
            <li className="px-3 py-2 text-[12px] text-(--muted-foreground)">No options</li>
          ) : (
            options.map((opt) => (
              <li key={opt.value}>
                <button
                  className={[
                    "flex w-full items-center gap-2 px-3 py-2 text-[13px] transition hover:bg-slate-50",
                    opt.value === value ? "font-medium text-(--foreground)" : "text-(--foreground)",
                  ].join(" ")}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  type="button"
                >
                  {opt.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="size-4 shrink-0 rounded object-contain" src={opt.icon} />
                  ) : null}
                  <span className="flex-1 truncate text-left">{opt.label}</span>
                  {opt.value === value ? <Check className="size-3.5 shrink-0 text-(--foreground)" /> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-(--border) bg-white">
      <div className="border-b border-(--border) px-5 py-3.5">
        <h2 className="text-[13px] font-semibold text-(--foreground)">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-medium text-(--foreground)">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-checked={checked}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--foreground)",
        checked ? "bg-(--foreground)" : "bg-slate-200",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={[
          "inline-block size-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

function TyreThumbnail({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
          <div className="w-14">
            <DotLottieReact autoplay loop src="/lottie/loading-animation.lottie" />
          </div>
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Tyre"
        className="size-full object-cover"
        onError={() => setLoaded(true)}
        onLoad={() => setLoaded(true)}
        src={src}
      />
    </>
  );
}
