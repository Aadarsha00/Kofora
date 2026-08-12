"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, CreditCard, Lock, MapPin, ShoppingBag, Truck, WalletCards } from "lucide-react";
import {
  capturePayPalOrder,
  createAddress,
  createOrderFromCart,
  createPayPalOrder,
  createStripeCheckoutSession,
  getAddresses,
  getShippingMethods,
} from "@/api/checkout.api";
import { AddressInput, Order, PaymentProvider } from "@/interface/checkout";
import AddressAutocomplete from "@/component/Checkout/AddressAutocomplete";
import { ParsedAddress } from "@/lib/googleMaps";
import {
  useCart,
  useForceRefetchCart,
  useSetBillingAddress,
  useSetShippingAddress,
  useSetShippingMethod,
} from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { redirectToStripeCheckout } from "@/lib/stripeCheckout";
import { updateAddress } from "@/api/profile.api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

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
  is_default_shipping: true,
  is_default_billing: true,
  is_active: true,
};

function getErrorMessage(error: unknown, fallback: string): string {
  // Prefer the backend's explanation (api_error puts the reason in response.data.message)
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const backendMessage = response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage.trim()) {
      return backendMessage;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function money(currency: string, value: number | string | undefined): string {
  const amount = Number(value ?? 0);
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function isAddressComplete(form: AddressInput): boolean {
  return Boolean(
    form.full_name.trim() &&
      form.phone.trim() &&
      form.address_line_1.trim() &&
      form.city.trim() &&
      form.state_province.trim() &&
      form.postal_code.trim() &&
      form.country.trim().length === 2
  );
}

export default function CheckoutPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const guestItems = useGuestCartStore((state) => state.items);
  const { data: cart, isLoading: cartLoading } = useCart();
  const forceRefetchCart = useForceRefetchCart();
  const setShippingAddress = useSetShippingAddress();
  const setBillingAddress = useSetBillingAddress();
  const setShippingMethod = useSetShippingMethod();

  const [mounted, setMounted] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState("");
  const [addressForm, setAddressForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [previewAddressId, setPreviewAddressId] = useState<number | null>(null);
  const debouncedAddressForm = useDebouncedValue(addressForm, 700);
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("stripe");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [paymentReturnMessage, setPaymentReturnMessage] = useState("");

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    enabled: isAuthenticated,
  });

  const shippingQuery = useQuery({
    queryKey: ["shipping-methods"],
    queryFn: getShippingMethods,
    enabled: isAuthenticated,
  });

  const createAddressMutation = useMutation({ mutationFn: createAddress });
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddressInput }) => updateAddress(id, payload),
  });
  // Separate from the two above so its pending state doesn't flicker the "Pay"
  // button's loading state while it saves quietly in the background.
  const previewAddressMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: AddressInput }) =>
      id ? updateAddress(id, payload) : createAddress(payload),
  });
  const createOrderMutation = useMutation({
    mutationFn: createOrderFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
  const createStripeCheckoutMutation = useMutation({ mutationFn: createStripeCheckoutSession });
  const createPayPalOrderMutation = useMutation({ mutationFn: createPayPalOrder });
  const capturePayPalOrderMutation = useMutation({ mutationFn: capturePayPalOrder });
  const {
    mutate: capturePayPal,
    isPending: isCapturingPayPal,
    isSuccess: didCapturePayPal,
  } = capturePayPalOrderMutation;
  const returnPaymentProvider = searchParams.get("payment_provider");
  const returnStripeSessionId = searchParams.get("session_id");
  const returnOrderId = Number(searchParams.get("order_id"));
  const returnPayPalPaymentId = searchParams.get("paymentId");
  const returnPayPalPayerId = searchParams.get("PayerID");
  const paymentCancelled = searchParams.get("payment_cancelled");
  const stripeReturnMessage =
    returnPaymentProvider === "stripe" && returnStripeSessionId
      ? "Payment submitted. Your order will update when Stripe confirms the payment."
      : "";
  const visiblePaymentReturnMessage = paymentReturnMessage || stripeReturnMessage;

  useEffect(() => {
    // Gate the auth-dependent branch behind mount to keep the first client render
    // identical to SSR output; AuthContext resolves isLoading before hydration
    // finishes for this Suspense-wrapped page, which otherwise mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Shipping is now a live UPS rate, so a cart cached earlier in the session can
  // hold a stale amount. Refetch once on entry so the summary is always current.
  useEffect(() => {
    if (isAuthenticated) forceRefetchCart().catch(() => {});
  }, [isAuthenticated, forceRefetchCart]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (returnPaymentProvider === "paypal") {
      if (!returnOrderId || !returnPayPalPaymentId || !returnPayPalPayerId || isCapturingPayPal || didCapturePayPal) {
        return;
      }

      capturePayPal(
        {
          order_id: returnOrderId,
          provider_payment_id: returnPayPalPaymentId,
          payer_id: returnPayPalPayerId,
        },
        {
          onSuccess: () => {
            setPaymentReturnMessage("PayPal payment captured successfully.");
            queryClient.invalidateQueries({ queryKey: ["cart"] });
          },
          onError: (error) => {
            setSubmitError(getErrorMessage(error, "PayPal payment capture failed."));
          },
        }
      );
    }
  }, [
    capturePayPal,
    didCapturePayPal,
    isAuthenticated,
    isCapturingPayPal,
    queryClient,
    returnOrderId,
    returnPayPalPayerId,
    returnPayPalPaymentId,
    returnPaymentProvider,
    returnStripeSessionId,
  ]);

  const addresses = addressesQuery.data ?? [];
  const shippingMethods = shippingQuery.data ?? [];
  const defaultAddress = addresses.find((address) => address.is_default_shipping) ?? addresses[0];
  const defaultShippingMethod = shippingMethods[0];
  const shouldUseNewAddress = useNewAddress || addresses.length === 0;
  const selectedAddressValue = selectedAddressId || (defaultAddress ? String(defaultAddress.id) : "");
  const selectedShippingValue = selectedShippingMethodId || (defaultShippingMethod ? String(defaultShippingMethod.id) : "");
  const selectedShippingMethod = shippingMethods.find((method) => String(method.id) === selectedShippingValue);

  const items = useMemo(
    () => [...(cart?.variant_items ?? []), ...(cart?.bundle_items ?? [])],
    [cart]
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const currency = cart?.currency ?? "USD";
  const summaryTotals = useMemo(() => {
    const subtotal = Number(cart?.totals.subtotal ?? 0);
    const discount = Number(cart?.totals.discount ?? 0);
    const shipping =
      selectedShippingMethod && cart?.shipping_method !== selectedShippingMethod.id
        ? Number(selectedShippingMethod.base_rate)
        : Number(cart?.totals.shipping ?? selectedShippingMethod?.base_rate ?? 0);
    const taxableAmount = subtotal - discount + shipping;
    const tax =
      selectedShippingMethod && cart?.shipping_method !== selectedShippingMethod.id
        ? roundMoney(taxableAmount * 0.08)
        : Number(cart?.totals.tax ?? 0);
    const total =
      selectedShippingMethod && cart?.shipping_method !== selectedShippingMethod.id
        ? roundMoney(taxableAmount + tax)
        : Number(cart?.totals.total ?? taxableAmount + tax);

    return { subtotal, discount, shipping, tax, total };
  }, [cart, selectedShippingMethod]);

  // A new (unsaved) address has no id to price shipping against, so save it as a
  // draft address as soon as its required fields are filled in - debounced so we're
  // not writing on every keystroke. The sync effect below then previews the live
  // UPS rate against it the same way it does for an already-saved address.
  useEffect(() => {
    if (!mounted || !isAuthenticated || !shouldUseNewAddress) return;
    if (!isAddressComplete(debouncedAddressForm)) return;
    if (previewAddressMutation.isPending) return;

    previewAddressMutation
      .mutateAsync({ id: previewAddressId, payload: debouncedAddressForm })
      .then((saved) => setPreviewAddressId(saved.id))
      .catch(() => {
        // Non-fatal: submit falls back to creating the address fresh.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated, shouldUseNewAddress, debouncedAddressForm, previewAddressId]);

  // Sync the chosen address + method onto the cart so the summary shows the live
  // UPS shipping rate before payment (address is either a saved one or the draft
  // created by the effect above for a new address).
  useEffect(() => {
    if (!mounted || !isAuthenticated || !cart) return;
    if (setShippingAddress.isPending || setShippingMethod.isPending) return;

    const addressId = shouldUseNewAddress ? previewAddressId : Number(selectedAddressValue);
    const methodId = Number(selectedShippingValue);
    if (!addressId || !methodId) return;

    const needsAddress = cart.shipping_address !== addressId;
    const needsMethod = cart.shipping_method !== methodId;
    if (!needsAddress && !needsMethod) return;

    (async () => {
      try {
        if (needsAddress) await setShippingAddress.mutateAsync(addressId);
        if (needsMethod) await setShippingMethod.mutateAsync(methodId);
      } catch {
        // Non-fatal: submit re-syncs and the order recomputes server-side.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mounted,
    isAuthenticated,
    cart?.shipping_address,
    cart?.shipping_method,
    shouldUseNewAddress,
    previewAddressId,
    selectedAddressValue,
    selectedShippingValue,
  ]);

  const isSubmitting =
    createAddressMutation.isPending ||
    updateAddressMutation.isPending ||
    setShippingAddress.isPending ||
    setBillingAddress.isPending ||
    setShippingMethod.isPending ||
    createOrderMutation.isPending ||
    createStripeCheckoutMutation.isPending ||
    createPayPalOrderMutation.isPending ||
    isCapturingPayPal;

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

  const handlePlaceOrder = async () => {
    setSubmitError("");
    setPaymentReturnMessage("");

    if (!cart || itemCount === 0) {
      setSubmitError("Your bag is empty.");
      return;
    }

    const shippingMethodId = Number(selectedShippingValue);
    if (!shippingMethodId) {
      setSubmitError("Select a shipping method.");
      return;
    }

    try {
      let addressId = Number(selectedAddressValue);

      if (shouldUseNewAddress) {
        if (previewAddressId) {
          // Reuse the draft address already saved by the background preview,
          // updated once more here to catch any edits made since the last debounce.
          const updated = await updateAddressMutation.mutateAsync({ id: previewAddressId, payload: addressForm });
          addressId = updated.id;
        } else {
          const createdAddress = await createAddressMutation.mutateAsync(addressForm);
          addressId = createdAddress.id;
        }
      }

      if (!addressId) {
        setSubmitError("Add or select a delivery address.");
        return;
      }

      await setShippingAddress.mutateAsync(addressId);
      await setBillingAddress.mutateAsync(addressId);
      await setShippingMethod.mutateAsync(shippingMethodId);
      const order = await createOrderMutation.mutateAsync(customerNotes);

      const origin = window.location.origin;
      const idempotencyKey = `${paymentProvider}-${order.id}-${Date.now()}`;
      const cancelUrl = `${origin}/checkout?payment_cancelled=1&order_id=${order.id}`;
      const successBaseUrl = `${origin}/checkout/success`;

      if (paymentProvider === "stripe") {
        const transaction = await createStripeCheckoutMutation.mutateAsync({
          order_id: order.id,
          idempotency_key: idempotencyKey,
          success_url: `${successBaseUrl}?provider=stripe&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl,
        });

        if (transaction.provider_payment_id && transaction.checkout_url) {
          await redirectToStripeCheckout(transaction.provider_payment_id, transaction.checkout_url);
          return;
        }
      } else {
        const transaction = await createPayPalOrderMutation.mutateAsync({
          order_id: order.id,
          idempotency_key: idempotencyKey,
          return_url: `${successBaseUrl}?provider=paypal&order_id=${order.id}`,
          cancel_url: cancelUrl,
        });

        if (transaction.checkout_url) {
          window.location.assign(transaction.checkout_url);
          return;
        }
      }

      if (paymentProvider === "stripe") {
        setSubmitError("Stripe checkout could not be started. Please try again.");
        return;
      }

      setPlacedOrder(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Checkout failed. Please review your details and try again."));
    }
  };

  if (!mounted || authLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl text-sm text-gray-500">Loading checkout...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    const guestCount = guestItems.reduce((sum, item) => sum + item.quantity, 0);
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
            <ArrowLeft size={16} />
            Back to bag
          </Link>
          <div className="border border-gray-200 bg-gray-50 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-bold text-black">Log in to checkout</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your guest bag has {guestCount} item{guestCount === 1 ? "" : "s"}. Log in from the account menu and your saved bag will merge into your account cart.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cart" className="bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800">
                Return to bag
              </Link>
              <Link href="/" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-black hover:bg-gray-50">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (placedOrder) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl border border-gray-200 bg-gray-50 p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-black">Order created</h1>
          <p className="mt-2 text-sm text-gray-600">
            Order {placedOrder.order_number} is awaiting payment.
          </p>
          <div className="mt-6 grid gap-3 border-t border-gray-200 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-black">{money(placedOrder.currency, placedOrder.grand_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment status</span>
              <span className="font-semibold capitalize text-black">{placedOrder.payment_status}</span>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800">
              Continue shopping
            </Link>
            <Link href="/cart" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-black hover:bg-gray-50">
              View bag
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const loadingCheckoutData = cartLoading || addressesQuery.isLoading || shippingQuery.isLoading;
  const emptyCart = !loadingCheckoutData && itemCount === 0;

  return (
      <main className="min-h-screen bg-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/cart" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
          <ArrowLeft size={16} />
          Back to bag
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-2 border-b border-gray-200 pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-black">Checkout</h1>
            <p className="mt-2 text-sm text-gray-500">{itemCount} item{itemCount === 1 ? "" : "s"} in your bag</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Lock size={16} />
            Secure checkout
          </div>
        </div>

        {visiblePaymentReturnMessage && (
          <div className="mb-6 border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
            {visiblePaymentReturnMessage}
          </div>
        )}

        {paymentCancelled && (
          <div className="mb-6 border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Payment was cancelled. You can choose a payment method and try again.
          </div>
        )}

        {loadingCheckoutData ? (
          <div className="py-20 text-center text-sm text-gray-500">Loading checkout details...</div>
        ) : emptyCart ? (
          <div className="border border-gray-200 bg-gray-50 p-8 text-center">
            <ShoppingBag className="mx-auto mb-4 text-gray-500" size={28} />
            <p className="text-lg font-semibold text-black">Your bag is empty.</p>
            <Link href="/" className="mt-5 inline-block bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <section className="border-b border-gray-200 pb-8">
                <div className="mb-5 flex items-center gap-3">
                  <MapPin size={20} />
                  <h2 className="text-lg font-bold text-black">Delivery address</h2>
                </div>

                {addresses.length > 0 && (
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block cursor-pointer border p-4 text-sm ${
                          !shouldUseNewAddress && selectedAddressValue === String(address.id)
                            ? "border-black bg-gray-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={!shouldUseNewAddress && selectedAddressValue === String(address.id)}
                          onChange={(event) => {
                            setUseNewAddress(false);
                            setSelectedAddressId(event.target.value);
                          }}
                          className="sr-only"
                        />
                        <span className="block font-semibold text-black">{address.full_name}</span>
                        <span className="mt-1 block leading-5 text-gray-600">
                          {address.address_line_1}
                          {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                          <br />
                          {address.city}, {address.state_province} {address.postal_code}
                        </span>
                        <span className="mt-2 block text-gray-500">{address.phone}</span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(true)}
                      className={`border p-4 text-left text-sm font-semibold ${
                        shouldUseNewAddress ? "border-black bg-gray-50 text-black" : "border-gray-200 text-gray-700"
                      }`}
                    >
                      Use a new address
                    </button>
                  </div>
                )}

                {shouldUseNewAddress && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className="border border-gray-300 px-3 py-3 text-sm" placeholder="Full name" value={addressForm.full_name} onChange={(event) => updateAddressField("full_name", event.target.value)} />
                    <input className="border border-gray-300 px-3 py-3 text-sm" placeholder="Phone" value={addressForm.phone} onChange={(event) => updateAddressField("phone", event.target.value)} />
                    <AddressAutocomplete
                      value={addressForm.address_line_1}
                      onChange={(value) => updateAddressField("address_line_1", value)}
                      onAddressSelect={handleAddressAutocompleteSelect}
                      className="md:col-span-2"
                    />
                    <input className="border border-gray-300 px-3 py-3 text-sm md:col-span-2" placeholder="Address line 2" value={addressForm.address_line_2} onChange={(event) => updateAddressField("address_line_2", event.target.value)} />
                    <input className="border border-gray-300 px-3 py-3 text-sm" placeholder="City" value={addressForm.city} onChange={(event) => updateAddressField("city", event.target.value)} />
                    <input className="border border-gray-300 px-3 py-3 text-sm" placeholder="State / Province" value={addressForm.state_province} onChange={(event) => updateAddressField("state_province", event.target.value)} />
                    <input className="border border-gray-300 px-3 py-3 text-sm" placeholder="Postal code" value={addressForm.postal_code} onChange={(event) => updateAddressField("postal_code", event.target.value)} />
                    <input className="border border-gray-300 px-3 py-3 text-sm" placeholder="Country code" value={addressForm.country} maxLength={2} onChange={(event) => updateAddressField("country", event.target.value.toUpperCase())} />
                  </div>
                )}
              </section>

              <section className="border-b border-gray-200 pb-8">
                <div className="mb-5 flex items-center gap-3">
                  <Truck size={20} />
                  <h2 className="text-lg font-bold text-black">Shipping</h2>
                </div>
                <div className="grid gap-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center justify-between border p-4 text-sm ${
                        selectedShippingValue === String(method.id) ? "border-black bg-gray-50" : "border-gray-200"
                      }`}
                    >
                      <span>
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selectedShippingValue === String(method.id)}
                          onChange={(event) => setSelectedShippingMethodId(event.target.value)}
                          className="sr-only"
                        />
                        <span className="block font-semibold text-black">{method.name}</span>
                        <span className="mt-1 block text-gray-500">{method.code}</span>
                      </span>
                      <span className="font-semibold text-black">
                        {cart?.shipping_method === method.id && cart?.totals?.shipping != null
                          ? money(currency, Number(cart.totals.shipping))
                          : money(currency, method.base_rate)}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="pb-4">
                <div className="mb-5 flex items-center gap-3">
                  <CreditCard size={20} />
                  <h2 className="text-lg font-bold text-black">Payment</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3 border p-4 text-sm ${
                      paymentProvider === "stripe" ? "border-black bg-gray-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_provider"
                      value="stripe"
                      checked={paymentProvider === "stripe"}
                      onChange={() => setPaymentProvider("stripe")}
                      className="sr-only"
                    />
                    <CreditCard size={20} />
                    <span>
                      <span className="block font-semibold text-black">Card</span>
                      <span className="mt-1 block text-gray-500">Secure Stripe checkout</span>
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 border p-4 text-sm ${
                      paymentProvider === "paypal" ? "border-black bg-gray-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_provider"
                      value="paypal"
                      checked={paymentProvider === "paypal"}
                      onChange={() => setPaymentProvider("paypal")}
                      className="sr-only"
                    />
                    <WalletCards size={20} />
                    <span>
                      <span className="block font-semibold text-black">PayPal</span>
                      <span className="mt-1 block text-gray-500">Pay with your PayPal account</span>
                    </span>
                  </label>
                </div>
                <textarea
                  value={customerNotes}
                  onChange={(event) => setCustomerNotes(event.target.value)}
                  rows={3}
                  className="mt-4 w-full border border-gray-300 px-3 py-3 text-sm"
                  placeholder="Delivery notes"
                />
              </section>
            </div>

            <aside className="h-fit border border-gray-200 bg-gray-50 p-6 lg:sticky lg:top-28">
              <h2 className="mb-5 text-lg font-bold text-black">Order summary</h2>
              <div className="mb-5 space-y-4">
                {cart?.variant_items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-black">{item.variant.product_name}</p>
                      <p className="mt-1 text-gray-500">
                        {item.variant.color} / {item.variant.size} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-black">{money(currency, Number(item.variant.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-gray-200 pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-black">{money(currency, summaryTotals.subtotal)}</span>
                </div>
                {summaryTotals.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span className="font-semibold">-{money(currency, summaryTotals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-black">{money(currency, summaryTotals.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-semibold text-black">{money(currency, summaryTotals.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4 text-base">
                  <span className="font-bold text-black">Total</span>
                  <span className="font-bold text-black">{money(currency, summaryTotals.total)}</span>
                </div>
              </div>
              {submitError && <p className="mt-4 text-sm font-semibold text-red-600">{submitError}</p>}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="mt-6 w-full bg-blue-900 py-3 text-sm font-semibold text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Preparing payment..." : `Pay with ${paymentProvider === "stripe" ? "card" : "PayPal"}`}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
