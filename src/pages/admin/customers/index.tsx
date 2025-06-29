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
import {
  Plus,
  Users,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";

// Tipos para los datos
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
  createdAt: string;
  _count: {
    appointments: number;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  notes: string;
}

export default function CustomersPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estados
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    notes: "",
  });

  const breadcrumbs = [{ label: "Clientes" }];

  // Manejar redirecciones
  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/admin");
      return;
    }
  }, [session, router]);

  // Cargar datos iniciales
  useEffect(() => {
    if (session && session.user.role === "ADMIN") {
      loadCustomers();
    }
  }, [session]);

  // Funciones para cargar datos
  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else if (response.status === 403) {
        setMessage({
          type: "error",
          text: "Acceso denegado. Solo administradores pueden gestionar clientes.",
        });
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  // Verificación de sesión y roles
  if (!session || session.user.role !== "ADMIN") {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600 font-semibold">
            ❌ Acceso Denegado
          </div>
          <div className="text-center text-muted-foreground">
            Solo los administradores pueden gestionar clientes.
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Volver al Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Abrir diálogo para crear cliente
  const handleCreateCustomer = () => {
    setIsEditMode(false);
    setSelectedCustomer(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      notes: "",
    });
    setIsDialogOpen(true);
    setMessage(null);
  };

  // Abrir diálogo para editar cliente
  const handleEditCustomer = (customer: Customer) => {
    setIsEditMode(true);
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      dateOfBirth: customer.dateOfBirth
        ? customer.dateOfBirth.split("T")[0]
        : "",
      notes: customer.notes || "",
    });
    setIsDialogOpen(true);
    setMessage(null);
  };

  // Guardar cliente (crear o actualizar)
  const handleSaveCustomer = async () => {
    if (!formData.firstName || !formData.lastName) {
      setMessage({ type: "error", text: "Nombre y apellido son obligatorios" });
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditMode
        ? `/api/customers/${selectedCustomer?.id}`
        : "/api/customers";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          dateOfBirth: formData.dateOfBirth || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: isEditMode
            ? "Cliente actualizado exitosamente"
            : "Cliente creado exitosamente",
        });
        setIsDialogOpen(false);
        loadCustomers();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al guardar el cliente",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Error al guardar el cliente" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Eliminar cliente
  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Cliente eliminado exitosamente" });
        loadCustomers();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al eliminar el cliente",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Error al eliminar el cliente" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
            <p className="text-muted-foreground">
              Administra la información de tus clientes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateCustomer}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Editar Cliente" : "Nuevo Cliente"}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Modifica la información del cliente"
                    : "Completa los datos del nuevo cliente"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Apellidos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="600 123 456"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Calle, número, ciudad"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notas adicionales sobre el cliente..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveCustomer} disabled={isLoading}>
                  {isLoading
                    ? "Guardando..."
                    : isEditMode
                    ? "Actualizar"
                    : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mensaje de estado */}
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

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Email</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter((c) => c.email).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Con Teléfono
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter((c) => c.phone).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Gestiona la información completa de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Información</TableHead>
                  <TableHead>Citas</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        {customer.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-48">
                            {customer.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-32">
                              {customer.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.dateOfBirth && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {calculateAge(customer.dateOfBirth)} años
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {customer._count.appointments} citas
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(customer.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer)}
                          disabled={customer._count.appointments > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {customers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay clientes registrados. ¡Crea el primero!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
