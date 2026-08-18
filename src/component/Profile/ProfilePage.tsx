"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Home, LockKeyhole, Mail, MapPin, PackageCheck, Plus, Trash2, Truck, UserRound, X } from "lucide-react";
import { createAddress, getAddresses, getMyOrders } from "@/api/checkout.api";
import { changePassword, deleteAddress, getProfile, updateAddress, updateProfile } from "@/api/profile.api";
import { useAuth } from "@/context/AuthContext";
import { Address, AddressInput, Order } from "@/interface/checkout";
import AddressAutocomplete from "@/component/Checkout/AddressAutocomplete";
import { ParsedAddress } from "@/lib/googleMaps";
import { User } from "@/interface/auth";
import { US_STATES } from "@/data/usStates";

const EMPTY_ADDRESS: AddressInput = {
  full_name: "",
  phone: "",
  company: "",
  country: "US",
  state_province: "",
  city: "",
  postal_code: "",
  address_line_1: "",
  address_line_2: "",
  address_type: "home",
  is_default_shipping: false,
  is_default_billing: false,
  is_active: true,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  returned: "Returned",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return error instanceof Error ? error.message : fallback;
}

function money(currency: string, value: number | string | undefined): string {
  const amount = Number(value ?? 0);
  return `${currency || "USD"} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDeliveryStep(status: string): number {
  if (status === "delivered") return 3;
  if (status === "shipped") return 2;
  if (status === "processing" || status === "paid") return 1;
  return 0;
}

function isConfirmedOrder(order: Order): boolean {
  return order.payment_status === "paid" || ["processing", "shipped", "delivered"].includes(order.fulfillment_status);
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold text-black">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
      />
    </label>
  );
}

// UPS's rating and validation APIs reject the full state name outright, so US
// addresses get a dropdown (storing the 2-letter code directly) instead of a
// free-text field that lets that class of error happen at all.
function USStateField({
  value,
  onChange,
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold text-black">State / Province</span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
      >
        <option value="">State</option>
        {US_STATES.map((state) => (
          <option key={state.code} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function DeliveryProgress({ order }: { order: Order }) {
  const currentStep = getDeliveryStep(order.fulfillment_status);
  const steps = ["Placed", "Processing", "Shipped", "Delivered"];

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`border px-2 py-2 text-xs font-semibold ${
            index <= currentStep ? "border-black text-black" : "border-gray-200 text-gray-400"
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );
}

