"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/component/admin/ProductForm";
import StagedVariantList from "@/component/admin/StagedVariantList";
import StagedImageList from "@/component/admin/StagedImageList";
import {
  createAdminProduct,
  createAdminVariant,
  uploadProductImage,
} from "@/api/adminProducts.api";
import { AdminProductInput, StagedImage, StagedVariantInput } from "@/interface/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const EMPTY_PRODUCT: AdminProductInput = {
  name: "",
  slug: "",
  brand: "Kofora",
  short_description: "",
  full_description: "",
  is_active: true,
  is_featured: false,
  is_published: false,
  base_currency: "USD",
  seo_title: "",
  seo_description: "",
  categories: [],
};

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState<StagedVariantInput[]>([]);
  const [images, setImages] = useState<StagedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (values: AdminProductInput) => {
    setSubmitting(true);
    setError("");
    let createdId: number | null = null;
    try {
      const product = await createAdminProduct(values);
      createdId = product.id;

      const representativeByColor = new Map<string, number>();
      for (const variant of variants) {
        const created = await createAdminVariant({ ...variant, product: product.id });
        if (created.color && !representativeByColor.has(created.color)) {
          representativeByColor.set(created.color, created.id);
        }
      }
      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const variantId = image.color ? representativeByColor.get(image.color) ?? null : null;
        const sortOrder = images
          .slice(0, index)
          .filter((item) => (item.color || "") === (image.color || "")).length;
        await uploadProductImage({
          product: product.id,
          image: image.file,
          image_url: image.image_url,
          alt_text: image.alt_text,
          sort_order: sortOrder,
          is_primary: image.is_primary,
          is_active: true,
          variant_id: variantId,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      router.push(`/admin/products/${product.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create product."));
      setSubmitting(false);
      // Product was created but a variant/image step failed — continue on the editor
      // so the work so far isn't lost.
      if (createdId) {
        router.push(`/admin/products/${createdId}`);
      }
    }
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

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-black">New product</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details, add variants and images, then create — everything saves together.
        </p>
      </div>

      <ProductForm
        mode="create"
        initial={EMPTY_PRODUCT}
        submitting={submitting}
        error={error}
        onSubmit={handleCreate}
      >
        <StagedVariantList value={variants} onChange={setVariants} />
        <StagedImageList value={images} onChange={setImages} variants={variants} />
      </ProductForm>
    </div>
  );
}
