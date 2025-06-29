# 🌱 Seed de la Base de Datos

Este archivo contiene instrucciones para poblar la base de datos con datos iniciales.

## 🚀 Ejecutar el Seed

Para poblar la base de datos con datos de ejemplo, ejecuta:

```bash
pnpm run db:seed
```

## 📋 Datos que se Crean

### 👥 Usuarios de Prueba

- **Admin:** `admin@admin.com` / `Admin123`
- **Usuario:** `user@user.com` / `User1234`
- **Staff:** `staff@centrobelleza.com` / `Staff123`

### 📁 Categorías de Servicios

- **Cabello** - Servicios de corte, peinado y coloración
- **Uñas** - Manicura, pedicura y nail art
- **Facial** - Tratamientos faciales y cuidado de la piel
- **Masajes** - Masajes relajantes y terapéuticos

### ✂️ Servicios de Ejemplo

- Corte de Cabello (45min - €35)
- Coloración Completa (120min - €85)
- Mechas y Reflejos (90min - €65)
- Manicura Completa (45min - €25)
- Pedicura Completa (60min - €30)
- Nail Art Personalizado (75min - €45)
- Limpieza Facial Básica (60min - €40)
- Tratamiento Anti-Edad (90min - €75)
- Masaje Relajante (60min - €50)

### 👥 Clientes de Ejemplo

- María García
- Ana López
- Carmen Rodríguez
- Isabel Martínez

## ⚠️ Importante

- El seed es **OPCIONAL** y solo debe ejecutarse en desarrollo o staging
- **NO ejecutar en producción** con datos reales
- El script usa `upsert` por lo que es seguro ejecutarlo múltiples veces
- Los datos se pueden eliminar manualmente desde la base de datos si es necesario

## 🔧 Comandos Adicionales

```bash
# Resetear la base de datos (cuidado: elimina todos los datos)
pnpm prisma db push --force-reset

# Ver la base de datos en interfaz gráfica
pnpm prisma studio

# Generar el cliente de Prisma
pnpm prisma generate
```
