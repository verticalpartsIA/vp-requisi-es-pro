import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Trophy, Clock, DollarSign, Scale, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/approval")({
  component: ApprovalPage,
});

interface SupplierQuote {
  name: string;
  price: number;
  deadline: string;
  notes: string;
  isWinner: boolean;
}

interface ApprovalRequest {
  id: string;
  title: string;
  module: string;
  requesterName: string;
  requesterNotes: string;
  totalValue: number;
  approvalLevel: 1 | 2 | 3;
  winCriteria: "price" | "deadline" | "price_deadline";
  suppliers: SupplierQuote[];
  createdAt: string;
}

const approvalLevelLabel: Record<number, string> = {
  1: "Nível 1 — até R$ 1.500,00",
  2: "Nível 2 — R$ 1.500,01 a R$ 3.000,00",
  3: "Nível 3 — acima de R$ 3.000,01",
};

const approvalLevelBadge: Record<number, string> = {
  1: "bg-green-100 text-green-700 border-green-200",
  2: "bg-yellow-100 text-yellow-700 border-yellow-200",
  3: "bg-red-100 text-red-700 border-red-200",
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

function getApprovalLevel(value: number): 1 | 2 | 3 {
  if (value <= 1500) return 1;
  if (value <= 3000) return 2;
  return 3;
}

const mockApprovals: ApprovalRequest[] = [
  {
    id: "M1-000065",
    title: "Parafusos Inox 304",
    module: "M1 — Produtos",
    requesterName: "Carlos Silva",
    requesterNotes: "Urgente para linha de montagem. Preferência por fornecedor com entrega rápida e que aceite boleto 30 dias.",
    totalValue: 2300,
    approvalLevel: getApprovalLevel(2300),
    winCriteria: "price",
    suppliers: [
      { name: "Aço & Cia Ltda", price: 2300, deadline: "05/05/2026", notes: "Frete incluso, boleto 30 dias", isWinner: true },
      { name: "Fastener Brasil", price: 2480, deadline: "03/05/2026", notes: "Frete por conta do comprador", isWinner: false },
      { name: "Inox Center SP", price: 2650, deadline: "07/05/2026", notes: "Inclui certificado de qualidade", isWinner: false },
    ],
    createdAt: "28/04/2026",
  },
  {
    id: "M2-000042",
    title: "Viagem SP - Cliente ABC",
    module: "M2 — Viagens",
    requesterName: "Ana Rodrigues",
    requesterNotes: "Reunião presencial com cliente ABC para fechamento de contrato. Hotel próximo ao escritório do cliente.",
    totalValue: 1200,
    approvalLevel: getApprovalLevel(1200),
    winCriteria: "price_deadline",
    suppliers: [
      { name: "Viaje Bem Turismo", price: 1200, deadline: "01/05/2026", notes: "Inclui aéreo + hotel 2 noites", isWinner: true },
      { name: "CVC Corporativo", price: 1350, deadline: "01/05/2026", notes: "Apenas aéreo, hotel separado", isWinner: false },
    ],
    createdAt: "27/04/2026",
  },
  {
    id: "M3-000018",
    title: "Consultoria ERP Financeiro",
    module: "M3 — Serviços",
    requesterName: "Roberto Lima",
    requesterNotes: "Necessidade de consultoria especializada para implantação do módulo financeiro. Deve ter experiência com nosso ERP.",
    totalValue: 50000,
    approvalLevel: getApprovalLevel(50000),
    winCriteria: "deadline",
    suppliers: [
      { name: "Tech Solutions SA", price: 52000, deadline: "01/06/2026", notes: "Equipe de 3 consultores, experiência no ERP", isWinner: true },
      { name: "ConsultERP Ltda", price: 48000, deadline: "15/06/2026", notes: "Equipe de 2 consultores", isWinner: false },
      { name: "Digital Corp", price: 55000, deadline: "10/06/2026", notes: "Inclui treinamento da equipe", isWinner: false },
    ],
    createdAt: "25/04/2026",
  },
];

function ApprovalPage() {
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [justification, setJustification] = useState("");

  const handleApprove = () => {
    setSelected(null);
    setJustification("");
  };

  const handleReject = () => {
    setSelected(null);
    setJustification("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <CheckCircle2 className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">V3 — Aprovação</h1>
          <p className="text-sm text-muted-foreground">Aprovações pendentes da diretoria</p>
        </div>
      </div>

      {/* Summary by level */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((level) => {
          const count = mockApprovals.filter((a) => a.approvalLevel === level).length;
          return (
            <Card key={level} className="card-hover-yellow">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {level === 1 && "Nível 1 (até R$ 1.500)"}
                  {level === 2 && "Nível 2 (R$ 1.500–3.000)"}
                  {level === 3 && "Nível 3 (acima R$ 3.000)"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Approval cards */}
      <div className="space-y-3">
        {mockApprovals.map((req) => {
          const winner = req.suppliers.find((s) => s.isWinner);
          return (
            <Card key={req.id} className="card-hover-yellow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">{req.id}</Badge>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{req.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.module} • Requisitante: {req.requesterName} • {req.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${approvalLevelBadge[req.approvalLevel]}`}>
                      Nível {req.approvalLevel}
                    </span>
                    <Button variant="vp" size="sm" onClick={() => setSelected(req)}>
                      <Eye className="h-4 w-4 mr-1" /> Analisar
                    </Button>
                  </div>
                </div>

                {/* Winner summary */}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5 text-vp-yellow-dark" />
                  <span className="font-medium text-foreground">{winner?.name}</span>
                  <span>•</span>
                  <span>R$ {winner?.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  <span>•</span>
                  <span>Critério: {winCriteriaLabel[req.winCriteria]}</span>
                  <span>•</span>
                  <span>{req.suppliers.length} fornecedor(es)</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg flex items-center gap-2">
                  Aprovação — {selected.id}
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${approvalLevelBadge[selected.approvalLevel]}`}>
                    {approvalLevelLabel[selected.approvalLevel]}
                  </span>
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {selected.title} • {selected.module}
                </p>
              </DialogHeader>

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

              {/* Suppliers comparison */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Comparativo de Fornecedores ({selected.suppliers.length})
                </p>
                {selected.suppliers.map((sup, i) => (
                  <Card
                    key={i}
                    className={`border ${sup.isWinner ? "border-vp-yellow bg-vp-yellow/5 ring-1 ring-vp-yellow/30" : "border-border"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {sup.name}
                          </span>
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
                          <Clock className="h-3 w-3" />
                          Prazo: {sup.deadline}
                        </div>
                        <div>Obs: {sup.notes}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Justification + actions */}
              <div className="space-y-2">
                <Label className="text-sm">Justificativa (opcional)</Label>
                <Textarea
                  placeholder="Adicione observações sobre a decisão..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="gap-1"
                >
                  <ThumbsDown className="h-4 w-4" /> Reprovar
                </Button>
                <Button
                  variant="vp"
                  onClick={handleApprove}
                  className="gap-1"
                >
                  <ThumbsUp className="h-4 w-4" /> Aprovar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}