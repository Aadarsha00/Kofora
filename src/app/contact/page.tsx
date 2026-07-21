import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact KOFORA",
  description: "Contact KOFORA customer service.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[] }>;
}) {
  const { topic } = await searchParams;
  const defaultTopic = topic === "returns" ? "returns" : "general";

  return (
    <main className="bg-white text-black">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <p className="text-sm font-bold uppercase tracking-normal text-gray-500">Here to help</p>
        <h1 className="mt-4 text-4xl font-black uppercase md:text-6xl">Contact Us</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700">
          The KOFORA team is here for sizing help, order questions, returns, product recommendations, and anything else
          you need before or after checkout.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ContactForm defaultTopic={defaultTopic} />

          <div className="grid gap-6">
          <section className="border border-gray-200 p-6">
            <Mail className="h-6 w-6" strokeWidth={1.6} />
            <h2 className="mt-5 text-xl font-bold uppercase">Email</h2>
            <p className="mt-3 text-sm leading-7 text-gray-700">Send us an email and our customer service team will help.</p>
            <Link href="mailto:contact@kofora.com" className="mt-5 inline-block text-sm font-semibold underline">
              contact@kofora.com
            </Link>
          </section>

          <section className="border border-gray-200 p-6">
            <Phone className="h-6 w-6" strokeWidth={1.6} />
            <h2 className="mt-5 text-xl font-bold uppercase">Customer Services</h2>
            <p className="mt-3 text-sm leading-7 text-gray-700">Call us for support with your order or account.</p>
            <Link href="tel:18446608987" className="mt-5 inline-block text-sm font-semibold underline">
              (844) 660-8987
            </Link>
          </section>
          </div>
        </div>

        <section className="mt-12 bg-[#1e3a35] px-6 py-10 text-white md:px-10">
          <h2 className="text-2xl font-bold uppercase">Need help choosing a size?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-200">
            Check the size guide before ordering, or email us with the style you are considering and we will help you
            choose the right fit.
          </p>
          <Link
            href="/size-chart"
            className="mt-6 inline-block bg-white px-6 py-3 text-sm font-semibold uppercase text-black transition-opacity hover:opacity-90"
          >
            View Size Guide
          </Link>
        </section>
      </section>
    </main>
  );
}
