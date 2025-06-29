import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Calendar,
  Scissors,
  Users,
  ChevronDown,
  LogOut,
  UserCheck,
  Tag,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/atoms/Logo";
import { UserAvatar } from "@/components/atoms/UserAvatar";

interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const navigationItems = [
    {
      title: "Citas",
      icon: Calendar,
      href: "/admin/appointments",
      description: "Gestionar citas y reservas",
    },
    {
      title: "Servicios",
      icon: Scissors,
      href: "/admin/services",
      description: "Catálogo de servicios",
    },
    ...(isAdmin
      ? [
          {
            title: "Clientes",
            icon: UserCheck,
            href: "/admin/customers",
            description: "Gestionar clientes",
          },
          {
            title: "Categorías",
            icon: Tag,
            href: "/admin/categories",
            description: "Gestionar categorías",
          },
          {
            title: "Usuarios",
            icon: Users,
            href: "/admin/users",
            description: "Administrar usuarios",
          },
        ]
      : []),
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/admin">
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={router.pathname === item.href}
                className="w-full"
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg"
                >
                  <item.icon className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Collapsible open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 h-auto"
            >
              <UserAvatar user={user} />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </SidebarFooter>
    </Sidebar>
  );
}
