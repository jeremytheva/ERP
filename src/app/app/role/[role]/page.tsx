import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE_PROFILES } from "@/lib/firebase/firestore-schema";

interface RolePageProps {
  params: { role: string };
}

export default function RolePage({ params }: RolePageProps) {
  const cookieStore = cookies();
  const defaultComponent =
    cookieStore.get("roleDefaultComponent")?.value ||
    ROLE_PROFILES.find((profile) => profile.id === params.role)?.defaultComponent ||
    "dashboard";

  redirect(`/app/role/${params.role}/${defaultComponent}`);
}
