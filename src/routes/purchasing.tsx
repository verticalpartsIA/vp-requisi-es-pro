import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingCart,
  Trophy,
  Clock,
  DollarSign,
  Scale,
  Eye,
  CheckCircle2,
  ArrowRight,
  Package,
  Plane,
  Wrench,
  Truck,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/purchasing")({
  component: PurchasingPage,
});

interface SupplierQuote {
  name: string;
  price: number;
  deadline: string;
  notes: string;
  isWinner: boolean;
}

interface PurchaseItem {
  id: string;
  title: string;
  module: string;
  category: "viagem" | "servico" | "frete" | "locacao" | "produto" | "manutencao";
  requesterName: string;
  requesterNotes: string;
  totalValue: number;
  approvalLevel: 1 | 2 | 3;
  winCriteria: "price" | "deadline" | "price_deadline";
  approvedBy: string;
  approvedAt: string;
  suppliers: SupplierQuote[];
  status: "pendente" | "finalizado" | "encaminhado_v5";
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; defaultV5: boolean }> = {
  viagem: { label: "Viagem", icon: <Plane className="h-4 w-4" />, defaultV5: false },
  servico: { label: "Serviço", icon: <Wrench className="h-4 w-4" />, defaultV5: false },
  frete: { label: "Frete", icon: <Truck className="h-4 w-4" />, defaultV5: false },
  locacao: { label: "Locação", icon: <Building2 className="h-4 w-4" />, defaultV5: false },
  produto: { label: "Bens Materiais", icon: <Package className="h-4 w-4" />, defaultV5: true },
  manutencao: { label: "Manutenção", icon: <Wrench className="h-4 w-4" />, defaultV5: false },
};

const winCriteriaLabel: Record<string, string> = {
  price: "Menor Preço",
  deadline: "Menor Prazo",
  price_deadline: "Melhor Preço / Prazo",
};

const winCriteriaIcon: Record<string, React.ReactNode> = {
  price: <DollarSign className="h-4 w-4" />,
  deadline: <Clock className="h-4 w-4" />,
  price_deadline: <Scale className="h-4 w-4" />,
};

const approvalLevelBadge: Record<number, string> = {
  1: "bg-green-100 text-green-700 border-green-200",
  2: "bg-yellow-100 text-yellow-700 border-yellow-200",
  3: "bg-red-100 text-red-700 border-red-200",
};

const mockPurchases: PurchaseItem[] = [
  {
    id: "M1-000065",
    title: "Parafusos Inox 304",
    module: "M1 — Produtos",
    category: "produto",
    requesterName: "Carlos Silva",
    requesterNotes: "Urgente para linha de montagem. Preferência por fornecedor com entrega rápida e que aceite boleto 30 dias.",
    totalValue: 2300,
    approvalLevel: 2,
    winCriteria: "price",
    approvedBy: "Diretor Financeiro",
    approvedAt: "29/04/2026 14:30",
    suppliers: [
      { name: "Aço & Cia Ltda", price: 2300, deadline: "05/05/2026", notes: "Frete incluso, boleto 30 dias", isWinner: true },
      { name: "Fastener Brasil", price: 2480, deadline: "03/05/2026", notes: "Frete por conta do comprador", isWinner: false },
      { name: "Inox Center SP", price: 2650, deadline: "07/05/2026", notes: "Inclui certificado de qualidade", isWinner: false },
    ],
    status: "pendente",
  },
  {
    id: "M2-000042",
    title: "Viagem SP - Cliente ABC",
    module: "M2 — Viagens",
    category: "viagem",
    requesterName: "Ana Rodrigues",
    requesterNotes: "Reunião presencial com cliente ABC para fechamento de contrato.",
    totalValue: 1200,
    approvalLevel: 1,
    winCriteria: "price_deadline",
    approvedBy: "Gerente Operacional",
    approvedAt: "28/04/2026 09:15",
    suppliers: [
      { name: "Viaje Bem Turismo", price: 1200, deadline: "01/05/2026", notes: "Inclui aéreo + hotel 2 noites", isWinner: true },
      { name: "CVC Corporativo", price: 1350, deadline: "01/05/2026", notes: "Apenas aéreo, hotel separado", isWinner: false },
    ],
    status: "pendente",
  },
  {
    id: "M3-000018",
    title: "Consultoria ERP Financeiro",
    module: "M3 — Serviços",
    category: "servico",
    requesterName: "Roberto Lima",
    requesterNotes: "Necessidade de consultoria especializada para implantação do módulo financeiro.",
    totalValue: 50000,
    approvalLevel: 3,
    winCriteria: "deadline",
    approvedBy: "Diretoria",
    approvedAt: "27/04/2026 16:00",
    suppliers: [
      { name: "Tech Solutions SA", price: 52000, deadline: "01/06/2026", notes: "Equipe de 3 consultores", isWinner: true },
      { name: "ConsultERP Ltda", price: 48000, deadline: "15/06/2026", notes: "Equipe de 2 consultores", isWinner: false },
      { name: "Digital Corp", price: 55000, deadline: "10/06/2026", notes: "Inclui treinamento", isWinner: false },
    ],
    status: "pendente",
  },
];

