import Image from "next/image";

export default function FootBanner() {
  return (
    <section className="relative w-full h-[700px] overflow-hidden">
      <Image
        src="/foot.webp"
        alt="Grogu socks"
        fill
        className="object-cover object-center"
      />

      {/* Bottom-left dark overlay for text area only */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[180px] bg-gradient-to-t from-black/60 to-transparent" />

      {/* Text content */}
      <div className="absolute bottom-40 left-6 text-white whitespace-nowrap">
        <h2 className="text-4xl font-extrabold uppercase mb-5 tracking-normal">
          Their New Favorites
        </h2>
        <p className="text-xl font-normal leading-snug text-white">
          Vibrant colors and quirky patterns that turn socks into their new favorite toys.
        </p>
      </div>
    </section>
  );
}