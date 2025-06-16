
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InstallmentFiltersProps {
  filter: "all" | "pending" | "paid" | "overdue";
  onFilterChange: (filter: "all" | "pending" | "paid" | "overdue") => void;
  stats: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
}

const InstallmentFilters = ({ filter, onFilterChange, stats }: InstallmentFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => onFilterChange("all")}
          >
            Todas ({stats.total})
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => onFilterChange("pending")}
          >
            Pendentes ({stats.pending})
          </Button>
          <Button 
            variant={filter === "paid" ? "default" : "outline"}
            onClick={() => onFilterChange("paid")}
          >
            Pagas ({stats.paid})
          </Button>
          <Button 
            variant={filter === "overdue" ? "default" : "outline"}
            onClick={() => onFilterChange("overdue")}
          >
            Atrasadas ({stats.overdue})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentFilters;
