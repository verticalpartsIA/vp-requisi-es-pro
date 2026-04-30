import { createFileRoute } from "@tanstack/react-router";
import { FileSearch, Plus, Trash2, Trophy, DollarSign, Clock, Scale, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/quoting")({
  component: QuotingPage,
});

/* ── Types ── */

type QuotationStatus = "pending" | "quoting" | "awaiting_proposals" | "selecting_winner" | "completed";
type WinCriteria = "price" | "deadline" | "price_deadline";

interface QueueItem {
  id: string;
  title: string;
  urgency: string;
  module: string;
  requesterNotes: string;
  status: QuotationStatus;
}

interface SupplierEntry {
  name: string;
  price: string;
  deadline: string;
  notes: string;
  proposalReceived: boolean;
}

/* ── Mock data (no monetary values on listing) ── */

const initialQueue: QueueItem[] = [
  { id: "M1-000065", title: "Parafusos Inox 304", urgency: "HIGH", module: "M1", requesterNotes: "Urgente para linha de produção. Aceitar somente grau A2-70.", status: "pending" },
  { id: "M2-000042", title: "Viagem SP - Cliente ABC", urgency: "MEDIUM", module: "M2", requesterNotes: "Preferência por voo direto. Hotel próximo ao cliente.", status: "pending" },
  { id: "M3-000018", title: "Consultoria ERP Financeiro", urgency: "LOW", module: "M3", requesterNotes: "Escopo: módulos fiscal e contábil. Mínimo 2 anos de experiência.", status: "pending" },
];

const urgLabel: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
  URGENT: "Urgente",
};

const statusLabel: Record<QuotationStatus, string> = {
  pending: "Pendente",
  quoting: "Em Cotação",
  awaiting_proposals: "Aguardando Propostas",
  selecting_winner: "Seleção de Vencedor",
  completed: "Concluída",
};

function urgBadge(u: string) {
  if (u === "HIGH") return "bg-orange-100 text-orange-700 border-orange-200";
  if (u === "MEDIUM") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function statusBadge(s: QuotationStatus) {
  if (s === "pending") return "bg-muted text-muted-foreground border-border";
  if (s === "quoting" || s === "awaiting_proposals") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "selecting_winner") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-green-50 text-green-700 border-green-200";
}

const criteriaLabels: Record<WinCriteria, { label: string; icon: React.ReactNode }> = {
  price: { label: "Menor Preço", icon: <DollarSign className="h-4 w-4" /> },
  deadline: { label: "Melhor Prazo", icon: <Clock className="h-4 w-4" /> },
  price_deadline: { label: "Preço + Prazo", icon: <Scale className="h-4 w-4" /> },
};

/* ── Component ── */

