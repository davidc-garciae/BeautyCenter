"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  EventProps,
  View,
} from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
// import "react-big-calendar/lib/css/react-big-calendar.css"; // Se mueve a _app.tsx
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Configurar locale en español
moment.locale("es");
const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  service: {
    name: string;
    color?: string;
  };
  staff?: {
    name: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "PENDING":
      return "outline";
    case "CANCELLED":
    case "NO_SHOW":
      return "destructive";
    default:
      return "default";
  }
};

const CustomEvent = ({ event }: EventProps<CalendarEvent>) => (
  <div className="p-1">
    <p className="font-semibold text-sm truncate">{event.title}</p>
    <p className="text-xs truncate">
      {event.resource.customer.firstName} {event.resource.customer.lastName}
    </p>
    {event.resource.staff && (
      <p className="text-xs truncate">con {event.resource.staff.name}</p>
    )}
    <Badge
      variant={getStatusBadgeVariant(event.resource.status)}
      className="mt-1 text-xs"
    >
      {event.resource.status}
    </Badge>
  </div>
);

export function AppointmentCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/appointments");
        if (response.ok) {
          const appointments: Appointment[] = await response.json();
          const calendarEvents = appointments.map((apt) => ({
            id: apt.id,
            title: apt.service.name,
            start: new Date(apt.startTime),
            end: new Date(apt.endTime),
            resource: apt,
          }));
          setEvents(calendarEvents);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const { messages } = useMemo(
    () => ({
      messages: {
        allDay: "Todo el día",
        previous: "<",
        next: ">",
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        day: "Día",
        agenda: "Agenda",
        date: "Fecha",
        time: "Hora",
        event: "Evento",
        noEventsInRange: "No hay citas en este rango.",
        showMore: (total: number) => `+ Ver más (${total})`,
      },
    }),
    []
  );

  const handleViewChange = (newView: View) => {
    setCurrentView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return <Skeleton className="h-[700px] w-full" />;
  }

  return (
    <div className="h-[700px] bg-white p-4 rounded-lg border">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        view={currentView}
        date={currentDate}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        messages={messages}
        eventPropGetter={(event) => {
          const backgroundColor = event.resource.service.color || "#3174ad";
          return { style: { backgroundColor } };
        }}
        components={{
          event: CustomEvent,
        }}
      />
    </div>
  );
}
