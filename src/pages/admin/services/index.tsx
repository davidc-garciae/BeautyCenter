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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Scissors,
  Clock,
  DollarSign,
  User,
  Edit,
  Power,
} from "lucide-react";

// Tipos para los datos
interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number | string;
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  creator: {
    id: string;
    name: string;
  };
  enabled: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface FormData {
  name: string;
  description: string;
  duration: string;
  price: string;
  categoryId: string;
  enabled: boolean;
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estados
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    duration: "",
    price: "",
    categoryId: "",
    enabled: true,
  });

  // Verificar si el usuario es admin
  const isAdmin = session?.user?.role === "ADMIN";

  // Manejar redirecciones
  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    if (!["ADMIN", "USER", "STAFF"].includes(session.user.role)) {
      router.push("/admin");
      return;
    }
  }, [session, router]);

  // Cargar datos iniciales
  useEffect(() => {
    if (session && ["ADMIN", "USER", "STAFF"].includes(session.user.role)) {
      loadServices();
      loadCategories();
    }
  }, [session]);

  // Funciones para cargar datos
  const loadServices = async () => {
    try {
      // Para la vista de administración, cargar todos los servicios
      const response = await fetch("/api/services?admin=true");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Verificación de sesión y roles
  if (!session || !["ADMIN", "USER", "STAFF"].includes(session.user.role)) {
    return null;
  }

  // Abrir diálogo para crear servicio
  const handleCreateService = () => {
    if (!isAdmin) return;
    setIsEditMode(false);
    setSelectedService(null);
    setFormData({
      name: "",
      description: "",
      duration: "",
      price: "",
      categoryId: "no-category",
      enabled: true,
    });
    setIsDialogOpen(true);
    setMessage(null);
  };

  // Abrir diálogo para editar servicio
  const handleEditService = (service: Service) => {
    if (!isAdmin) return;
    setIsEditMode(true);
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration.toString(),
      price: service.price.toString(),
      categoryId: service.category?.id || "no-category",
      enabled: service.enabled,
    });
    setIsDialogOpen(true);
    setMessage(null);
  };

  // Guardar servicio (crear o actualizar)
  const handleSaveService = async () => {
    if (!isAdmin) return;
    if (!formData.name || !formData.duration || !formData.price) {
      setMessage({
        type: "error",
        text: "Completa todos los campos obligatorios",
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditMode
        ? `/api/services/${selectedService?.id}`
        : "/api/services";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          categoryId:
            formData.categoryId === "no-category" ? null : formData.categoryId,
          enabled: formData.enabled,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: isEditMode
            ? "Servicio actualizado exitosamente"
            : "Servicio creado exitosamente",
        });
        setIsDialogOpen(false);
        loadServices();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al guardar el servicio",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar el servicio" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle estado del servicio
  const handleToggleService = async (service: Service) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          categoryId: service.category?.id,
          enabled: !service.enabled,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Servicio ${
            !service.enabled ? "activado" : "desactivado"
          } exitosamente`,
        });
        loadServices();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al cambiar el estado del servicio",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error al cambiar el estado del servicio",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `€${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const breadcrumbs = [{ label: "Servicios" }];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isAdmin ? "Gestión de Servicios" : "Servicios Disponibles"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Administra los servicios ofrecidos en el centro"
                : "Explora los servicios disponibles"}
            </p>
          </div>

          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Servicio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Editar Servicio" : "Nuevo Servicio"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode
                      ? "Modifica la información del servicio"
                      : "Crea un nuevo servicio para el centro"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="name">Nombre del Servicio *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Manicura francesa..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descripción del servicio..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duración (min) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        placeholder="60"
                        min="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Precio (€) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="25.00"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          categoryId: value === "no-category" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-category">
                          Sin categoría
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enabled"
                      checked={formData.enabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, enabled: checked })
                      }
                    />
                    <Label htmlFor="enabled">Servicio activo</Label>
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
                    onClick={handleSaveService}
                    disabled={
                      isLoading ||
                      !formData.name ||
                      !formData.duration ||
                      !formData.price
                    }
                  >
                    {isLoading
                      ? "Guardando..."
                      : isEditMode
                      ? "Actualizar"
                      : "Crear"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Servicios
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">
                {services.filter((s) => s.enabled).length} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <span className="h-4 w-4 text-muted-foreground">📂</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                diferentes categorías
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Precio Promedio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €
                {services.length > 0
                  ? (
                      services.reduce(
                        (acc, s) =>
                          acc +
                          (typeof s.price === "string"
                            ? parseFloat(s.price)
                            : s.price),
                        0
                      ) / services.length
                    ).toFixed(0)
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">por servicio</p>
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
                {services.length > 0
                  ? Math.round(
                      services.reduce((acc, s) => acc + s.duration, 0) /
                        services.length
                    )
                  : 0}
                min
              </div>
              <p className="text-xs text-muted-foreground">por servicio</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Servicios */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios Registrados</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Lista completa de servicios disponibles en el centro"
                : "Servicios disponibles para reservar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre del Servicio</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Costo</TableHead>
                  {isAdmin && <TableHead>Creado por</TableHead>}
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead>Fecha</TableHead>}
                  {isAdmin && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-mono text-sm">
                      #{service.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {service.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.category ? (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor:
                              service.category.color || "#6B7280",
                            color: "#fff",
                            borderColor: service.category.color || "#6B7280",
                          }}
                        >
                          {service.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Sin categoría
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {service.duration}min
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(service.price)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {service.creator.name || "Usuario"}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={service.enabled ? "default" : "secondary"}
                      >
                        {service.enabled ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>{formatDate(service.createdAt)}</TableCell>
                    )}
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleService(service)}
                            className={
                              service.enabled
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {services.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {isAdmin
                  ? "No hay servicios registrados. ¡Crea el primero!"
                  : "No hay servicios disponibles en este momento."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
