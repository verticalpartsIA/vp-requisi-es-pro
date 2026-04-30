import { createFileRoute } from "@tanstack/react-router";
import { FileSearch, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/quoting")({
  component: QuotingPage,
});

interface QueueItem {
  id: string;
  title: string;
  urgency: string;
  value: string;
  deadline: string;
  module: string;
}

interface Supplier {
  name: string;
  price: string;
  deadline: string;
  notes: string;
}

const queue: QueueItem[] = [
  { id: "M1-000065", title: "Parafusos Inox 304", urgency: "HIGH", value: "R$ 2.300", deadline: "30/04", module: "M1" },
  { id: "M2-000042", title: "Viagem SP - Cliente ABC", urgency: "MEDIUM", value: "R$ 2.650", deadline: "05/05", module: "M2" },
  { id: "M3-000018", title: "Consultoria ERP Financeiro", urgency: "LOW", value: "R$ 50.000", deadline: "15/05", module: "M3" },
];

const urgLabel: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
  URGENT: "Urgente",
};

function urgBadge(u: string) {
  if (u === "HIGH") return "bg-orange-100 text-orange-700 border-orange-200";
  if (u === "MEDIUM") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function QuotingPage() {
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { name: "", price: "", deadline: "", notes: "" },
  ]);

  const openQuotation = (item: QueueItem) => {
    setSelectedItem(item);
    setSuppliers([{ name: "", price: "", deadline: "", notes: "" }]);
  };

  const addSupplier = () => {
    setSuppliers((prev) => [...prev, { name: "", price: "", deadline: "", notes: "" }]);
  };

  const removeSupplier = (index: number) => {
    setSuppliers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSupplier = (index: number, field: keyof Supplier, value: string) => {
    setSuppliers((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = () => {
    setSelectedItem(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <FileSearch className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">V2 — Cotação</h1>
          <p className="text-sm text-muted-foreground">Fila de cotação multi-fornecedor</p>
        </div>
      </div>
      <div className="space-y-3">
        {queue.map((t) => (
          <Card key={t.id} className="card-hover-yellow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-mono text-xs">{t.id}</Badge>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Prazo: {t.deadline} • Valor est.: {t.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${urgBadge(t.urgency)}`}>
                  {urgLabel[t.urgency] || t.urgency}
                </span>
                <Button variant="vp" size="sm" onClick={() => openQuotation(t)}>
                  Cotar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Cotação — {selectedItem?.id}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedItem?.title} • Valor est.: {selectedItem?.value}
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {suppliers.map((sup, i) => (
              <Card key={i} className="border border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Fornecedor {i + 1}
                    </span>
                    {suppliers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => removeSupplier(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome do Fornecedor</Label>
                      <Input
                        placeholder="Ex: ABC Ltda"
                        value={sup.name}
                        onChange={(e) => updateSupplier(i, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Preço (R$)</Label>
                      <Input
                        placeholder="0,00"
                        value={sup.price}
                        onChange={(e) => updateSupplier(i, "price", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prazo de Entrega</Label>
                      <Input
                        type="date"
                        value={sup.deadline}
                        onChange={(e) => updateSupplier(i, "deadline", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Observações</Label>
                      <Input
                        placeholder="Condições, frete, etc."
                        value={sup.notes}
                        onChange={(e) => updateSupplier(i, "notes", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" size="sm" className="w-full" onClick={addSupplier}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Fornecedor
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setSelectedItem(null)}>
              Cancelar
            </Button>
            <Button variant="vp" onClick={handleSubmit}>
              Enviar Cotação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}