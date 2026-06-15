import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-purple-400 italic">RaManga</h2>

        <p className="text-gray-400 mt-4">Create. Publish. Inspire.</p>

        <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-500">
          <Link href="/browse"          className="hover:text-purple-400 transition">Browse</Link>
          <Link href="/creators"        className="hover:text-purple-400 transition">Creators</Link>
          <Link href="/creator/onboard" className="hover:text-purple-400 transition">Write</Link>
          <Link href="/terms"           className="hover:text-purple-400 transition">Terms</Link>
          <Link href="/privacy"         className="hover:text-purple-400 transition">Privacy</Link>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          © {new Date().getFullYear()} RaManga. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
