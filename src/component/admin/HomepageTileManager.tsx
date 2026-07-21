"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Save, Trash2, X } from "lucide-react";
import {
  createHomepageTile,
  deleteHomepageTile,
  updateHomepageTile,
} from "@/api/homepageTile.api";
import { DEFAULT_HOMEPAGE_TILES } from "@/data/HomeData";
import { useHomepageTiles } from "@/hooks/useHomepageTiles";
import { HomepageTile, HomepageTileInput } from "@/interface/HomepageTile";
import { getApiErrorMessage } from "@/lib/apiError";

const fallbackImages = new Map(
  DEFAULT_HOMEPAGE_TILES.map((tile) => [tile.key, tile.image])
);

export default function HomepageTileManager() {
  const queryClient = useQueryClient();
  const { data, isLoading, error: queryError } = useHomepageTiles();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const tiles = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [data]
  );

  function startAction() {
    setMessage("");
    setError("");
  }

  function finishAction(messageText: string) {
    queryClient.invalidateQueries({ queryKey: ["homepage-tiles"] });
    setMessage(messageText);
  }

  const createMutation = useMutation({
    mutationFn: createHomepageTile,
    onMutate: startAction,
    onSuccess: () => {
      setAdding(false);
      finishAction("Homepage tile added.");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Failed to add tile.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<HomepageTileInput> }) =>
      updateHomepageTile(id, payload),
    onMutate: startAction,
    onSuccess: () => finishAction("Homepage tile updated."),
    onError: (err) => setError(getApiErrorMessage(err, "Failed to update tile.")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomepageTile,
    onMutate: startAction,
    onSuccess: () => finishAction("Homepage tile deleted."),
    onError: (err) => setError(getApiErrorMessage(err, "Failed to delete tile.")),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedTiles: HomepageTile[]) =>
      Promise.all(
        orderedTiles.map((tile, index) =>
          updateHomepageTile(tile.id, { sort_order: (index + 1) * 10 })
        )
      ),
    onMutate: startAction,
    onSuccess: () => finishAction("Homepage tile order updated."),
    onError: (err) => setError(getApiErrorMessage(err, "Failed to reorder tiles.")),
  });

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending;

  function moveTile(index: number, offset: -1 | 1) {
    const destination = index + offset;
    if (destination < 0 || destination >= tiles.length) return;
    const ordered = [...tiles];
    [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
    reorderMutation.mutate(ordered);
  }

  function confirmDelete(tile: HomepageTile) {
    if (window.confirm(`Delete the "${tile.title}" homepage tile?`)) {
      deleteMutation.mutate(tile.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-gray-500">
          These tiles appear directly below the storefront navigation. Their order here is
          their order on the homepage.
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={busy || adding}
          className="inline-flex items-center gap-2 bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={17} aria-hidden="true" />
          Add tile
        </button>
      </div>

      {(message || error || queryError) && (
        <p className={`text-sm font-semibold ${error || queryError ? "text-red-600" : "text-green-700"}`}>
          {error || (queryError ? getApiErrorMessage(queryError, "Failed to load tiles.") : message)}
        </p>
      )}

      {adding && (
        <NewTileForm
          nextSortOrder={(tiles.at(-1)?.sort_order ?? 0) + 10}
          busy={createMutation.isPending}
          onCancel={() => setAdding(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading homepage tiles...</p>
      ) : tiles.length === 0 ? (
        <div className="border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
          No homepage tiles are active or configured. Add one to restore the section.
        </div>
      ) : (
        <div className="space-y-4">
          {tiles.map((tile, index) => (
            <TileEditor
              key={`${tile.id}:${tile.title}:${tile.href}:${tile.sort_order}:${tile.is_active}:${tile.image ?? ""}`}
              tile={tile}
              fallbackImage={fallbackImages.get(tile.key)}
              busy={busy}
              first={index === 0}
              last={index === tiles.length - 1}
              onMoveUp={() => moveTile(index, -1)}
              onMoveDown={() => moveTile(index, 1)}
              onDelete={() => confirmDelete(tile)}
              onSave={(payload) => updateMutation.mutate({ id: tile.id, payload })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NewTileForm({
  nextSortOrder,
  busy,
  onCancel,
  onSubmit,
}: {
  nextSortOrder: number;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (payload: HomepageTileInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [altText, setAltText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !href.trim() || !image) {
      setError("Title, destination, and image are required.");
      return;
    }
    setError("");
    onSubmit({
      title: title.trim(),
      href: href.trim(),
      alt_text: altText.trim(),
      sort_order: nextSortOrder,
      is_active: true,
      image,
    });
  }

  return (
    <form onSubmit={submit} className="border border-gray-300 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-black">Add homepage tile</h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel adding tile"
          title="Cancel"
          className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-black"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Title" value={title} onChange={setTitle} placeholder="Summer Edit" />
        <TextField
          label="Destination"
          value={href}
          onChange={setHref}
          placeholder="/collections/women"
        />
        <TextField
          label="Image description"
          value={altText}
          onChange={setAltText}
          placeholder="Optional description for accessibility"
        />
        <label className="space-y-1.5 text-sm font-semibold text-gray-700">
          <span>Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            className="block w-full border border-gray-300 bg-white px-3 py-2 text-sm font-normal file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:font-semibold"
          />
        </label>
      </div>

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
          Add tile
        </button>
      </div>
    </form>
  );
}

function TileEditor({
  tile,
  fallbackImage,
  busy,
  first,
  last,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSave,
}: {
  tile: HomepageTile;
  fallbackImage?: string;
  busy: boolean;
  first: boolean;
  last: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSave: (payload: Partial<HomepageTileInput>) => void;
}) {
  const [title, setTitle] = useState(tile.title);
  const [href, setHref] = useState(tile.href);
  const [altText, setAltText] = useState(tile.alt_text);
  const [sortOrder, setSortOrder] = useState(tile.sort_order);
  const [active, setActive] = useState(tile.is_active);
  const [image, setImage] = useState<File | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      title: title.trim(),
      href: href.trim(),
      alt_text: altText.trim(),
      sort_order: sortOrder,
      is_active: active,
      image,
    });
  }

  const imageSrc = tile.image || fallbackImage;

  return (
    <form onSubmit={submit} className="border border-gray-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.8fr)]">
        <div>
          <div className="relative aspect-[1012/359] overflow-hidden bg-gray-100">
            {imageSrc ? (
              <Image src={imageSrc} alt="" fill sizes="360px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No image
              </div>
            )}
          </div>
          <label className="mt-3 block space-y-1.5 text-sm font-semibold text-gray-700">
            <span>Replace image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
              className="block w-full text-xs font-normal text-gray-500 file:mr-3 file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            />
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-black">{tile.title}</h2>
              <p className="text-xs text-gray-400">Key: {tile.key}</p>
            </div>
            <div className="flex items-center gap-1">
              <IconButton label="Move up" onClick={onMoveUp} disabled={busy || first}>
                <ArrowUp size={18} aria-hidden="true" />
              </IconButton>
              <IconButton label="Move down" onClick={onMoveDown} disabled={busy || last}>
                <ArrowDown size={18} aria-hidden="true" />
              </IconButton>
              <IconButton label="Delete tile" onClick={onDelete} disabled={busy} danger>
                <Trash2 size={18} aria-hidden="true" />
              </IconButton>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Title" value={title} onChange={setTitle} />
            <TextField label="Destination" value={href} onChange={setHref} />
            <TextField
              label="Image description"
              value={altText}
              onChange={setAltText}
            />
            <label className="space-y-1.5 text-sm font-semibold text-gray-700">
              <span>Order</span>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(event) => setSortOrder(Number(event.target.value))}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Visible on homepage
            </label>
            <button
              type="submit"
              disabled={busy || !title.trim() || !href.trim()}
              className="inline-flex items-center gap-2 bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={17} aria-hidden="true" />
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
      />
    </label>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-500 hover:bg-gray-100 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}
