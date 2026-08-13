import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#07151A] px-6 text-center text-teal-50">
      <p className="font-display text-sm font-semibold tracking-[0.2em] text-teal-300/90 uppercase">
        FutureCard
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-teal-100/70">
        This URL does not match a page or public card.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-[#042f2e] transition hover:bg-teal-300"
      >
        Go home
      </Link>
    </main>
  );
}