function OrderPanel({ order }: { order: Order }) {
  return (
    <article className="border border-gray-200 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Order</p>
          <h3 className="mt-1 text-base font-bold text-black">{order.order_number}</h3>
          <p className="mt-1 text-sm text-gray-500">Placed {formatDate(order.created_at)}</p>
        </div>
        <div className="text-sm font-semibold text-black">{money(order.currency, order.grand_total)}</div>
      </div>
      <DeliveryProgress order={order} />
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="bg-gray-100 px-2.5 py-1 text-gray-700">Payment: {STATUS_LABELS[order.payment_status] ?? order.payment_status}</span>
        <span className="bg-gray-100 px-2.5 py-1 text-gray-700">Delivery: {STATUS_LABELS[order.fulfillment_status] ?? order.fulfillment_status}</span>
      </div>
    </article>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading, setAuthUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState<{
    first_name?: string;
    last_name?: string;
    username?: string;
    phone?: string;
    marketing_opt_in?: boolean;
  }>({});
  const [addressForm, setAddressForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "" });

  useEffect(() => {
    // Gate the auth-dependent branch behind mount to keep the first client render
    // identical to SSR output; AuthContext resolves isLoading before hydration
    // finishes for this Suspense-wrapped page, which otherwise mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile, enabled: isAuthenticated });
  const addressesQuery = useQuery({ queryKey: ["addresses"], queryFn: getAddresses, enabled: isAuthenticated });
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: getMyOrders, enabled: isAuthenticated });

  const profileValues = {
    first_name: profileForm.first_name ?? profileQuery.data?.first_name ?? "",
    last_name: profileForm.last_name ?? profileQuery.data?.last_name ?? "",
    username: profileForm.username ?? profileQuery.data?.username ?? "",
    phone: profileForm.phone ?? profileQuery.data?.phone ?? "",
    marketing_opt_in: profileForm.marketing_opt_in ?? Boolean(profileQuery.data?.marketing_opt_in),
  };

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (user: User) => {
      setProfileError("");
      setProfileMessage("Profile updated.");
      setAuthUser(user);
      queryClient.setQueryData(["profile"], user);
      setProfileForm({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        username: user.username ?? "",
        phone: user.phone ?? "",
        marketing_opt_in: Boolean(user.marketing_opt_in),
      });
    },
    onError: (error) => {
      setProfileMessage("");
      setProfileError(getErrorMessage(error, "Profile update failed."));
    },
  });

  const saveAddressMutation = useMutation({
    mutationFn: (payload: AddressInput) =>
      editingAddressId ? updateAddress(editingAddressId, payload) : createAddress(payload),
    onSuccess: () => {
      setAddressError("");
      setAddressMessage(editingAddressId ? "Address updated." : "Address added.");
      setEditingAddressId(null);
      setAddressForm(EMPTY_ADDRESS);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) => {
      setAddressMessage("");
      setAddressError(getErrorMessage(error, "Address save failed."));
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      setAddressMessage("Address deleted.");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) => setAddressError(getErrorMessage(error, "Address delete failed.")),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordError("");
      setPasswordMessage("Password changed.");
      setPasswordForm({ current_password: "", new_password: "" });
    },
    onError: (error) => {
      setPasswordMessage("");
      setPasswordError(getErrorMessage(error, "Password change failed."));
    },
  });

  const addresses = addressesQuery.data ?? [];
  const confirmedOrders = useMemo(() => (ordersQuery.data ?? []).filter(isConfirmedOrder), [ordersQuery.data]);
  const pendingOrders = useMemo(() => (ordersQuery.data ?? []).filter((order) => !isConfirmedOrder(order)), [ordersQuery.data]);

  const updateAddressField = (field: keyof AddressInput, value: string | boolean) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const handleAddressAutocompleteSelect = (parsed: ParsedAddress) => {
    setAddressForm((current) => ({
      ...current,
      address_line_1: parsed.address_line_1 || current.address_line_1,
      city: parsed.city || current.city,
      state_province: parsed.state_province || current.state_province,
      postal_code: parsed.postal_code || current.postal_code,
      country: parsed.country || current.country,
    }));
  };

  const startEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      full_name: address.full_name,
      phone: address.phone,
      company: address.company,
      country: address.country,
      state_province: address.state_province,
      city: address.city,
      postal_code: address.postal_code,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      address_type: address.address_type,
      is_default_shipping: address.is_default_shipping,
      is_default_billing: address.is_default_billing,
      is_active: address.is_active,
    });
  };

  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault();
    profileMutation.mutate(profileValues);
  };

  const handleAddressSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveAddressMutation.mutate(addressForm);
  };

  const handlePasswordSubmit = (event: FormEvent) => {
    event.preventDefault();
    passwordMutation.mutate(passwordForm);
  };

  if (!mounted || isLoading) {
    return <main className="min-h-screen bg-white px-6 py-16 text-sm text-gray-500">Loading profile...</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl border border-gray-200 bg-gray-50 p-8">
          <h1 className="text-2xl font-bold text-black">Sign in to manage your profile</h1>
          <p className="mt-3 text-sm text-gray-600">Profile settings, addresses, password changes, and order tracking are available after login.</p>
          <Link href="/" className="mt-6 inline-block bg-black px-5 py-3 text-sm font-semibold text-white">Go home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
          <ArrowLeft size={16} />
          Back to shopping
        </Link>

        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-black">Profile</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your account details, delivery addresses, password, email preferences, and order tracking.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="border border-gray-200 p-5">
              <div className="mb-5 flex items-center gap-2">
                <UserRound size={18} />
                <h2 className="text-lg font-bold text-black">Personal details</h2>
              </div>
              <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" value={profileValues.first_name} onChange={(value) => setProfileForm((current) => ({ ...current, first_name: value }))} />
                <Field label="Last name" value={profileValues.last_name} onChange={(value) => setProfileForm((current) => ({ ...current, last_name: value }))} />
                <Field label="Username" value={profileValues.username} onChange={(value) => setProfileForm((current) => ({ ...current, username: value }))} />
                <Field label="Phone" value={profileValues.phone} onChange={(value) => setProfileForm((current) => ({ ...current, phone: value }))} />
                <div className="sm:col-span-2 flex items-start gap-3 border border-gray-200 bg-gray-50 p-4">
                  <input
                    id="marketing_opt_in"
                    type="checkbox"
                    checked={profileValues.marketing_opt_in}
                    onChange={(event) => setProfileForm((current) => ({ ...current, marketing_opt_in: event.target.checked }))}
                    className="mt-1"
                  />
                  <label htmlFor="marketing_opt_in" className="text-sm text-gray-700">
                    <span className="font-semibold text-black">Marketing emails</span>
                    <span className="block mt-1">Receive product launches, offers, and Kofora updates. Uncheck this to opt out.</span>
                  </label>
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <button type="submit" disabled={profileMutation.isPending} className="bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                    {profileMutation.isPending ? "Saving..." : "Save profile"}
                  </button>
                  {profileMessage && <span className="text-sm font-semibold text-green-700">{profileMessage}</span>}
                  {profileError && <span className="text-sm font-semibold text-red-600">{profileError}</span>}
                </div>
              </form>
            </section>

            <section className="border border-gray-200 p-5">
              <div className="mb-5 flex items-center gap-2">
                <MapPin size={18} />
                <h2 className="text-lg font-bold text-black">Addresses</h2>
              </div>

              <form onSubmit={handleAddressSubmit} className="mb-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required value={addressForm.full_name} onChange={(value) => updateAddressField("full_name", value)} />
                <Field label="Phone" required value={addressForm.phone} onChange={(value) => updateAddressField("phone", value)} />
                <Field label="Company" value={addressForm.company} onChange={(value) => updateAddressField("company", value)} />
                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold text-black">Category</span>
                  <select
                    value={addressForm.address_type}
                    onChange={(event) => updateAddressField("address_type", event.target.value)}
                    className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold text-black">Address line 1</span>
                  <AddressAutocomplete
                    value={addressForm.address_line_1}
                    onChange={(value) => updateAddressField("address_line_1", value)}
                    onAddressSelect={handleAddressAutocompleteSelect}
                    required
                  />
                </label>
                <Field label="Address line 2" value={addressForm.address_line_2} onChange={(value) => updateAddressField("address_line_2", value)} />
                <Field label="City" required value={addressForm.city} onChange={(value) => updateAddressField("city", value)} />
                {addressForm.country === "US" ? (
                  <USStateField
                    required
                    value={addressForm.state_province}
                    onChange={(value) => updateAddressField("state_province", value)}
                  />
                ) : (
                  <Field label="State / Province" required value={addressForm.state_province} onChange={(value) => updateAddressField("state_province", value)} />
                )}
                <Field label="Postal code" required value={addressForm.postal_code} onChange={(value) => updateAddressField("postal_code", value)} />
                <Field label="Country code" required value={addressForm.country} onChange={(value) => updateAddressField("country", value.toUpperCase().slice(0, 2))} />
                <div className="sm:col-span-2 flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={addressForm.is_default_shipping} onChange={(event) => updateAddressField("is_default_shipping", event.target.checked)} />
                    Default shipping
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={addressForm.is_default_billing} onChange={(event) => updateAddressField("is_default_billing", event.target.checked)} />
                    Default billing
                  </label>
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={saveAddressMutation.isPending} className="inline-flex items-center gap-2 bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                    <Plus size={16} />
                    {editingAddressId ? "Update address" : "Add address"}
                  </button>
                  {editingAddressId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm(EMPTY_ADDRESS);
                      }}
                      className="inline-flex items-center gap-2 border border-gray-300 px-5 py-3 text-sm font-semibold text-black"
                    >
                      <X size={16} />
                      Cancel edit
                    </button>
                  )}
                  {addressMessage && <span className="text-sm font-semibold text-green-700">{addressMessage}</span>}
                  {addressError && <span className="text-sm font-semibold text-red-600">{addressError}</span>}
                </div>
              </form>

              <div className="grid gap-3">
                {addressesQuery.isLoading ? (
                  <p className="text-sm text-gray-500">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <p className="border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">No saved addresses yet.</p>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 p-4">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Home size={16} />
                            <p className="font-bold text-black">{address.full_name}</p>
                            <span className="bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize text-gray-700">{address.address_type}</span>
                            {address.is_default_shipping && <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Default shipping</span>}
                            {address.is_default_billing && <span className="bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Default billing</span>}
                          </div>
                          <p className="text-sm text-gray-600">{address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ""}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.state_province} {address.postal_code}, {address.country}</p>
                          <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditAddress(address)} className="border border-gray-300 px-3 py-2 text-sm font-semibold text-black">Edit</button>
                          <button onClick={() => deleteAddressMutation.mutate(address.id)} className="inline-flex items-center gap-1 border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-gray-200 p-5">
              <div className="mb-5 flex items-center gap-2">
                <LockKeyhole size={18} />
                <h2 className="text-lg font-bold text-black">Password</h2>
              </div>
              <form onSubmit={handlePasswordSubmit} className="grid gap-4">
                <Field label="Current password" type="password" required value={passwordForm.current_password} onChange={(value) => setPasswordForm((current) => ({ ...current, current_password: value }))} />
                <Field label="New password" type="password" required value={passwordForm.new_password} onChange={(value) => setPasswordForm((current) => ({ ...current, new_password: value }))} />
                <button type="submit" disabled={passwordMutation.isPending} className="bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  {passwordMutation.isPending ? "Changing..." : "Change password"}
                </button>
                {passwordMessage && <p className="text-sm font-semibold text-green-700">{passwordMessage}</p>}
                {passwordError && <p className="text-sm font-semibold text-red-600">{passwordError}</p>}
              </form>
            </section>

            <section className="border border-gray-200 p-5">
              <div className="mb-5 flex items-center gap-2">
                <Mail size={18} />
                <h2 className="text-lg font-bold text-black">Email preferences</h2>
              </div>
              <p className="text-sm text-gray-600">
                Marketing emails are currently <span className="font-semibold text-black">{profileValues.marketing_opt_in ? "enabled" : "disabled"}</span>.
              </p>
              <button
                onClick={() => profileMutation.mutate({ marketing_opt_in: !profileValues.marketing_opt_in })}
                className="mt-4 border border-gray-300 px-4 py-2.5 text-sm font-semibold text-black"
              >
                {profileValues.marketing_opt_in ? "Opt out" : "Opt in"}
              </button>
            </section>

            <section className="border border-gray-200 p-5">
              <div className="mb-5 flex items-center gap-2">
                <PackageCheck size={18} />
                <h2 className="text-lg font-bold text-black">Order tracking</h2>
              </div>
              {ordersQuery.isLoading ? (
                <p className="text-sm text-gray-500">Loading orders...</p>
              ) : confirmedOrders.length === 0 ? (
                <div className="border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  No confirmed orders yet.
                  {pendingOrders.length > 0 && <span className="block mt-1">{pendingOrders.length} checkout attempt{pendingOrders.length === 1 ? "" : "s"} awaiting payment.</span>}
                </div>
              ) : (
                <div className="space-y-3">
                  {confirmedOrders.slice(0, 3).map((order) => (
                    <OrderPanel key={order.id} order={order} />
                  ))}
                  <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-black underline">
                    <Truck size={15} />
                    View all orders
                  </Link>
                </div>
              )}
            </section>

            <section className="border border-gray-200 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-green-700" size={18} />
                <div>
                  <h2 className="text-sm font-bold text-black">Account status</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Email verification: <span className="font-semibold text-black">{profileQuery.data?.is_email_verified ? "Verified" : "Not verified"}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-600">Currency: <span className="font-semibold text-black">USD</span></p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
