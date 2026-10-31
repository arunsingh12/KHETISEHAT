import { requireUser } from "@/lib/authz";
import { PersonDetail } from "@/components/people/PersonDetail";

export default async function CoordinatorPersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const viewer = await requireUser(["COORDINATOR"]);
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <PersonDetail base="/coordinator/people" userId={id} viewerRole={viewer.role} justCreated={sp.created === "1"} />;
}
