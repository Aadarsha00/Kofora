"use client";

import { useState } from "react";
import { submitContactForm, ContactTopic } from "@/api/contact.api";

const TOPICS: { value: ContactTopic; label: string }[] = [
  { value: "order", label: "Order help" },
  { value: "returns", label: "Returns and exchanges" },
  { value: "sizing", label: "Sizing help" },
  { value: "product", label: "Product question" },
  { value: "general", label: "General question" },
];

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }

  return "Could not send your message. Please try again.";
}

export default function ContactForm({ defaultTopic = "general" }: { defaultTopic?: ContactTopic }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [topic, setTopic] = useState<ContactTopic>(defaultTopic);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");
    setLoading(true);

    try {
      await submitContactForm({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        order_number: orderNumber.trim(),
        topic,
        message: message.trim(),
      });

      setStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setOrderNumber("");
      setTopic(defaultTopic);
      setMessage("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-gray-200 p-5 md:grid-cols-2 md:p-6">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          First name
        </label>
        <input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
          className="w-full border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Last name
        </label>
        <input
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          className="w-full border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Email
        </label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          className="w-full border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Phone
        </label>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          type="tel"
          className="w-full border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Topic
        </label>
        <select
          value={topic}
          onChange={(event) => setTopic(event.target.value as ContactTopic)}
          className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
        >
          {TOPICS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Order number
        </label>
        <input
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          placeholder="Optional"
          className="w-full border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Message
        </label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={6}
          className="w-full resize-none border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
        />
      </div>

      {status === "success" && (
        <p className="bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 md:col-span-2">
          Message sent. We will get back to you soon.
        </p>
      )}

      {status === "error" && (
        <p className="bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-black px-6 py-4 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-60 md:col-span-2"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
