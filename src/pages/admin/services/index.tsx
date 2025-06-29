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
import { Plus, Scissors, Clock, DollarSign, User } from "lucide-react";

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
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estados
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  });

  // Manejar redirecciones
  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "USER") {
      router.push("/admin");
      return;
    }
  }, [session, router]);

  // Cargar datos iniciales
  useEffect(() => {
    if (
      session &&
      (session.user.role === "ADMIN" || session.user.role === "USER")
    ) {
      loadServices();
      loadCategories();
    }
  }, [session]);

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

  // Verificación de sesión y roles (solo renderizar si cumple condiciones)
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "USER")
  ) {
    return null;
  }

  // Handler para crear servicio
  const handleCreateService = async () => {
    if (!formData.name || !formData.duration || !formData.price) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          categoryId: formData.categoryId || null,
        }),
      });

      if (response.ok) {
        const newService = await response.json();
        setMessage({ type: "success", text: "Servicio creado exitosamente" });
        setIsDialogOpen(false);

        // Recargar los servicios
        loadServices();

        // Limpiar formulario
        setFormData({
          name: "",
          description: "",
          duration: "",
          price: "",
          categoryId: "",
        });

        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al crear el servicio",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al crear el servicio" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `€${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const breadcrumbs = [
    { label: "Administración", href: "/admin" },
    { label: "Gestión de Servicios", href: "/admin/services" },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Servicios
            </h1>
            <p className="text-muted-foreground">
              Administra el catálogo de servicios del centro de belleza
            </p>
          </div>
          {/* Solo ADMIN puede ver el botón */}
          {session.user.role === "ADMIN" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Servicio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Servicio</DialogTitle>
                  <DialogDescription>
                    Complete los datos del nuevo servicio
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre *
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      placeholder="Ej: Corte de cabello"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Precio * (€)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="col-span-3"
                      placeholder="35.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duración * (min)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      className="col-span-3"
                      placeholder="45"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Categoría
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, categoryId: value }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar categoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      className="col-span-3"
                      placeholder="Descripción del servicio..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
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
                    onClick={handleCreateService}
                    disabled={
                      isLoading ||
                      !formData.name ||
                      !formData.duration ||
                      !formData.price
                    }
                  >
                    {isLoading ? "Creando..." : "Crear Servicio"}
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
              Lista completa de servicios disponibles en el centro
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
                  <TableHead>Creado por</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
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
                        <Badge variant="outline">{service.category.name}</Badge>
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {service.creator.name || "Usuario"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.enabled ? "default" : "secondary"}
                      >
                        {service.enabled ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(service.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {services.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay servicios registrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
