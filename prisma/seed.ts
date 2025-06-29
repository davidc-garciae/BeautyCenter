import { PrismaClient, Enum_RoleName, AppointmentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. CREAR USUARIOS DE PRUEBA
  console.log('👥 Creando usuarios...')
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@centrobelleza.com' },
    update: {},
    create: {
      name: 'Admin Centro Belleza',
      email: 'admin@centrobelleza.com',
      role: Enum_RoleName.ADMIN,
      enabled: true,
    },
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@centrobelleza.com' },
    update: {},
    create: {
      name: 'Usuario Regular',
      email: 'user@centrobelleza.com', 
      role: Enum_RoleName.USER,
      enabled: true,
    },
  })

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@centrobelleza.com' },
    update: {},
    create: {
      name: 'María González - Estilista',
      email: 'staff@centrobelleza.com',
      role: Enum_RoleName.STAFF,
      enabled: true,
    },
  })

  console.log('✅ Usuarios creados:', { adminUser: adminUser.name, regularUser: regularUser.name, staffUser: staffUser.name })

  // 2. CREAR CATEGORÍAS DE SERVICIOS
  console.log('📁 Creando categorías de servicios...')
  
  const categoryHair = await prisma.serviceCategory.upsert({
    where: { id: 'cat-hair' },
    update: {},
    create: {
      id: 'cat-hair',
      name: 'Cabello',
      description: 'Servicios de corte, peinado y coloración',
      color: '#F472B6', // pink-400
    },
  })

  const categoryNails = await prisma.serviceCategory.upsert({
    where: { id: 'cat-nails' },
    update: {},
    create: {
      id: 'cat-nails',
      name: 'Uñas',
      description: 'Manicura, pedicura y nail art',
      color: '#34D399', // emerald-400
    },
  })

  const categoryFacial = await prisma.serviceCategory.upsert({
    where: { id: 'cat-facial' },
    update: {},
    create: {
      id: 'cat-facial',
      name: 'Facial',
      description: 'Tratamientos faciales y cuidado de la piel',
      color: '#60A5FA', // blue-400
    },
  })

  const categoryMassage = await prisma.serviceCategory.upsert({
    where: { id: 'cat-massage' },
    update: {},
    create: {
      id: 'cat-massage',
      name: 'Masajes',
      description: 'Masajes relajantes y terapéuticos',
      color: '#A78BFA', // violet-400
    },
  })

  console.log('✅ Categorías creadas:', { hair: categoryHair.name, nails: categoryNails.name, facial: categoryFacial.name, massage: categoryMassage.name })

  // 3. CREAR SERVICIOS
  console.log('✂️ Creando servicios...')

  const services = [
    // CABELLO
    {
      id: 'service-hair-cut',
      name: 'Corte de Cabello',
      description: 'Corte profesional adaptado a tu estilo y tipo de rostro',
      duration: 45,
      price: 35.00,
      color: '#F472B6',
      categoryId: categoryHair.id,
      createdBy: adminUser.id,
    },
    {
      id: 'service-hair-color',
      name: 'Coloración Completa',
      description: 'Cambio de color completo con productos premium',
      duration: 120,
      price: 85.00,
      color: '#EC4899',
      categoryId: categoryHair.id,
      createdBy: adminUser.id,
    },
    {
      id: 'service-hair-highlights',
      name: 'Mechas y Reflejos',
      description: 'Mechas californianas, babylights o reflejos',
      duration: 90,
      price: 65.00,
      color: '#F9A8D4',
      categoryId: categoryHair.id,
      createdBy: adminUser.id,
    },
    // UÑAS
    {
      id: 'service-manicure',
      name: 'Manicura Completa',
      description: 'Cuidado completo de uñas con esmaltado',
      duration: 45,
      price: 25.00,
      color: '#34D399',
      categoryId: categoryNails.id,
      createdBy: adminUser.id,
    },
    {
      id: 'service-pedicure',
      name: 'Pedicura Completa',
      description: 'Cuidado completo de pies y uñas',
      duration: 60,
      price: 30.00,
      color: '#6EE7B7',
      categoryId: categoryNails.id,
      createdBy: adminUser.id,
    },
    {
      id: 'service-nail-art',
      name: 'Nail Art Personalizado',
      description: 'Diseños únicos y personalizados en tus uñas',
      duration: 75,
      price: 45.00,
      color: '#10B981',
      categoryId: categoryNails.id,
      createdBy: adminUser.id,
    },
    // FACIAL
    {
      id: 'service-facial-basic',
      name: 'Limpieza Facial Básica',
      description: 'Limpieza profunda e hidratación facial',
      duration: 60,
      price: 40.00,
      color: '#60A5FA',
      categoryId: categoryFacial.id,
      createdBy: adminUser.id,
    },
    {
      id: 'service-facial-anti-aging',
      name: 'Tratamiento Anti-Edad',
      description: 'Tratamiento especializado para combatir signos de envejecimiento',
      duration: 90,
      price: 75.00,
      color: '#3B82F6',
      categoryId: categoryFacial.id,
      createdBy: adminUser.id,
    },
    // MASAJES
    {
      id: 'service-massage-relaxing',
      name: 'Masaje Relajante',
      description: 'Masaje completo para relajar cuerpo y mente',
      duration: 60,
      price: 50.00,
      color: '#A78BFA',
      categoryId: categoryMassage.id,
      createdBy: adminUser.id,
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    })
  }

  console.log('✅ Servicios creados:', services.length)

  // 4. CREAR CLIENTES
  console.log('👤 Creando clientes...')

  const customers = [
    {
      id: 'customer-maria',
      firstName: 'María',
      lastName: 'García López',
      email: 'maria.garcia@email.com',
      phone: '+34 666 111 222',
      address: 'Calle Gran Vía 123, Madrid',
      dateOfBirth: new Date('1990-05-15'),
      notes: 'Prefiere citas por la mañana. Alérgica a ciertos productos químicos.',
      createdBy: adminUser.id,
    },
    {
      id: 'customer-ana',
      firstName: 'Ana',
      lastName: 'López Martín',
      email: 'ana.lopez@email.com',
      phone: '+34 666 333 444',
      address: 'Avenida Constitución 45, Barcelona',
      dateOfBirth: new Date('1985-09-22'),
      notes: 'Cliente VIP. Le gusta probar servicios nuevos.',
      createdBy: staffUser.id,
    },
    {
      id: 'customer-carmen',
      firstName: 'Carmen',
      lastName: 'Silva Rodríguez',
      email: 'carmen.silva@email.com',
      phone: '+34 666 555 666',
      address: 'Plaza Mayor 8, Valencia',
      dateOfBirth: new Date('1995-03-10'),
      notes: 'Viene cada 2 semanas para manicura.',
      createdBy: staffUser.id,
    },
    {
      id: 'customer-lucia',
      firstName: 'Lucía',
      lastName: 'Fernández Díaz',
      email: 'lucia.fernandez@email.com',
      phone: '+34 666 777 888',
      address: 'Calle Sol 67, Sevilla',
      dateOfBirth: new Date('1988-12-03'),
      notes: 'Prefiere coloración sin amoníaco.',
      createdBy: adminUser.id,
    },
    {
      id: 'customer-sofia',
      firstName: 'Sofía',
      lastName: 'Ruiz González',
      email: 'sofia.ruiz@email.com',
      phone: '+34 666 999 000',
      address: 'Paseo Marítimo 234, Málaga',
      dateOfBirth: new Date('1992-07-18'),
      notes: 'Muy puntual. Le gustan los masajes relajantes.',
      createdBy: regularUser.id,
    },
  ]

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    })
  }

  console.log('✅ Clientes creados:', customers.length)

  // 5. CREAR CITAS
  console.log('📅 Creando citas...')

  const now = new Date()
  const appointments = [
    // CITAS DE HOY
    {
      id: 'apt-today-1',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0), // 10:00 AM hoy
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 45),   // 10:45 AM hoy
      status: AppointmentStatus.CONFIRMED,
      customerId: 'customer-maria',
      serviceId: 'service-hair-cut',
      staffId: staffUser.id,
      userId: staffUser.id,
      price: 35.00,
      notes: 'Primera vez en el centro',
    },
    {
      id: 'apt-today-2',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30), // 2:30 PM hoy
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 15),   // 3:15 PM hoy
      status: AppointmentStatus.PENDING,
      customerId: 'customer-ana',
      serviceId: 'service-manicure',
      staffId: staffUser.id,
      userId: adminUser.id,
      price: 25.00,
      notes: 'Confirmar 1 hora antes',
    },
    // CITAS DE MAÑANA
    {
      id: 'apt-tomorrow-1',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0), // 9:00 AM mañana
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),  // 10:00 AM mañana
      status: AppointmentStatus.CONFIRMED,
      customerId: 'customer-carmen',
      serviceId: 'service-facial-basic',
      staffId: staffUser.id,
      userId: staffUser.id,
      price: 40.00,
    },
    {
      id: 'apt-tomorrow-2',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 0), // 4:00 PM mañana
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0),   // 6:00 PM mañana
      status: AppointmentStatus.CONFIRMED,
      customerId: 'customer-lucia',
      serviceId: 'service-hair-color',
      staffId: staffUser.id,
      userId: adminUser.id,
      price: 85.00,
      notes: 'Coloración sin amoníaco',
    },
    // CITAS PASADAS (COMPLETADAS)
    {
      id: 'apt-yesterday-1',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 11, 0), // 11:00 AM ayer
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 15),  // 12:15 PM ayer
      status: AppointmentStatus.COMPLETED,
      customerId: 'customer-sofia',
      serviceId: 'service-nail-art',
      staffId: staffUser.id,
      userId: staffUser.id,
      price: 45.00,
      notes: 'Diseño floral - muy satisfecha',
    },
    {
      id: 'apt-lastweek-1',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 15, 0), // Semana pasada
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 16, 0),
      status: AppointmentStatus.COMPLETED,
      customerId: 'customer-maria',
      serviceId: 'service-massage-relaxing',
      staffId: staffUser.id,
      userId: regularUser.id,
      price: 50.00,
      notes: 'Excelente servicio, muy relajante',
    },
    // CITAS FUTURAS
    {
      id: 'apt-nextweek-1',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 13, 0), // Próxima semana
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 14, 30),
      status: AppointmentStatus.CONFIRMED,
      customerId: 'customer-ana',
      serviceId: 'service-facial-anti-aging',
      staffId: staffUser.id,
      userId: adminUser.id,
      price: 75.00,
      notes: 'Tratamiento mensual',
    },
  ]

  for (const appointment of appointments) {
    await prisma.appointment.upsert({
      where: { id: appointment.id },
      update: {},
      create: appointment,
    })
  }

  console.log('✅ Citas creadas:', appointments.length)

  // 6. CREAR HORARIOS DE TRABAJO
  console.log('🕐 Creando horarios de trabajo...')

  const workingHours = [
    // Horario general del centro (Lunes a Sábado)
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', staffId: null }, // Lunes
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', staffId: null }, // Martes
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', staffId: null }, // Miércoles
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', staffId: null }, // Jueves
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', staffId: null }, // Viernes
    { dayOfWeek: 6, startTime: '09:00', endTime: '16:00', staffId: null }, // Sábado (horario reducido)
    
    // Horario específico del staff
    { dayOfWeek: 1, startTime: '08:30', endTime: '17:30', staffId: staffUser.id }, // María - Lunes
    { dayOfWeek: 2, startTime: '08:30', endTime: '17:30', staffId: staffUser.id }, // María - Martes
    { dayOfWeek: 3, startTime: '08:30', endTime: '17:30', staffId: staffUser.id }, // María - Miércoles
    { dayOfWeek: 4, startTime: '08:30', endTime: '17:30', staffId: staffUser.id }, // María - Jueves
    { dayOfWeek: 5, startTime: '08:30', endTime: '17:30', staffId: staffUser.id }, // María - Viernes
    { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', staffId: staffUser.id }, // María - Sábado
  ]

  for (const hours of workingHours) {
    await prisma.workingHours.create({
      data: hours,
    })
  }

  console.log('✅ Horarios de trabajo creados:', workingHours.length)

  // 7. CONFIGURACIÓN DEL SISTEMA
  console.log('⚙️ Creando configuración del sistema...')

  await prisma.systemConfig.upsert({
    where: { id: 'system-config' },
    update: {},
    create: {
      id: 'system-config',
      appointmentDuration: 30,
      advanceBookingDays: 60,
      cancellationHours: 24,
      workingDaysStart: 1, // Lunes
      workingDaysEnd: 6,   // Sábado
      businessName: 'Centro de Belleza Aurora',
      businessPhone: '+34 912 345 678',
      businessEmail: 'info@centrobellezaaurora.com',
      businessAddress: 'Calle de la Belleza 123, 28001 Madrid',
    },
  })

  console.log('✅ Configuración del sistema creada')

  console.log('🎉 ¡Seed completado exitosamente!')
  console.log('')
  console.log('👥 USUARIOS CREADOS:')
  console.log('   📧 admin@centrobelleza.com (ADMIN)')
  console.log('   📧 user@centrobelleza.com (USER)')
  console.log('   📧 staff@centrobelleza.com (STAFF)')
  console.log('')
  console.log('📊 DATOS CREADOS:')
  console.log(`   📁 ${4} categorías de servicios`)
  console.log(`   ✂️ ${services.length} servicios`)
  console.log(`   👤 ${customers.length} clientes`)
  console.log(`   📅 ${appointments.length} citas`)
  console.log(`   🕐 ${workingHours.length} horarios de trabajo`)
  console.log(`   ⚙️ 1 configuración del sistema`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 