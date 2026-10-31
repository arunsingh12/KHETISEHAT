import { requireUser } from "@/lib/authz";
import { PeopleList } from "@/components/people/PeopleList";

export default async function CoordinatorPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; status?: string }>;
}) {
  await requireUser(["COORDINATOR"]);
  return <PeopleList base="/coordinator/people" filters={await searchParams} />;
}