function PurchasingPage() {
  const [items, setItems] = useState<PurchaseItem[]>(mockPurchases);
  const [selected, setSelected] = useState<PurchaseItem | null>(null);
  const [sendToV5, setSendToV5] = useState(false);
  const [v5Reason, setV5Reason] = useState("");

  const openDetail = (item: PurchaseItem) => {
    setSelected(item);
    setSendToV5(categoryConfig[item.category]?.defaultV5 ?? false);
    setV5Reason("");
  };

  const handleFinalize = () => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selected.id
          ? { ...it, status: sendToV5 ? "encaminhado_v5" as const : "finalizado" as const }
          : it
      )
    );
    setSelected(null);
  };

  const pending = items.filter((i) => i.status === "pendente");
  const finalized = items.filter((i) => i.status === "finalizado");
  const forwarded = items.filter((i) => i.status === "encaminhado_v5");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <ShoppingCart className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">V4 — Compra</h1>
          <p className="text-sm text-muted-foreground">Execução e fechamento de aquisições aprovadas</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-hover-yellow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{pending.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="card-hover-yellow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{finalized.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Finalizadas</p>
          </CardContent>
        </Card>
        <Card className="card-hover-yellow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{forwarded.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Encaminhadas V5</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending items */}
      {pending.length === 0 && finalized.length === 0 && forwarded.length === 0 && (
        <Card className="card-hover-yellow">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Nenhuma compra aprovada pendente.</p>
          </CardContent>
        </Card>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Compras Pendentes</p>
          {pending.map((item) => {
            const winner = item.suppliers.find((s) => s.isWinner);
            const cat = categoryConfig[item.category];
            return (
              <Card key={item.id} className="card-hover-yellow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">{item.id}</Badge>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.module} • {item.requesterName} • Aprovado por {item.approvedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-accent/50 text-foreground">
                        {cat?.icon} {cat?.label}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${approvalLevelBadge[item.approvalLevel]}`}>
                        Nível {item.approvalLevel}
                      </span>
                      <Button variant="vp" size="sm" onClick={() => openDetail(item)}>
                        <Eye className="h-4 w-4 mr-1" /> Detalhar
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5 text-vp-yellow-dark" />
                    <span className="font-medium text-foreground">{winner?.name}</span>
                    <span>•</span>
                    <span>R$ {winner?.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    <span>•</span>
                    <span>Critério: {winCriteriaLabel[item.winCriteria]}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Finalized */}
      {finalized.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Finalizadas em V4</p>
          {finalized.map((item) => (
            <Card key={item.id} className="opacity-70">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <Badge variant="outline" className="font-mono text-xs">{item.id}</Badge>
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">Compra finalizada</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Forwarded to V5 */}
      {forwarded.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Encaminhadas para V5 — Recebimento</p>
          {forwarded.map((item) => (
            <Card key={item.id} className="opacity-70 border-dashed">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline" className="font-mono text-xs">{item.id}</Badge>
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">Aguardando recebimento</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (() => {
            const winner = selected.suppliers.find((s) => s.isWinner);
            const cat = categoryConfig[selected.category];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg flex items-center gap-2">
                    Compra — {selected.id}
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-accent/50 text-foreground">
                      {cat?.icon} {cat?.label}
                    </span>
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {selected.title} • {selected.module}
                  </p>
                </DialogHeader>

                {/* Approved info banner */}
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Aprovado por <strong>{selected.approvedBy}</strong> em {selected.approvedAt}
                  </span>
                </div>

                {/* Requester notes */}
                <Card className="border-dashed border-vp-yellow/50">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Observações do Requisitante — {selected.requesterName}
                    </p>
                    <p className="text-sm text-foreground">{selected.requesterNotes}</p>
                  </CardContent>
                </Card>

                {/* Win criteria */}
                <div className="flex items-center gap-2 rounded-lg bg-accent/50 p-3">
                  {winCriteriaIcon[selected.winCriteria]}
                  <span className="text-sm font-semibold text-foreground">
                    Critério de vitória: {winCriteriaLabel[selected.winCriteria]}
                  </span>
                </div>

                {/* Suppliers (readonly) */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">
                    Fornecedores Cotados ({selected.suppliers.length})
                  </p>
                  {selected.suppliers.map((sup, i) => (
                    <Card
                      key={i}
                      className={`border ${sup.isWinner ? "border-vp-yellow bg-vp-yellow/5 ring-1 ring-vp-yellow/30" : "border-border"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{sup.name}</span>
                            {sup.isWinner && (
                              <Badge className="bg-vp-yellow/20 text-vp-yellow-dark border-vp-yellow/40 text-[10px]">
                                <Trophy className="h-3 w-3 mr-1" /> Vencedor
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono text-sm font-bold text-foreground">
                            R$ {sup.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Prazo: {sup.deadline}
                          </div>
                          <div>Obs: {sup.notes}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* V5 routing exception */}
                <Card className="border border-dashed">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="send-v5"
                        checked={sendToV5}
                        onCheckedChange={(v) => setSendToV5(!!v)}
                      />
                      <div>
                        <Label htmlFor="send-v5" className="text-sm font-semibold text-foreground cursor-pointer">
                          Encaminhar para Recebimento (V5)?
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cat?.defaultV5
                            ? "Esta categoria requer recebimento por padrão."
                            : "Itens desta categoria normalmente finalizam em V4. Marque se precisar de comprovação de entrega."}
                        </p>
                      </div>
                    </div>
                    {sendToV5 && (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Motivo do encaminhamento (opcional)</Label>
                        <Textarea
                          placeholder="Ex.: necessita comprovação de entrega, controle de estoque..."
                          value={v5Reason}
                          onChange={(e) => setV5Reason(e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {sendToV5 && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-xs text-amber-700">
                      Ao finalizar, esta compra será roteada para o módulo V5 — Recebimento.
                    </span>
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => setSelected(null)}>
                    Cancelar
                  </Button>
                  <Button variant="vp" onClick={handleFinalize} className="gap-1">
                    {sendToV5 ? (
                      <><ArrowRight className="h-4 w-4" /> Finalizar e Encaminhar V5</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Finalizar Compra</>
                    )}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}