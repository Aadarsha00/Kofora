'use client'
import { ICartItem } from '@/interface/cart'
import { useCartStore } from '@/store/cartStore'
import { Trash2, Tag } from 'lucide-react'
import Image from 'next/image' // ← added

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem } = useCartStore()

  const total = items.reduce(
    (sum, item: ICartItem) => sum + item.price * item.quantity, 0
  )

  const discount = 3920
  const finalTotal = total - discount

  return (
    <>
      <div
        onClick={closeCart}
        className={`
          fixed inset-0 bg-black/40 z-50
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      />

      <div
        className={`
          fixed top-0 right-0 h-full z-50
          w-full max-w-sm
          bg-white border-l border-gray-200
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-[15px] font-medium text-gray-900">
            Shopping Bag
          </h2>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-16">
              Your bag is empty
            </p>
          ) : (
            items.map((item: ICartItem) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
              />
            ))
          )}
        </div>

        <div className="border-t border-gray-200" />

        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag size={13} className="text-gray-400" />
              <span className="text-xs text-gray-500">Code Applied:</span>
              <span className="text-xs font-medium text-gray-800">
                COMFORT20
              </span>
            </div>
            <span className="text-sm font-medium bg-gray-100 px-2.5 py-1 rounded text-gray-800">
              -USD {discount.toLocaleString()}
            </span>
          </div>

          <button
            className="w-full py-3.5 rounded-md text-sm font-medium text-white tracking-wide transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#253E38' }}
          >
            Checkout · USD {finalTotal.toLocaleString()}
          </button>

          <button className="w-full text-center text-xs text-gray-500 underline hover:text-gray-800 transition-colors">
            View Bag
          </button>
        </div>
      </div>
    </>
  )
}

function CartItem({
  item,
  onRemove,
}: {
  item: ICartItem
  onRemove: () => void
}) {
  const { addItem, decreaseItem } = useCartStore()

  function increment() {
    addItem(item)
  }

  function decrement() {
    if (item.quantity === 1) {
      onRemove()
    } else {
      decreaseItem(item.id) // ← was decreaseItem(item), now correct
    }
  }

  return (
    <div className="flex gap-3 items-start">

      {/* ← was <img>, now <Image> */}
      <div className="relative w-18 h-18 shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="rounded-md object-cover border border-gray-100 bg-gray-50"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-900 leading-snug">
          {item.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 mb-1.5">
          {item.variant}
        </p>

        <div className="flex items-center gap-1.5 mb-2.5">
          {item.originalPrice && (
            <span className="text-xs text-gray-300 line-through">
              USD {item.originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-[13px] font-medium text-gray-800">
            USD {item.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center border border-gray-300 rounded w-fit">
          <button
            onClick={decrement}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base"
          >
            −
          </button>
          <span className="w-7 h-7 flex items-center justify-center text-[13px] font-medium text-gray-800 border-x border-gray-300">
            {item.quantity}
          </span>
          <button
            onClick={increment}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-[13px] font-medium text-gray-900">
          USD {(item.price * item.quantity).toLocaleString()}
        </span>
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
