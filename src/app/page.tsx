import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await protect();

  if (!user) redirect("/login");

  return redirect("/dashboard/summary-report-new");
}
