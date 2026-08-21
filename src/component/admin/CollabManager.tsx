"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Save, Trash2, X } from "lucide-react";
import { createCollab, deleteCollab, updateCollab } from "@/api/collab.api";
import { useCollab, useCollabs } from "@/hooks/useCollabs";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { Collab, CollabInput } from "@/interface/Collab";
import { getApiErrorMessage } from "@/lib/apiError";
import { COLLAB_ROW_PRODUCT_COUNT, collabRowProducts } from "@/lib/collabs";

export default function CollabManager() {
  const queryClient = useQueryClient();
  const { data, isLoading, error: queryError } = useCollabs();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const collabs = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [data]
  );

  function startAction() {
    setMessage("");
    setError("");
  }

  function finishAction(text: string) {
    queryClient.invalidateQueries({ queryKey: ["collabs"] });
    queryClient.invalidateQueries({ queryKey: ["collab"] });
    setMessage(text);
  }

  const createMutation = useMutation({
    mutationFn: createCollab,
    onMutate: startAction,
    onSuccess: () => {
      setAdding(false);
      finishAction("Collab created.");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Failed to create collab.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: Partial<CollabInput> }) =>
      updateCollab(slug, payload),
    onMutate: startAction,
    onSuccess: () => finishAction("Collab updated."),
    onError: (err) => setError(getApiErrorMessage(err, "Failed to update collab.")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollab,
    onMutate: startAction,
    onSuccess: () => finishAction("Collab deleted."),
    onError: (err) => setError(getApiErrorMessage(err, "Failed to delete collab.")),
  });

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  function confirmDelete(collab: Collab) {
    if (window.confirm(`Delete the "${collab.name}" collab? This cannot be undone.`)) {
      deleteMutation.mutate(collab.slug);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-gray-500">
          Partner collections appear as a full-width row on the homepage, directly under the
          comfort promise: the collection card on the left, followed by the first{" "}
          {COLLAB_ROW_PRODUCT_COUNT} of its products. Each also gets its own landing page at
          /collabs/&lt;slug&gt;.
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={busy || adding}
          className="inline-flex items-center gap-2 bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={17} aria-hidden="true" />
          Add collab
        </button>
      </div>

      {(message || error || queryError) && (
        <p
          className={`text-sm font-semibold ${
            error || queryError ? "text-red-600" : "text-green-700"
          }`}
        >
          {error || (queryError ? getApiErrorMessage(queryError, "Failed to load collabs.") : message)}
        </p>
      )}

      {adding && (
        <NewCollabForm
          nextSortOrder={(collabs.at(-1)?.sort_order ?? 0) + 10}
          busy={createMutation.isPending}
          onCancel={() => setAdding(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading collabs...</p>
      ) : collabs.length === 0 ? (
        <div className="border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
          No collabs yet. Add one to show a partner collection on the homepage.
        </div>
      ) : (
        <div className="space-y-4">
          {collabs.map((collab) => (
            <CollabEditor
              key={`${collab.id}:${collab.updated_at}`}
              collab={collab}
              busy={busy}
              onDelete={() => confirmDelete(collab)}
              onSave={(payload) => updateMutation.mutate({ slug: collab.slug, payload })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

function NewCollabForm({
  nextSortOrder,
  busy,
  onCancel,
  onSubmit,
}: {
  nextSortOrder: number;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (payload: CollabInput) => void;
}) {
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      partner_name: partnerName.trim(),
      tagline: tagline.trim(),
      sort_order: nextSortOrder,
      is_active: true,
      show_on_homepage: true,
      banner_image: bannerImage,
    });
  }

  return (
    <form onSubmit={submit} className="border border-gray-300 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-black">Add collab</h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel adding collab"
          title="Cancel"
          className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-black"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Collection name"
          value={name}
          onChange={setName}
          placeholder="Kofora x Marvel"
        />
        <TextField
          label="Partner name"
          value={partnerName}
          onChange={setPartnerName}
          placeholder="Marvel"
        />
        <TextField label="Tagline" value={tagline} onChange={setTagline} placeholder="Suit up." />
        <FileField label="Banner image" onChange={setBannerImage} />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Logo, hero art, colours, dates and products can be filled in after creating.
      </p>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Plus size={17} aria-hidden="true" />
          Add collab
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Edit                                                                */
/* ------------------------------------------------------------------ */

// Datetime-local inputs need "YYYY-MM-DDTHH:mm"; the API returns ISO 8601.
function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function CollabEditor({
  collab,
  busy,
  onDelete,
  onSave,
}: {
  collab: Collab;
  busy: boolean;
  onDelete: () => void;
  onSave: (payload: Partial<CollabInput>) => void;
}) {
  const [name, setName] = useState(collab.name);
  const [partnerName, setPartnerName] = useState(collab.partner_name);
  const [tagline, setTagline] = useState(collab.tagline);
  const [description, setDescription] = useState(collab.description);
  const [accentColor, setAccentColor] = useState(collab.accent_color);
  const [textColor, setTextColor] = useState(collab.text_color);
  const [ctaLabel, setCtaLabel] = useState(collab.cta_label);
  const [startsAt, setStartsAt] = useState(toDateTimeLocal(collab.starts_at));
  const [endsAt, setEndsAt] = useState(toDateTimeLocal(collab.ends_at));
  const [isActive, setIsActive] = useState(collab.is_active);
  const [showOnHomepage, setShowOnHomepage] = useState(collab.show_on_homepage);
  const [sortOrder, setSortOrder] = useState(String(collab.sort_order));
  const [logo, setLogo] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [productsOpen, setProductsOpen] = useState(false);

  function save() {
    onSave({
      name: name.trim(),
      partner_name: partnerName.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      accent_color: accentColor.trim(),
      text_color: textColor.trim(),
      cta_label: ctaLabel.trim(),
      // datetime-local carries no zone; Django applies the project timezone.
      // An empty string clears the date.
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      is_active: isActive,
      show_on_homepage: showOnHomepage,
      sort_order: Number(sortOrder) || 0,
      logo,
      banner_image: bannerImage,
      hero_image: heroImage,
    });
  }

  return (
    <div className="border border-gray-300 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-black">{collab.name}</h3>
          <span
            className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
              collab.is_live ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            {collab.is_live ? "Live" : "Not live"}
          </span>
          <span className="text-xs text-gray-500">{collab.product_count} products</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/collabs/${collab.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-black"
          >
            View
            <ExternalLink size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            aria-label={`Delete ${collab.name}`}
            className="flex h-9 w-9 items-center justify-center border border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Collection name" value={name} onChange={setName} />
        <TextField label="Partner name" value={partnerName} onChange={setPartnerName} />
        <TextField label="Tagline (landing page only)" value={tagline} onChange={setTagline} />
        <TextField label="Button label" value={ctaLabel} onChange={setCtaLabel} />

        <label className="space-y-1.5 text-sm font-semibold text-gray-700 md:col-span-2">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="block w-full border border-gray-300 px-3 py-2 text-sm font-normal"
          />
        </label>

        <ColorField label="Accent colour" value={accentColor} onChange={setAccentColor} />
        <ColorField label="Text colour" value={textColor} onChange={setTextColor} />

        <label className="space-y-1.5 text-sm font-semibold text-gray-700">
          <span>Starts</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            className="block w-full border border-gray-300 px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-gray-700">
          <span>Ends</span>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            className="block w-full border border-gray-300 px-3 py-2 text-sm font-normal"
          />
        </label>

        <ImageField label="Logo" current={collab.logo} onChange={setLogo} />
        <ImageField
          label="Homepage card picture"
          current={collab.banner_image}
          onChange={setBannerImage}
        />
        <ImageField label="Landing page hero" current={collab.hero_image} onChange={setHeroImage} />

        <label className="space-y-1.5 text-sm font-semibold text-gray-700">
          <span>Sort order</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="block w-full border border-gray-300 px-3 py-2 text-sm font-normal"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-5">
        <Checkbox label="Active" checked={isActive} onChange={setIsActive} />
        <Checkbox label="Show on homepage" checked={showOnHomepage} onChange={setShowOnHomepage} />
      </div>

      <div className="mt-5 border-t border-gray-200 pt-5">
        <button
          type="button"
          onClick={() => setProductsOpen((open) => !open)}
          className="text-sm font-semibold text-black underline underline-offset-4"
        >
          {productsOpen ? "Hide products" : `Manage products (${collab.product_count})`}
        </button>
        <p className="mt-1 text-xs text-gray-500">
          The homepage row shows the first {COLLAB_ROW_PRODUCT_COUNT} published products; the
          rest are on the collab&apos;s own page.
        </p>
        {productsOpen && (
          <CollabProductPicker
            slug={collab.slug}
            busy={busy}
            onSave={(productIds) => onSave({ product_ids: productIds })}
          />
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Save size={17} aria-hidden="true" />
          Save changes
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Product picker                                                      */
/* ------------------------------------------------------------------ */

function CollabProductPicker({
  slug,
  busy,
  onSave,
}: {
  slug: string;
  busy: boolean;
  onSave: (productIds: number[]) => void;
}) {
  // The list endpoint omits products to stay light, so the picker pulls the
  // detail record for this one collab.
  const { data: collab, isLoading: collabLoading } = useCollab(slug);
  const [search, setSearch] = useState("");
  const { data: productPage, isLoading } = useAdminProducts({ page_size: 100, search });
  const [selected, setSelected] = useState<number[] | null>(null);

  // Seeded from the saved collab, then owned locally until saved.
  const selectedIds = selected ?? (collab?.products ?? []).map((product) => product.id);

  function toggle(id: number) {
    setSelected(
      selectedIds.includes(id)
        ? selectedIds.filter((value) => value !== id)
        : [...selectedIds, id]
    );
  }

  if (collabLoading) {
    return <p className="mt-4 text-sm text-gray-500">Loading products...</p>;
  }

  const products = productPage?.results ?? [];
  // Saved state, not the pending checkboxes - the row only changes once the
  // selection is saved.
  const rowIds = new Set(collabRowProducts(collab?.products).map((product) => product.id));

  return (
    <div className="mt-4 space-y-3">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products"
        className="block w-full border border-gray-300 px-3 py-2 text-sm"
      />

      <div className="max-h-72 overflow-y-auto border border-gray-200">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : products.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No products match that search.</p>
        ) : (
          products.map((product) => (
            <label
              key={product.id}
              className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2 text-sm last:border-b-0 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={() => toggle(product.id)}
              />
              <span className="flex-1">{product.name}</span>
              {rowIds.has(product.id) && (
                <span className="bg-green-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-green-800">
                  On homepage
                </span>
              )}
              {!product.is_published && (
                <span className="text-[11px] font-semibold uppercase text-gray-400">Draft</span>
              )}
            </label>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          {selectedIds.length} selected &middot; first {COLLAB_ROW_PRODUCT_COUNT} published ones
          fill the homepage row
        </p>
        <button
          type="button"
          onClick={() => onSave(selectedIds)}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Save size={16} aria-hidden="true" />
          Save products
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fields                                                              */
/* ------------------------------------------------------------------ */

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-gray-700">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full border border-gray-300 px-3 py-2 text-sm font-normal"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-gray-700">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#253E38"}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 border border-gray-300"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full border border-gray-300 px-3 py-2 text-sm font-normal"
        />
      </span>
    </label>
  );
}

function FileField({
  label,
  onChange,
}: {
  label: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-gray-700">
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="block w-full border border-gray-300 bg-white px-3 py-2 text-sm font-normal file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:font-semibold"
      />
    </label>
  );
}

function ImageField({
  label,
  current,
  onChange,
}: {
  label: string;
  current: string | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <FileField label={label} onChange={onChange} />
      {current && (
        <div className="relative h-16 w-28 overflow-hidden border border-gray-200 bg-gray-50">
          <Image src={current} alt="" fill sizes="112px" className="object-contain" />
        </div>
      )}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
