"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/interface/Category";
import { Product } from "@/interface/Product";
import { primaryProductImage } from "@/lib/productImages";
import {
  TaxonomyCategoryOption,
  getCapStyleOptions,
  getSockHeightOptions,
  getSockPurposeOptions,
} from "@/lib/productTaxonomy";

export interface MegaMenuLink {
  label: string;
  href: string;
  emphasize?: boolean;
}

export interface MegaMenuSection {
  title: string;
  links: MegaMenuLink[];
}

function sortOptions(options: TaxonomyCategoryOption[]) {
  return [...options].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function toFilterLinks(
  options: TaxonomyCategoryOption[],
  gender: string,
  param: "height" | "purpose" | "style"
): MegaMenuLink[] {
  return sortOptions(options).map((option) => ({
    label: option.label,
    href: `/collections/${gender}?${param}=${option.value}`,
  }));
}

export function getMegaMenuSections(
  categories: Category[] | undefined,
  gender: string,
  genderName: string
): MegaMenuSection[] {
  const heights = getSockHeightOptions(categories);
  const purposes = getSockPurposeOptions(categories);
  const styles = getCapStyleOptions(categories);

  // Gender-specific subcategories from the admin that aren't already part of
  // the height/purpose/style taxonomy columns.
  const taxonomyIds = new Set([...heights, ...purposes, ...styles].map((option) => option.id));
  const genderChildren = (
    categories?.find((category) => category.slug === gender)?.children ?? []
  ).filter((child) => child.is_active !== false && !taxonomyIds.has(child.id));

  const sections: MegaMenuSection[] = [
    {
      title: `Shop ${genderName}`,
      links: [
        { label: `Shop All ${genderName}`, href: `/collections/${gender}`, emphasize: true },
        ...genderChildren.map((child) => ({
          label: child.name,
          href: `/collections/${child.slug}`,
        })),
      ],
    },
  ];

  if (heights.length) {
    sections.push({
      title: "Socks by Height",
      links: [
        ...toFilterLinks(heights, gender, "height"),
        {
          label: "Shop All Socks",
          href: `/collections/${gender}?family=socks`,
          emphasize: true,
        },
      ],
    });
  }

  if (purposes.length) {
    sections.push({
      title: "Collection",
      links: toFilterLinks(purposes, gender, "purpose"),
    });
  }

  if (styles.length) {
    sections.push({
      title: "Caps",
      links: [
        ...toFilterLinks(styles, gender, "style"),
        {
          label: "Shop All Caps",
          href: `/collections/${gender}?family=caps`,
          emphasize: true,
        },
      ],
    });
  }

  return sections;
}

function MenuLink({
  link,
  onNavigate,
  mobile = false,
}: {
  link: MegaMenuLink;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  const className = `${mobile ? "text-sm" : "text-sm no-underline underline-offset-4"} ${
    link.emphasize ? "font-semibold" : ""
  }`;

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={`${className} text-black ${
        mobile
          ? "transition-colors hover:text-[#253E38]"
          : "relative w-fit after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#253E38] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100"
      }`}
    >
      {link.label}
    </Link>
  );
}

function FeaturedProduct({
  product,
  gender,
  genderName,
  loading,
  onNavigate,
}: {
  product?: Product;
  gender: string;
  genderName: string;
  loading: boolean;
  onNavigate: () => void;
}) {
  if (loading) {
    return (
      <div
        aria-label="Loading newest product"
        className="grid min-h-64 grid-cols-[42%_1fr] overflow-hidden rounded-2xl bg-[#F2F0EA]"
      >
        <div className="animate-pulse bg-black/10" />
        <div className="flex flex-col justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-black/10" />
            <div className="h-6 w-full animate-pulse rounded-full bg-black/10" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-black/10" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-full bg-black/10" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <Link
        href={`/collections/${gender}?sort_by=newest`}
        onClick={onNavigate}
        className="group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-2xl bg-[#253E38] p-7 text-white"
      >
        <span
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-white/10"
        />
        <span
          aria-hidden="true"
          className="absolute -right-5 -top-9 h-32 w-32 rounded-full border border-white/15"
        />
        <div className="relative">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/65">
            Freshly added
          </p>
          <h3 className="max-w-xs text-3xl font-black leading-[0.95]">
            Meet the latest {genderName.toLowerCase()} styles.
          </h3>
        </div>
        <span className="relative flex items-center gap-2 text-sm font-bold">
          Shop new arrivals
          <ArrowUpRight
            size={18}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    );
  }

  const activeVariant =
    product.variants.find(
      (variant) => variant.is_active && variant.available_quantity > 0
    ) ??
    product.variants.find((variant) => variant.is_active) ??
    product.variants[0];
  const featuredImage = primaryProductImage(product);
  const productImage = featuredImage?.image ?? activeVariant?.image_override ?? null;
  const numericPrice = Number(activeVariant?.price);
  const price = Number.isFinite(numericPrice)
    ? `${product.base_currency} ${numericPrice.toLocaleString()}`
    : null;
  const href = `/collections/${gender}/${product.slug}?id=${product.id}`;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group grid min-h-64 grid-cols-[42%_1fr] overflow-hidden rounded-2xl bg-[#F2F0EA] text-black transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="relative overflow-hidden bg-[#E6E3DC]">
        {productImage ? (
          <Image
            src={productImage}
            alt={featuredImage?.alt_text || product.name}
            fill
            sizes="(max-width: 1280px) 160px, 220px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#e9e6df,#d7d2c8)]" />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-5 p-6">
        <div>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#60736E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#253E38]" />
            Newest arrival
          </p>
          <h3 className="text-xl font-black leading-tight">{product.name}</h3>
          {product.short_description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-black/55">
              {product.short_description}
            </p>
          )}
          {price && <p className="mt-3 text-sm font-bold">{price}</p>}
        </div>

        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em]">
          View product
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#253E38] text-white transition-transform duration-300 group-hover:translate-x-1">
            <ArrowUpRight size={15} />
          </span>
        </span>
      </div>
    </Link>
  );
}

export function MegaMenuPanel({
  sections,
  gender,
  genderName,
  featuredProduct,
  featuredLoading = false,
  onNavigate,
}: {
  sections: MegaMenuSection[];
  gender: string;
  genderName: string;
  featuredProduct?: Product;
  featuredLoading?: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="absolute inset-x-0 top-full z-40 animate-in border-t border-black/5 bg-white shadow-[0_28px_44px_-24px_rgba(0,0,0,0.28)] fade-in slide-in-from-top-1 duration-200">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-10 px-12.25 py-8">
        <div className="grid min-w-0 grid-cols-2 content-start gap-x-10 gap-y-8 xl:grid-cols-4">
          {sections.map((section) => (
            <div key={section.title} className="min-w-0">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#60736E]">
                {section.title}
              </p>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <MenuLink link={link} onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <FeaturedProduct
          product={featuredProduct}
          gender={gender}
          genderName={genderName}
          loading={featuredLoading}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

export function MobileMegaMenuSections({
  sections,
  onNavigate,
}: {
  sections: MegaMenuSection[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 pb-5">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
            {section.title}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {section.links.map((link) => (
              <li key={`${section.title}-${link.label}`}>
                <MenuLink link={link} onNavigate={onNavigate} mobile />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
