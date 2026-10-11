import {
  redirect,
} from "next/navigation";

import AdminLoginForm from "@/components/admin/AdminLoginForm";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const authenticated =
    await isAdminAuthenticated();

  if (
    authenticated
  ) {
    redirect(
      "/admin",
    );
  }

  return (
    <AdminLoginForm />
  );
}