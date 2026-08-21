import CollabManager from "@/component/admin/CollabManager";

export default function AdminCollabsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-black">Collabs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Limited partner collections - artwork, copy, run dates and the products in each drop.
        </p>
      </div>

      <CollabManager />
    </div>
  );
}
