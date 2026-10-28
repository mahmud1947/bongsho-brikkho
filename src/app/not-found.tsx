import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h2 className="text-4xl font-extrabold text-stone-800">404</h2>
      <p className="text-sm text-stone-600">পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs shadow hover:bg-emerald-800"
      >
        হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}

