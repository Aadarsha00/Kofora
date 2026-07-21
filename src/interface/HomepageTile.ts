export interface HomepageTile {
  id: number;
  key: string;
  title: string;
  href: string;
  image: string | null;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomepageTileInput {
  title: string;
  href: string;
  alt_text?: string;
  sort_order: number;
  is_active: boolean;
  image?: File | null;
}
