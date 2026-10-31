import { requireUser } from "@/lib/authz";
import { PersonDetail } from "@/components/people/PersonDetail";

export default async function AdminPersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const viewer = await requireUser(["ADMIN"]);
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <PersonDetail base="/admin/people" userId={id} viewerRole={viewer.role} justCreated={sp.created === "1"} />;
}