function QuotingPage() {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierEntry[]>([]);
  const [phase, setPhase] = useState<"suppliers" | "proposals" | "winner">("suppliers");
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [winCriteria, setWinCriteria] = useState<WinCriteria>("price");
  const [confirmDialog, setConfirmDialog] = useState(false);

  /* ── Handlers ── */

  const openQuotation = (item: QueueItem) => {
    setSelectedItem(item);
    setSuppliers([{ name: "", price: "", deadline: "", notes: "", proposalReceived: false }]);
    setPhase("suppliers");
    setWinnerIndex(null);
    setWinCriteria("price");
  };

  const addSupplier = () => {
    if (suppliers.length >= 3) return;
    setSuppliers((prev) => [...prev, { name: "", price: "", deadline: "", notes: "", proposalReceived: false }]);
  };

  const removeSupplier = (index: number) => {
    setSuppliers((prev) => prev.filter((_, i) => i !== index));
    if (winnerIndex === index) setWinnerIndex(null);
    else if (winnerIndex !== null && winnerIndex > index) setWinnerIndex(winnerIndex - 1);
  };

  const updateSupplier = (index: number, field: keyof SupplierEntry, value: string | boolean) => {
    setSuppliers((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const canAdvanceToProposals = suppliers.length > 0 && suppliers.every((s) => s.name.trim() !== "");

  const advanceToProposals = () => {
    setPhase("proposals");
    setQueue((prev) =>
      prev.map((q) => (q.id === selectedItem?.id ? { ...q, status: "awaiting_proposals" as QuotationStatus } : q))
    );
  };

  const allProposalsReceived = suppliers.every((s) => s.proposalReceived && s.price.trim() !== "");

  const advanceToWinner = () => {
    setPhase("winner");
    setQueue((prev) =>
      prev.map((q) => (q.id === selectedItem?.id ? { ...q, status: "selecting_winner" as QuotationStatus } : q))
    );
  };

  const finalizeQuotation = () => {
    if (winnerIndex === null) return;
    // Mark as completed
    setQueue((prev) =>
      prev.map((q) => (q.id === selectedItem?.id ? { ...q, status: "completed" as QuotationStatus } : q))
    );
    setConfirmDialog(false);
    setSelectedItem(null);
  };

  const closeDialog = () => {
    setSelectedItem(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <FileSearch className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">V2 — Cotação</h1>
          <p className="text-sm text-muted-foreground">Gestão de cotações multi-fornecedor</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["pending", "awaiting_proposals", "selecting_winner", "completed"] as QuotationStatus[]).map((s) => (
          <Card key={s} className="card-hover-yellow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{queue.filter((q) => q.status === s).length}</p>
              <p className="text-xs text-muted-foreground">{statusLabel[s]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queue — NO monetary values */}
      <div className="space-y-3">
        {queue.map((t) => (
          <Card key={t.id} className="card-hover-yellow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-mono text-xs">{t.id}</Badge>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Módulo: {t.module}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${statusBadge(t.status)}`}>
                  {statusLabel[t.status]}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${urgBadge(t.urgency)}`}>
                  {urgLabel[t.urgency] || t.urgency}
                </span>
                {t.status !== "completed" && (
                  <Button variant="vp" size="sm" onClick={() => openQuotation(t)}>
                    {t.status === "pending" ? "Cotar" : "Continuar"}
                  </Button>
                )}
                {t.status === "completed" && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Concluída
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Quotation Dialog ── */}
      <Dialog open={!!selectedItem && !confirmDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Cotação — {selectedItem?.id}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Requester notes */}
          {selectedItem?.requesterNotes && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">📋 Observações do Requisitante</p>
              <p className="text-sm text-amber-900">{selectedItem.requesterNotes}</p>
            </div>
          )}

          {/* Phase indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 font-medium ${phase === "suppliers" ? "bg-vp-yellow text-vp-dark" : "bg-muted text-muted-foreground"}`}>1. Fornecedores</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={`rounded-full px-3 py-1 font-medium ${phase === "proposals" ? "bg-vp-yellow text-vp-dark" : "bg-muted text-muted-foreground"}`}>2. Propostas</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={`rounded-full px-3 py-1 font-medium ${phase === "winner" ? "bg-vp-yellow text-vp-dark" : "bg-muted text-muted-foreground"}`}>3. Vencedor</span>
          </div>

          {/* ── Phase 1: Select Suppliers ── */}
          {phase === "suppliers" && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">Selecione até <strong>3 fornecedores</strong> para esta cotação.</p>
              {suppliers.map((sup, i) => (
                <Card key={i} className="border border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">Fornecedor {i + 1}</span>
                      {suppliers.length > 1 && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => removeSupplier(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nome do Fornecedor</Label>
                      <Input placeholder="Ex: ABC Ltda" value={sup.name} onChange={(e) => updateSupplier(i, "name", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {suppliers.length < 3 && (
                <Button variant="outline" size="sm" className="w-full" onClick={addSupplier}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Fornecedor ({suppliers.length}/3)
                </Button>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={closeDialog}>Cancelar</Button>
                <Button variant="vp" disabled={!canAdvanceToProposals} onClick={advanceToProposals}>
                  Enviar para Cotação <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── Phase 2: Receive Proposals ── */}
          {phase === "proposals" && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">Registre as propostas recebidas de cada fornecedor.</p>
              {suppliers.map((sup, i) => (
                <Card key={i} className={`border ${sup.proposalReceived ? "border-green-300 bg-green-50/30" : "border-border"}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{sup.name}</span>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sup.proposalReceived}
                          onChange={(e) => updateSupplier(i, "proposalReceived", e.target.checked)}
                          className="rounded border-border"
                        />
                        Proposta recebida
                      </label>
                    </div>
                    {sup.proposalReceived && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Preço (R$)</Label>
                          <Input placeholder="0,00" value={sup.price} onChange={(e) => updateSupplier(i, "price", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Prazo de Entrega</Label>
                          <Input type="date" value={sup.deadline} onChange={(e) => updateSupplier(i, "deadline", e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Observações</Label>
                          <Textarea placeholder="Condições, frete, garantia..." value={sup.notes} onChange={(e) => updateSupplier(i, "notes", e.target.value)} className="min-h-[60px]" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setPhase("suppliers")}>Voltar</Button>
                <Button variant="vp" disabled={!allProposalsReceived} onClick={advanceToWinner}>
                  Selecionar Vencedor <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── Phase 3: Select Winner ── */}
          {phase === "winner" && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">Compare as propostas e selecione o fornecedor vencedor.</p>

              {/* Criteria selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Critério de Vitória</Label>
                <div className="flex gap-2">
                  {(Object.keys(criteriaLabels) as WinCriteria[]).map((c) => (
                    <Button
                      key={c}
                      variant={winCriteria === c ? "vp" : "outline"}
                      size="sm"
                      onClick={() => setWinCriteria(c)}
                      className="text-xs"
                    >
                      {criteriaLabels[c].icon}
                      <span className="ml-1">{criteriaLabels[c].label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Supplier comparison */}
              <div className="space-y-3">
                {suppliers.map((sup, i) => (
                  <Card
                    key={i}
                    className={`border-2 cursor-pointer transition-all ${winnerIndex === i ? "border-vp-yellow bg-amber-50/50 shadow-md" : "border-border hover:border-vp-yellow/50"}`}
                    onClick={() => setWinnerIndex(i)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {winnerIndex === i && <Trophy className="h-5 w-5 text-vp-yellow-dark" />}
                          <div>
                            <p className="font-semibold text-sm text-foreground">{sup.name}</p>
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> R$ {sup.price}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sup.deadline}</span>
                            </div>
                            {sup.notes && <p className="text-xs text-muted-foreground mt-1">{sup.notes}</p>}
                          </div>
                        </div>
                        {winnerIndex === i && (
                          <Badge className="bg-vp-yellow text-vp-dark border-vp-yellow-dark">Vencedor</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setPhase("proposals")}>Voltar</Button>
                <Button
                  variant="vp"
                  disabled={winnerIndex === null}
                  onClick={() => setConfirmDialog(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Finalizar Cotação
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirm dialog ── */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Vencedor</DialogTitle>
            <DialogDescription>
              Esta ação enviará os dados ao Módulo V3 — Aprovação.
            </DialogDescription>
          </DialogHeader>
          {winnerIndex !== null && suppliers[winnerIndex] && (
            <div className="rounded-lg border border-vp-yellow bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-vp-yellow-dark" />
                <span className="font-semibold text-foreground">{suppliers[winnerIndex].name}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Valor: <strong className="text-foreground">R$ {suppliers[winnerIndex].price}</strong></p>
                <p>Prazo: <strong className="text-foreground">{suppliers[winnerIndex].deadline}</strong></p>
                <p>Critério: <strong className="text-foreground">{criteriaLabels[winCriteria].label}</strong></p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDialog(false)}>Cancelar</Button>
            <Button variant="vp" onClick={finalizeQuotation}>
              Confirmar e Enviar ao V3
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}