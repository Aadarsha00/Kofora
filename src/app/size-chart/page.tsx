import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide | KOFORA",
  description: "KOFORA size guide and apparel sizing conversion chart.",
};

const womenRows = [
  ["INTERNATIONAL", "XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  ["EUROPE", "32", "34", "36", "38", "40", "42", "44"],
  ["US", "0", "2", "4", "6", "8", "10", "12"],
  ['CHEST FIT (INCHES)', '28"', '30"', '32"', '34"', '36"', '38"', '40"'],
  ["CHEST FIT (CM)", "716", "76", "81", "86", "91.5", "96.5", "101.1"],
  ['WAIST FIR (INCHES)', '21"', '23"', '25"', '27"', '29"', '31"', '33"'],
  ["WAIST FIR (CM)", "53.5", "58.5", "63.5", "68.5", "74", "79", "84"],
  ['HIPS FIR (INCHES)', '33"', '34"', '36"', '38"', '40"', '42"', '44"'],
  ["HIPS FIR (CM)", "81.5", "86.5", "91.5", "96.5", "101", "106.5", "111.5"],
  ["SKORT LENGTHS (SM)", "36.5", "38", "39.5", "41", "42.5", "44", "45.5"],
];

const menRows = [
  ["INTERNATIONAL", "XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  ["EUROPE", "32", "34", "36", "38", "40", "42", "44"],
  ["US", "0", "2", "4", "6", "8", "10", "12"],
  ['CHEST FIT (INCHES)', '33-35"', '36-38"', '39-41"', '42-44"', '45-47"', '48-50"', '51-53"'],
  ["CHEST FIT (CM)", "84-89", "91-97", "88-104", "107-112", "114-119", "122-127", "129-134"],
  ['WAIST FIR (INCHES)', '28"', '30"', '32"', '34"', '36"', '38"', '40"'],
  ["WAIST FIR (CM)", "71", "76", "81", "86", "91.5", "96.5", "101.5"],
  ["SKORT LENGTHS (SM)", "76", "77.5", "79", "81", "82.5", "84", "85.5"],
];

function SizeTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="mt-12">
      <h2 className="mb-5 text-lg font-bold uppercase tracking-normal text-black">{title}</h2>
      <div className="overflow-x-auto border border-gray-200">
        <table className="min-w-[820px] w-full border-collapse text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-gray-200 last:border-b-0">
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${cell}-${index}`}
                    className={`border-r border-gray-200 px-4 py-3 last:border-r-0 ${
                      index === 0 ? "w-52 font-semibold text-black" : "text-gray-700"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SizeChartPage() {
  return (
    <main className="w-full bg-white text-black">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <h1 className="text-3xl font-bold uppercase text-black md:text-4xl">Size Guide</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-gray-700">
          This is an approximate conversion table to help you find your size. If you have already purchased an item by
          our brand, we recommend you select the same size as indicated on its label.
        </p>

        <SizeTable title="WOMEN'S APPAREL SIZING" rows={womenRows} />
        <SizeTable title="MEN'S APPAREL SIZING" rows={menRows} />
      </div>
    </main>
  );
}
