import Image from "next/image";

const SOCK_LENGTHS = [
  { label: "No Show",  image: "/socks1.webp"  },
  { label: "Ankle",    image: "/socks2.webp"    },
  { label: "Quarter",  image: "/socks3.webp"  },
  { label: "Half Calf",image: "/socks5.webp"},
  { label: "Calf",     image: "/socks5.webp"     },
  { label: "Knee High",image: "/socks6.webp"},
];

export default function SockLengthGuide() {
  return (
    <section className="w-full flex flex-row">
      {SOCK_LENGTHS.map((sock) => (
        <a
          key={sock.label}

          className="flex-1 flex flex-col group overflow-hidden cursor-pointer relative"
        >
          {/* Image */}
          <div className="relative w-full aspect-2/3 overflow-hidden">
            {sock.image ? (
              <Image
                src={sock.image}
                alt={sock.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9]" />
            )}
          </div>
 
          {/* Label — centered over image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-['Inter'] font-semibold text-sm tracking-[0.2em] uppercase border-b border-transparent group-hover:border-white transition-all duration-300">
              {sock.label}
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}