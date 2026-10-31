import { requireUser } from "@/lib/authz";
import { PeopleList } from "@/components/people/PeopleList";

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; status?: string }>;
}) {
  await requireUser(["ADMIN"]);
  return <PeopleList base="/admin/people" filters={await searchParams} />;
}
