import { Bus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listRoutes, listVehicles } from "#/services/operations";
import { ModulePlaceholder } from "#/components/common/ModulePlaceholder";

export default function TransportationPage() {
  const { data: routes = [] } = useQuery({ queryKey: ["routes", ""], queryFn: () => listRoutes("") });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles", ""], queryFn: () => listVehicles("") });
  const riders = new Set(routes.flatMap((r) => r.assignedStudentIds)).size;

  return (
    <ModulePlaceholder
      testId="transportation-page"
      eyebrow="Operations"
      title="Transportation"
      description="Routes, stops, vehicles and drivers with rider assignments per route."
      icon={Bus}
      stats={[
        { key: "routes", label: "Routes", value: String(routes.length) },
        { key: "vehicles", label: "Vehicles", value: String(vehicles.length) },
        { key: "stops", label: "Stops", value: String(routes.reduce((sum, r) => sum + r.stops.length, 0)) },
        { key: "riders", label: "Students riding", value: String(riders) },
      ]}
      capabilities={[
        "Route list with stop sequence, pickup and drop timings, and assigned riders.",
        "Fleet table: registration, capacity, service dates, insurance expiry and GPS state.",
        "Driver roster with licence details and availability status.",
        "Suspend or reactivate a route and reassign its vehicle.",
      ]}
    />
  );
}
