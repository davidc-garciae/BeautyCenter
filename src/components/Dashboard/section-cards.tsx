"use client";

import { useEffect, useState } from "react";
import {
  IconTrendingUp,
  IconUsers,
  IconCalendar,
  IconTools,
  IconCurrencyEuro,
} from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Metrics {
  monthlyRevenue: number;
  newCustomersThisMonth: number;
  appointmentsThisMonth: number;
  totalActiveServices: number;
}

export function SectionCards() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard/metrics");
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const cards = [
    {
      title: "Ingresos del Mes",
      value: metrics ? formatCurrency(metrics.monthlyRevenue) : "€0,00",
      icon: IconCurrencyEuro,
      description: "Suma de citas completadas",
    },
    {
      title: "Clientes Nuevos (Mes)",
      value: metrics ? metrics.newCustomersThisMonth : 0,
      icon: IconUsers,
      description: "Nuevas altas en el sistema",
    },
    {
      title: "Citas del Mes",
      value: metrics ? metrics.appointmentsThisMonth : 0,
      icon: IconCalendar,
      description: "Total de citas completadas",
    },
    {
      title: "Servicios Activos",
      value: metrics ? metrics.totalActiveServices : 0,
      icon: IconTools,
      description: "Catálogo de servicios",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>{card.title}</CardDescription>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-3/4 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {card.value}
              </CardTitle>
            )}
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
