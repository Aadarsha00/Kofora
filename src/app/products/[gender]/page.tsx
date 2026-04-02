import HeroGender from "@/component/Gender/HeroGender";
export default async function ProductPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = await params;

  return (
    <main>
      <HeroGender gender={gender as "women" | "men"} />
    </main>
  );
}