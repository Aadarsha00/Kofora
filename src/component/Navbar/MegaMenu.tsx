"use client";

import Link from "next/link";
import { Category } from "@/interface/Category";
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
      className={`${className} text-black ${mobile ? "" : "hover:underline"}`}
    >
      {link.label}
    </Link>
  );
}

export function MegaMenuPanel({
  sections,
  onNavigate,
}: {
  sections: MegaMenuSection[];
  onNavigate: () => void;
}) {
  return (
    <div className="absolute inset-x-0 top-full z-40 border-t border-gray-100 bg-white shadow-[0_28px_36px_-28px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-row flex-wrap gap-x-16 gap-y-8 px-12.25 py-9">
        {sections.map((section) => (
          <div key={section.title} className="min-w-36">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
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
