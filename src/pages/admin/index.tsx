import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SectionCards } from "@/components/Dashboard/section-cards";
import { AppointmentCalendar } from "@/components/Dashboard/appointment-calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <AppLayout breadcrumbs={[]}>
      <div className="space-y-6">
        {/* 1. Métricas Principales (Solo para Admins) */}
        {isAdmin && <SectionCards />}

        {/* 2. Calendario de Citas */}
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Citas</CardTitle>
            <CardDescription>
              Vista de citas programadas por mes, semana o día.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentCalendar />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
