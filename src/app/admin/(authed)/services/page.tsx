import type { Metadata } from "next";
import { getDemoStore } from "@/lib/demo-store";
import { ServicesEditor } from "@/components/admin/services-editor";

export const metadata: Metadata = { title: "Services & Catalog" };
export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = [...getDemoStore().services].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950">Services &amp; Catalog</h1>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-navy-500">
        Toggle which demo services appear in the booking flow and edit their customer-facing copy.
        Changes apply to temporary demo data and may reset when the server restarts; nothing here
        represents live operator configuration.
      </p>
      <ServicesEditor
        initial={services.map((s) => ({
          id: s.id,
          key: s.key,
          name: s.name,
          tagline: s.tagline,
          description: s.description,
          isActive: s.isActive,
        }))}
      />
    </div>
  );
}
