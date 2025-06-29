import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, User, Edit, Calendar } from "lucide-react";

// Tipos
interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  enabled: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  appointmentsCount: number;
}

interface Message {
  type: "success" | "error";
  text: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const breadcrumbs = [{ label: "Usuarios" }];

  // Verificar autenticación y rol ADMIN
  useEffect(() => {
    if (status === "loading") return; // Esperando a que se cargue la sesión

    if (!session) {
      router.push("/");
      return;
    }

    if (session.user?.role !== "ADMIN") {
      router.push("/admin");
      return;
    }

    loadUsers();
  }, [session, status, router]);

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        if (response.status === 403) {
          setMessage({
            type: "error",
            text: "Acceso denegado. Solo administradores pueden ver esta página.",
          });
          return;
        }
        throw new Error("Error al cargar usuarios");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setMessage({
        type: "error",
        text: "Error al cargar la lista de usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  // Abrir diálogo de edición
  const handleEditUser = (user: Usuario) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsDialogOpen(true);
    setMessage(null);
  };

  // Actualizar rol del usuario
  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar rol");
      }

      const data = await response.json();

      // Actualizar la lista local de usuarios
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...user, role: selectedRole, updatedAt: data.user.updatedAt }
            : user
        )
      );

      // Mostrar mensaje de éxito
      setMessage({
        type: "success",
        text: "Rol actualizado exitosamente",
      });

      // Cerrar diálogo
      setIsDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Error actualizando rol:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Error al actualizar el rol",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole("");
    setMessage(null);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener color del badge según el rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "STAFF":
        return "default";
      default:
        return "secondary";
    }
  };

  // Obtener texto del rol
  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "STAFF":
        return "Personal";
      case "USER":
        return "Usuario";
      default:
        return role;
    }
  };

  // Calcular estadísticas
  const stats = {
    total: users.length,
    active: users.filter((u) => u.enabled).length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    staff: users.filter((u) => u.role === "STAFF").length,
    users: users.filter((u) => u.role === "USER").length,
  };

  // Mostrar loading si la sesión está cargando
  if (status === "loading") {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </AppLayout>
    );
  }

  // Verificación de sesión
  if (!session) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            Debes iniciar sesión para acceder a esta página.
          </div>
        </div>
      </AppLayout>
    );
  }

  // Verificación ESTRICTA de permisos
  if (session.user?.role !== "ADMIN") {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600 font-semibold">
            ❌ Acceso Denegado
          </div>
          <div className="text-center text-muted-foreground">
            Solo los administradores pueden acceder a la gestión de usuarios.
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Volver al Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Si hay loading de usuarios
  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando usuarios...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
            <p className="text-muted-foreground">
              Administra usuarios y roles del sistema
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

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Usuarios
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administradores
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">
                Con permisos completos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.staff}</div>
              <p className="text-xs text-muted-foreground">Empleados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios regulares
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  users.filter((u) => {
                    const userDate = new Date(u.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return userDate >= weekAgo;
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Nuevos usuarios</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>
              Lista completa de usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">
                      #{user.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.name || "Sin nombre"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getRoleColor(user.role) as
                            | "destructive"
                            | "default"
                            | "secondary"
                        }
                      >
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="gap-2"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {users.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No hay usuarios registrados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de Edición de Usuario */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Actualiza el rol del usuario seleccionado
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Correo del usuario:
                  </label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.name || "Sin nombre"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol:</label>
                  <Select
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Usuario</SelectItem>
                      <SelectItem value="STAFF">Personal</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={
                  isUpdating ||
                  !selectedRole ||
                  selectedRole === selectedUser?.role
                }
              >
                {isUpdating ? "Actualizando..." : "Actualizar Rol"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
