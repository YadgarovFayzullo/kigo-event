import { redirect } from "next/navigation"

/** No public landing page -- go straight to the operator panel. */
export default function Home() {
  redirect("/tournaments")
}
