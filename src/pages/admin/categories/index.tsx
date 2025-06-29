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
import { Plus, Tag, Edit, Trash2, Palette } from "lucide-react";

// Tipos para los datos
interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  _count: {
    services: number;
  };
}

interface FormData {
  name: string;
  description: string;
  color: string;
}

// Colores predefinidos para seleccionar
const PRESET_COLORS = [
  "#F472B6", // pink-400
  "#34D399", // emerald-400
  "#60A5FA", // blue-400
  "#A78BFA", // violet-400
  "#FB7185", // rose-400
  "#FBBF24", // amber-400
  "#10B981", // emerald-500
  "#8B5CF6", // violet-500
  "#EF4444", // red-500
  "#F59E0B", // amber-500
  "#6366F1", // indigo-500
  "#EC4899", // pink-500
];

export default function CategoriesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estados
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    color: PRESET_COLORS[0],
  });

  const breadcrumbs = [{ label: "Categorías" }];

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
      loadCategories();
    }
  }, [session]);

  // Funciones para cargar datos
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

  // Verificación de sesión y roles (solo ADMIN)
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  // Abrir diálogo para crear categoría
  const handleCreateCategory = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      color: PRESET_COLORS[0],
    });
    setIsDialogOpen(true);
    setMessage(null);
  };

  // Abrir diálogo para editar categoría
  const handleEditCategory = (category: Category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || PRESET_COLORS[0],
    });
    setIsDialogOpen(true);
    setMessage(null);
  };

  // Guardar categoría (crear o actualizar)
  const handleSaveCategory = async () => {
    if (!formData.name) {
      setMessage({ type: "error", text: "El nombre es obligatorio" });
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditMode
        ? `/api/categories/${selectedCategory?.id}`
        : "/api/categories";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: isEditMode
            ? "Categoría actualizada exitosamente"
            : "Categoría creada exitosamente",
        });
        setIsDialogOpen(false);
        loadCategories();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al guardar la categoría",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar la categoría" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (category: Category) => {
    if (category._count.services > 0) {
      setMessage({
        type: "error",
        text: "No se puede eliminar una categoría que tiene servicios asociados",
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Categoría eliminada exitosamente",
        });
        loadCategories();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Error al eliminar la categoría",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al eliminar la categoría" });
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
            <p className="text-muted-foreground">
              Organiza tus servicios por categorías
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Editar Categoría" : "Nueva Categoría"}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Modifica la información de la categoría"
                    : "Crea una nueva categoría para organizar tus servicios"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Cabello, Uñas, Facial..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descripción de la categoría..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="space-y-3">
                    {/* Color picker manual */}
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-full h-12"
                    />

                    {/* Colores predefinidos */}
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-md border-2 ${
                            formData.color === color
                              ? "border-gray-900 scale-110"
                              : "border-gray-300"
                          } transition-all`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vista previa */}
                <div className="border rounded-md p-3">
                  <Label className="text-sm text-muted-foreground">
                    Vista previa:
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="font-medium">
                      {formData.name || "Nombre de categoría"}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveCategory} disabled={isLoading}>
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
                Total Categorías
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Con Servicios
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.filter((c) => c._count.services > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Servicios
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.reduce((total, c) => total + c._count.services, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de categorías */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Categorías</CardTitle>
            <CardDescription>
              Gestiona las categorías para organizar tus servicios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Servicios</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: category.color || "#6B7280",
                          }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {category.description || "Sin descripción"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: category.color || "#6B7280",
                          }}
                        />
                        <span className="text-xs font-mono">
                          {category.color || "#6B7280"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category._count.services} servicios
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(category.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={category._count.services > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay categorías registradas. ¡Crea la primera!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
