import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbNav } from "@/components/molecules/BreadcrumbNav";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b px-4 lg:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />

      <div className="flex-1">
        <BreadcrumbNav items={breadcrumbs} />
      </div>
    </header>
  );
}
