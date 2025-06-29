import React from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Star,
  Clock,
  Users,
  Heart,
  Calendar,
  Palette,
  Scissors,
  Zap,
  UserCheck,
} from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir al dashboard si ya está autenticado
  React.useEffect(() => {
    if (session?.user) {
      router.push("/admin");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSignIn = () => {
    signIn("auth0", { callbackUrl: "/admin" });
  };

  const services = [
    {
      icon: Scissors,
      title: "Cortes & Peinados",
      description: "Estilos modernos y clásicos adaptados a tu personalidad",
      color:
        "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
    },
    {
      icon: Palette,
      title: "Coloración",
      description: "Técnicas avanzadas en color y mechas profesionales",
      color:
        "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
    },
    {
      icon: Sparkles,
      title: "Tratamientos Faciales",
      description: "Cuidado personalizado para una piel radiante",
      color:
        "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    },
    {
      icon: Star,
      title: "Manicura & Pedicura",
      description: "Arte en uñas con las últimas tendencias",
      color:
        "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
    },
  ];

  const features = [
    { icon: Calendar, text: "Reservas Online 24/7" },
    { icon: Users, text: "Equipo Profesional" },
    { icon: Clock, text: "Horarios Flexibles" },
    { icon: Heart, text: "Atención Personalizada" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Centro de Belleza Recovery
            </span>
          </div>

          <Button
            onClick={handleSignIn}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Zap className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
            <Sparkles className="mr-1 h-3 w-3" />
            Tu belleza, nuestra pasión
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
            Descubre tu
            <span className="block text-transparent bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text">
              belleza natural
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experimenta servicios de belleza de lujo con nuestro equipo de
            profesionales. Cada cita es diseñada especialmente para realzar tu
            belleza única.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={handleSignIn}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Reserva tu Cita
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 hover:bg-muted/50 transition-all duration-300 text-lg px-8 py-6"
              onClick={handleSignIn}
            >
              <Star className="mr-2 h-5 w-5" />
              Ver Servicios
            </Button>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Nuestros Servicios
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Servicios que transforman
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios profesionales diseñados
              para realzar tu belleza natural
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm"
              >
                <CardHeader className={`${service.color} rounded-t-lg`}>
                  <div className="h-12 w-12 rounded-lg bg-white/80 dark:bg-black/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  ¿Listo para tu transformación?
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Únete a miles de clientes satisfechos que han descubierto su
                  mejor versión con nosotros
                </p>
                <Button
                  size="lg"
                  onClick={handleSignIn}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Comenzar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Users className="mr-1 h-3 w-3" />
                Demo
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prueba la aplicación
              </h2>
              <p className="text-lg text-muted-foreground">
                Explora todas las funcionalidades con estas credenciales de
                demostración
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Admin User */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Usuario Administrador
                      </CardTitle>
                      <CardDescription>
                        Acceso completo al sistema
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Email:</span>
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        admin@admin.com
                      </code>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Contraseña:</span>
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        Admin123
                      </code>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        ✅ Gestión completa • Crear usuarios • Administrar
                        sistema
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Standard User */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Usuario Estándar
                      </CardTitle>
                      <CardDescription>
                        Gestión de citas y servicios
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Email:</span>
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        user@user.com
                      </code>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Contraseña:</span>
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        User1234
                      </code>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        ✅ Citas • Servicios • Categorías • Clientes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 bg-gradient-to-br from-primary to-primary/70 rounded-md flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Centro de Belleza Recovery</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Centro de Belleza Recovery. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
