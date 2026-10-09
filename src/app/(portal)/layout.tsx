import PortalLayout from "@/components/PortalLayout";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
