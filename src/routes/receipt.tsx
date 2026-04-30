import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PackageCheck, Truck, User, Building2, ClipboardCheck, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/receipt")({
  component: ReceiptPage,
});

interface PendingReceipt {
  id: string;
  requisition: string;
  description: string;
  supplier: string;
  requester: string;
  approvedValue: number;
  category: string;
  purchaseDate: string;
}

const mockPending: PendingReceipt[] = [
  {
    id: "REC-001",
    requisition: "REQ-2024-042",
    description: "Rolamentos SKF 6205",
    supplier: "SKF Brasil Ltda",
    requester: "Carlos Mendes",
    approvedValue: 2450.0,
    category: "produto",
    purchaseDate: "2024-03-15",
  },
  {
    id: "REC-002",
    requisition: "REQ-2024-038",
    description: "Chapas de aço 3mm (lote 50un)",
    supplier: "Aço Forte Distribuidora",
    requester: "Fernanda Lima",
    approvedValue: 8900.0,
    category: "produto",
    purchaseDate: "2024-03-12",
  },
  {
    id: "REC-003",
    requisition: "REQ-2024-045",
    description: "Parafusos M10x50 (caixa 500un)",
    supplier: "Fixadores Nacional",
    requester: "Roberto Alves",
    approvedValue: 620.0,
    category: "produto",
    purchaseDate: "2024-03-18",
  },
];

type Condition = "ok" | "damaged" | "mismatch" | "";

function ReceiptPage() {
  const [pendingItems, setPendingItems] = useState<PendingReceipt[]>(mockPending);
  const [completedItems, setCompletedItems] = useState<PendingReceipt[]>([]);
  const [selectedItem, setSelectedItem] = useState<PendingReceipt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [delivererName, setDelivererName] = useState("");
  const [carrierCompany, setCarrierCompany] = useState("");
  const [condition, setCondition] = useState<Condition>("");
  const [notes, setNotes] = useState("");

  const needsNotes = condition === "damaged" || condition === "mismatch";

  const openReceiptForm = (item: PendingReceipt) => {
    setSelectedItem(item);
    setDelivererName("");
    setCarrierCompany("");
    setCondition("");
    setNotes("");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!condition) {
      toast.error("Selecione a conformidade do produto.");
      return;
    }
    if (needsNotes && !notes.trim()) {
      toast.error("Preencha o motivo da divergência antes de enviar.");
      return;
    }
    if (!selectedItem) return;

    setPendingItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
    setCompletedItems((prev) => [...prev, selectedItem]);
    setDialogOpen(false);

    if (condition === "ok") {
      toast.success("Recebimento registrado com sucesso. Estoque atualizado.");
    } else {
      toast.success("Recebimento registrado com sucesso. Estoque atualizado.");
      toast.info(`Requisitante ${selectedItem.requester} notificado automaticamente sobre a não conformidade.`);
    }
  };

  const conditionLabel = (c: Condition) => {
    if (c === "ok") return "Em ordem";
    if (c === "damaged") return "Com avarias";
    if (c === "mismatch") return "Fora da especificação";
    return "";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <PackageCheck className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">V5 — Recebimento de Materiais</h1>
          <p className="text-sm text-muted-foreground">Conferência e registro de entrega de materiais</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover-yellow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Truck className="h-5 w-5 text-vp-yellow-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingItems.length}</p>
              <p className="text-xs text-muted-foreground">Aguardando Recebimento</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover-yellow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedItems.length}</p>
              <p className="text-xs text-muted-foreground">Recebidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover-yellow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Não Conformidades</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Entregas Pendentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingItems.length === 0 ? (
            <div className="p-8 text-center">
              <PackageCheck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhum recebimento pendente.</p>
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:border-vp-yellow transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.id}</span>
                    <Badge variant="outline" className="text-xs">{item.requisition}</Badge>
                  </div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{item.supplier}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.requester}</span>
                    <span>R$ {item.approvedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <Button variant="vp" size="sm" onClick={() => openReceiptForm(item)}>
                  <ClipboardCheck className="h-4 w-4 mr-1" /> Receber
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recebimento de Materiais</DialogTitle>
            <DialogDescription>
              {selectedItem?.description} — {selectedItem?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Read-only info */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requisitante Original</span>
                <span className="font-medium">{selectedItem?.requester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fornecedor</span>
                <span className="font-medium">{selectedItem?.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Aprovado</span>
                <span className="font-medium">
                  R$ {selectedItem?.approvedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Deliverer */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome do Entregador (opcional)</label>
              <Input
                placeholder="Nome do motorista / entregador"
                value={delivererName}
                onChange={(e) => setDelivererName(e.target.value)}
              />
            </div>

            {/* Carrier */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Empresa que Entregou (opcional)</label>
              <Input
                placeholder="Transportadora / empresa"
                value={carrierCompany}
                onChange={(e) => setCarrierCompany(e.target.value)}
              />
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Conformidade do Produto</label>
              <div className="grid grid-cols-3 gap-2">
                {(["ok", "damaged", "mismatch"] as Condition[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`rounded-lg border-2 p-3 text-center text-xs font-medium transition-all ${
                      condition === c
                        ? c === "ok"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : c === "damaged"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-red-500 bg-red-50 text-red-700"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    {c === "ok" && <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />}
                    {c === "damaged" && <AlertTriangle className="h-5 w-5 mx-auto mb-1" />}
                    {c === "mismatch" && <Eye className="h-5 w-5 mx-auto mb-1" />}
                    {conditionLabel(c)}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional notes */}
            {needsNotes && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-red-600">
                  Descreva o problema ou divergência *
                </label>
                <Textarea
                  placeholder="Ex.: Embalagem rompida, quantidade divergente, modelo incorreto..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="vp" onClick={handleSubmit}>
              <PackageCheck className="h-4 w-4 mr-1" /> Finalizar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}