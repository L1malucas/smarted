// Root page, redirects to login or a default tenant dashboard if implemented
import { redirect } from "next/navigation"
// import { authService } from "@/services/auth" // If you want to check auth here

export default async function HomePage() {
  // const user = await authService.getCurrentUser();
  // if (user && user.defaultTenantSlug) { // Assuming user might have a default tenant
  //   redirect(`/${user.defaultTenantSlug}/dashboard`);
  // }
  redirect("/login")
}
