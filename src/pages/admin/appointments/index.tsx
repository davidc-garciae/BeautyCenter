import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/Layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, TrendingUp, Clock } from "lucide-react";

// Tipos para los datos
interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category?: {
    name: string;
  };
}

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  customer: {
    firstName: string;
    lastName: string;
  };
  staff?: {
    name: string;
  };
  service: {
    name: string;
  };
  price?: number;
  notes?: string;
}

interface FormData {
  customerId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  notes: string;
  type: "ENTRADA" | "SALIDA";
  quantity: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estados
  const [selectedService, setSelectedService] = useState<string>("");
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    customerId: "",
    staffId: "",
    startTime: "",
    endTime: "",
    notes: "",
    type: "SALIDA",
    quantity: 1,
  });

  // Los datos se cargan desde las APIs

  // Cargar datos iniciales
  useEffect(() => {
    if (session) {
      loadServices();
      loadCustomers();
      loadStaff();
    }
  }, [session]);

  // Cargar citas cuando se selecciona un servicio
  useEffect(() => {
    if (selectedService) {
      loadAppointments(selectedService);
    }
  }, [selectedService]);

  // Funciones para cargar datos
  const loadServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  const loadAppointments = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/appointments?serviceId=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  // Verificación de sesión
  if (!session) {
    router.push("/");
    return null;
  }

  // Verificación de roles
  if (session.user.role !== "ADMIN" && session.user.role !== "USER") {
    router.push("/admin");
    return null;
  }

  // Handlers
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    // Las citas se cargarán automáticamente por el useEffect
  };

  const handleCreateAppointment = async () => {
    if (!selectedService || !formData.customerId || !formData.startTime) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: formData.customerId,
          serviceId: selectedService,
          staffId: formData.staffId || null,
          startTime: formData.startTime,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Cita creada exitosamente" });
        setIsDialogOpen(false);

        // Recargar las citas del servicio seleccionado
        loadAppointments(selectedService);

        // Limpiar formulario
        setFormData({
          customerId: "",
          staffId: "",
          startTime: "",
          endTime: "",
          notes: "",
          type: "SALIDA",
          quantity: 1,
        });

        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al crear la cita",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Error al crear la cita" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", text: "Pendiente" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800", text: "Confirmada" },
      IN_PROGRESS: {
        color: "bg-purple-100 text-purple-800",
        text: "En Progreso",
      },
      COMPLETED: { color: "bg-green-100 text-green-800", text: "Completada" },
      CANCELLED: { color: "bg-red-100 text-red-800", text: "Cancelada" },
      NO_SHOW: { color: "bg-gray-100 text-gray-800", text: "No se presentó" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const breadcrumbs = [
    { label: "Administración", href: "/admin" },
    { label: "Gestión de Citas", href: "/admin/appointments" },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Citas
            </h1>
            <p className="text-muted-foreground">
              Administra las citas del centro de belleza
            </p>
          </div>
        </div>

        {/* Mensaje de éxito/error */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Selector de Servicio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleccionar Servicio
            </CardTitle>
            <CardDescription>
              Elige el servicio para ver y gestionar sus citas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedService} onValueChange={handleServiceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un servicio..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{service.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {service.category?.name} • {service.duration}min • €
                        {service.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Contenido cuando hay servicio seleccionado */}
        {selectedService && (
          <>
            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Citas de Hoy
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      appointments.filter(
                        (apt) =>
                          new Date(apt.startTime).toDateString() ===
                          new Date().toDateString()
                      ).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    para {selectedServiceData?.name}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completadas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      appointments.filter((apt) => apt.status === "COMPLETED")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Duración Promedio
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedServiceData?.duration}min
                  </div>
                  <p className="text-xs text-muted-foreground">por cita</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Citas
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointments.length}
                  </div>
                  <p className="text-xs text-muted-foreground">históricas</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de Citas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Citas de {selectedServiceData?.name}</CardTitle>
                  <CardDescription>
                    Gestiona las citas para este servicio
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Cita
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Agregar Nueva Cita</DialogTitle>
                      <DialogDescription>
                        Servicio: <strong>{selectedServiceData?.name}</strong>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          Tipo
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: "ENTRADA" | "SALIDA") =>
                            setFormData((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SALIDA">
                              Salida (Servicio a Cliente)
                            </SelectItem>
                            <SelectItem value="ENTRADA">
                              Entrada (Materiales/Recursos)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer" className="text-right">
                          Cliente
                        </Label>
                        <Select
                          value={formData.customerId}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              customerId: value,
                            }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar cliente..." />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="staff" className="text-right">
                          Ejecutor
                        </Label>
                        <Select
                          value={formData.staffId}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, staffId: value }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar ejecutor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right">
                          Fecha/Hora
                        </Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          className="col-span-3"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                          Cantidad
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          className="col-span-3"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              quantity: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                          Notas
                        </Label>
                        <Textarea
                          id="notes"
                          className="col-span-3"
                          placeholder="Notas adicionales..."
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateAppointment}
                        disabled={
                          isLoading ||
                          !formData.customerId ||
                          !formData.startTime
                        }
                      >
                        {isLoading ? "Creando..." : "Crear Cita"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Ejecutor</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-mono text-sm">
                          #{appointment.id}
                        </TableCell>
                        <TableCell>
                          {formatDate(appointment.startTime)}
                        </TableCell>
                        <TableCell>
                          {formatTime(appointment.startTime)} -{" "}
                          {formatTime(appointment.endTime)}
                        </TableCell>
                        <TableCell>
                          {appointment.customer.firstName}{" "}
                          {appointment.customer.lastName}
                        </TableCell>
                        <TableCell>
                          {appointment.staff?.name || "Sin asignar"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>
                          {appointment.price ? `€${appointment.price}` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay citas para este servicio
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfica de Evolución */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Citas Diarias</CardTitle>
                <CardDescription>
                  Gráfica de citas totales por día para{" "}
                  {selectedServiceData?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Gráfica de evolución en desarrollo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Aquí se mostrará la evolución de citas diarias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
