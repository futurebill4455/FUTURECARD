import { PageHeader } from "@/components/shared/Navbar";
import { BackgroundAnimationsManager } from "@/components/admin/BackgroundAnimationsManager";
import { dbConnect } from "@/lib/db";
import { listBackgroundAnimations } from "@/lib/db/background-animations";

export default async function AdminBackgroundsPage() {
  await dbConnect();
  let designs: Awaited<ReturnType<typeof listBackgroundAnimations>> = [];
  try {
    designs = await listBackgroundAnimations();
  } catch {
    designs = [];
  }

  return (
    <div>
      <PageHeader
        title="Manage Backgrounds"
        description="Choose which mini-site background animations are available to users and set the global default."
      />
      {designs.length === 0 ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No background designs found. Apply migration{" "}
          <code className="font-mono text-xs">010_background_animations.sql</code>{" "}
          in Supabase, then refresh this page.
        </p>
      ) : (
        <BackgroundAnimationsManager initial={designs} />
      )}
    </div>
  );
}
