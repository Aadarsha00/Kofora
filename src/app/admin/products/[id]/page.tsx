"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import ProductForm from "@/component/admin/ProductForm";
import VariantManager from "@/component/admin/VariantManager";
import ImageManager from "@/component/admin/ImageManager";
import {
  useAdminProduct,
  useDeleteAdminProduct,
  useUpdateAdminProduct,
} from "@/hooks/useAdminProducts";
import { AdminProductInput } from "@/interface/admin";
import { getApiErrorMessage } from "@/lib/apiError";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const router = useRouter();
  const { data: product, isLoading, isError } = useAdminProduct(
    Number.isFinite(productId) ? productId : undefined
  );
  const updateProduct = useUpdateAdminProduct(productId);
  const deleteProduct = useDeleteAdminProduct();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (values: AdminProductInput) => {
    setMessage("");
    setError("");
    updateProduct.mutate(values, {
      onSuccess: () => setMessage("Saved."),
      onError: (err) => setError(getApiErrorMessage(err, "Failed to save product.")),
    });
  };

  const handleDelete = () => {
    if (!product) return;
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteProduct.mutate(productId, {
      onSuccess: () => router.push("/admin/products"),
      onError: (err) => setError(getApiErrorMessage(err, "Failed to delete product.")),
    });
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading product...</p>;
  }

  if (isError || !product) {
    return (
      <div>
        <Link href="/admin/products" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
          <ArrowLeft size={16} />
          Back to products
        </Link>
        <p className="text-sm text-red-600">Product not found.</p>
      </div>
    );
  }

  const initial: AdminProductInput = {
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    short_description: product.short_description,
    full_description: product.full_description,
    is_active: product.is_active,
    is_featured: product.is_featured,
    is_published: product.is_published,
    base_currency: product.base_currency,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    categories: product.categories,
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-3 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">/{product.slug}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteProduct.isPending}
          className="inline-flex items-center gap-2 self-start border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 sm:self-auto"
        >
          <Trash2 size={15} />
          Delete product
        </button>
      </div>

      <div className="space-y-6">
        <ProductForm
          key={product.id}
          mode="edit"
          initial={initial}
          submitting={updateProduct.isPending}
          error={error}
          message={message}
          onSubmit={handleSubmit}
        />

        <VariantManager productId={productId} variants={product.variants} />
        <ImageManager productId={productId} images={product.images} variants={product.variants} />

        <Link
          href={`/collections/${product.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ExternalLink size={15} />
          View on storefront
        </Link>
      </div>
    </div>
  );
}
