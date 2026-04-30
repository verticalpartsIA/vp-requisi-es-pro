import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Package, Plus, ChevronRight, ChevronLeft, FileText, Truck, DollarSign,
  Users, Link2, X, Upload, CalendarIcon,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";
import { toast } from "sonner";

const sampleTickets: TicketRow[] = [
  { id: "M1-000065", title: "Parafusos Inox 304 M10x50mm", requester: "Carlos Silva", urgency: "HIGH", status: "COTAÇÃO", date: "28/04" },
  { id: "M1-000064", title: "Luvas Nitrílicas Caixa c/100", requester: "Ana Souza", urgency: "MEDIUM", status: "APROVAÇÃO", date: "27/04" },
  { id: "M1-000063", title: "Óleo Hidráulico ISO 68 20L", requester: "João Lima", urgency: "URGENT", status: "ABERTO", date: "26/04" },
  { id: "M1-000062", title: "Disco de Corte 7\" Inox", requester: "Maria Costa", urgency: "LOW", status: "CONCLUÍDO", date: "24/04" },
  { id: "M1-000061", title: "Rolamento 6205 ZZ", requester: "Pedro Santos", urgency: "MEDIUM", status: "COMPRA", date: "22/04" },
];

const CATEGORIES = [
  { value: "MATERIAL", label: "Material" },
  { value: "EQUIPMENT", label: "Equipamento" },
  { value: "SUPPLY", label: "Insumo" },
  { value: "SERVICE", label: "Serviço" },
];

const UNITS = ["UN", "KG", "L", "M", "CX", "PCT", "PAR", "JG", "RL", "SC"];

const URGENCY = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

const BUDGET = [
  { value: "CAPEX", label: "CAPEX" },
  { value: "OPEX", label: "OPEX" },
  { value: "MAINTENANCE", label: "Manutenção" },
  { value: "EMERGENCY", label: "Emergencial" },
];

const STEPS = [
  { label: "Produto", icon: Package },
  { label: "Técnico", icon: FileText },
  { label: "Logística", icon: Truck },
  { label: "Orçamento", icon: DollarSign },
  { label: "Fornecedor", icon: Users },
];

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "M1 Produtos — VPRequisições" },
      { name: "description", content: "Requisição de produtos, materiais e equipamentos" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Step 1 — Product
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [estimatedUnitCost, setEstimatedUnitCost] = useState("");

  // Step 2 — Technical
  const [technicalSpecs, setTechnicalSpecs] = useState("");
  const [brandPreference, setBrandPreference] = useState("");
  const [modelReference, setModelReference] = useState("");
  const [referenceLinks, setReferenceLinks] = useState<string[]>([""]);
  const [onlinePurchaseSuggestion, setOnlinePurchaseSuggestion] = useState("");

  // Step 3 — Logistics
  const [deliveryDeadline, setDeliveryDeadline] = useState<Date | undefined>();
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [justification, setJustification] = useState("");

  // Step 4 — Budget
  const [costCenterCode, setCostCenterCode] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [budgetAllocation, setBudgetAllocation] = useState("");

  // Step 5 — Supplier
  const [preferredSupplier, setPreferredSupplier] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [existingContract, setExistingContract] = useState(false);

  const totalEstimated = (() => {
    const q = parseFloat(quantity);
    const u = parseFloat(estimatedUnitCost);
    if (!isNaN(q) && !isNaN(u)) return q * u;
    return 0;
  })();

  const resetForm = () => {
    setStep(0);
    setProductName(""); setDescription(""); setCategory(""); setQuantity("");
    setUnit(""); setEstimatedUnitCost(""); setTechnicalSpecs(""); setBrandPreference("");
    setModelReference(""); setReferenceLinks([""]); setOnlinePurchaseSuggestion("");
    setDeliveryDeadline(undefined); setDeliveryLocation(""); setUrgencyLevel("");
    setJustification(""); setCostCenterCode(""); setProjectCode("");
    setBudgetAllocation(""); setPreferredSupplier(""); setSupplierContact("");
    setExistingContract(false);
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (productName.length < 5) { toast.error("Nome do produto deve ter pelo menos 5 caracteres."); return false; }
      if (description.length < 20) { toast.error("Descrição deve ter pelo menos 20 caracteres."); return false; }
      if (!category) { toast.error("Selecione uma categoria."); return false; }
      if (!quantity || parseFloat(quantity) <= 0) { toast.error("Quantidade deve ser maior que 0."); return false; }
      if (!unit) { toast.error("Selecione a unidade de medida."); return false; }
    }
    if (step === 2) {
      if (!deliveryDeadline) { toast.error("Informe a data limite para entrega."); return false; }
      if (!deliveryLocation.trim()) { toast.error("Informe o local de entrega."); return false; }
      if (!urgencyLevel) { toast.error("Selecione o nível de urgência."); return false; }
      if (justification.length < 10) { toast.error("Justificativa deve ter pelo menos 10 caracteres."); return false; }
    }
    if (step === 3) {
      if (!costCenterCode.trim()) { toast.error("Informe o centro de custo."); return false; }
      if (!budgetAllocation) { toast.error("Selecione a alocação orçamentária."); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = () => {
    toast.success("Requisição criada com sucesso!", {
      description: `${productName} — ${parseFloat(quantity)} ${unit}`,
    });
    setDialogOpen(false);
    resetForm();
  };

  const addReferenceLink = () => {
    if (referenceLinks.length < 5) setReferenceLinks([...referenceLinks, ""]);
  };

  const updateReferenceLink = (idx: number, val: string) => {
    const copy = [...referenceLinks];
    copy[idx] = val;
    setReferenceLinks(copy);
  };

  const removeReferenceLink = (idx: number) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== idx));
  };

  const minDate = addDays(new Date(), 3);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Package className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M1 — Produtos</h1>
            <p className="text-sm text-muted-foreground">Materiais, insumos e equipamentos</p>
          </div>
        </div>
        <Button variant="vp" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
        </Button>
      </div>

      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de produto ainda."
      />

      {/* ---- Requisition Form Dialog ---- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Produto</DialogTitle>
            <DialogDescription>Preencha os dados para abrir a requisição.</DialogDescription>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => { if (i < step) setStep(i); }}
                  className={cn(
                    "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors flex-1",
                    active ? "text-vp-yellow-dark" : done ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    active ? "border-vp-yellow bg-amber-50" : done ? "border-green-500 bg-green-50" : "border-border"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* ---------- Step 0: Produto ---------- */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome do Produto/Material *</label>
                <Input placeholder="Ex.: Rolamento SKF 6205 ZZ" value={productName} onChange={(e) => setProductName(e.target.value)} maxLength={200} />
                <p className="text-[11px] text-muted-foreground">{productName.length}/200</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição Detalhada *</label>
                <Textarea placeholder="Descreva o material, aplicação e contexto de uso..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} />
                <p className="text-[11px] text-muted-foreground">{description.length}/1000</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Categoria *</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Unidade *</label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Quantidade *</label>
                  <Input type="number" min="0" step="0.01" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Preço Unit. Estimado (R$)</label>
                  <Input type="number" min="0" step="0.01" placeholder="0,00" value={estimatedUnitCost} onChange={(e) => setEstimatedUnitCost(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Total Estimado (R$)</label>
                  <Input readOnly value={totalEstimated > 0 ? totalEstimated.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "—"} className="bg-muted/50" />
                </div>
              </div>
            </div>
          )}

          {/* ---------- Step 1: Técnico ---------- */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Especificações Técnicas</label>
                <Textarea placeholder="Dimensões, material, potência, compatibilidade..." value={technicalSpecs} onChange={(e) => setTechnicalSpecs(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Marca Preferencial (opcional)</label>
                  <Input placeholder="Ex.: SKF, Bosch" value={brandPreference} onChange={(e) => setBrandPreference(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Modelo/Referência</label>
                  <Input placeholder="Ex.: 6205-2RS" value={modelReference} onChange={(e) => setModelReference(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5" /> Links de Referência
                </label>
                {referenceLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={link}
                      onChange={(e) => updateReferenceLink(idx, e.target.value)}
                    />
                    {referenceLinks.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeReferenceLink(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {referenceLinks.length < 5 && (
                  <Button variant="ghost" size="sm" onClick={addReferenceLink}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar link
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sugestão de Compra Online</label>
                <Textarea placeholder="URL da loja, produto específico, justificativa..." value={onlinePurchaseSuggestion} onChange={(e) => setOnlinePurchaseSuggestion(e.target.value)} rows={2} />
              </div>
            </div>
          )}

          {/* ---------- Step 2: Logística ---------- */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Data Limite para Entrega *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !deliveryDeadline && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDeadline ? format(deliveryDeadline, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDeadline}
                      onSelect={setDeliveryDeadline}
                      disabled={(d) => d < minDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Local de Entrega *</label>
                <Input placeholder="Endereço, andar, sala, setor" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nível de Urgência *</label>
                <div className="grid grid-cols-4 gap-2">
                  {URGENCY.map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUrgencyLevel(u.value)}
                      className={cn(
                        "rounded-lg border-2 p-2.5 text-xs font-medium text-center transition-all",
                        urgencyLevel === u.value
                          ? u.value === "LOW" ? "border-green-500 bg-green-50 text-green-700"
                          : u.value === "MEDIUM" ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : u.value === "HIGH" ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-red-500 bg-red-50 text-red-700"
                          : "border-border hover:border-muted-foreground/40"
                      )}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Justificativa da Compra *</label>
                <Textarea placeholder="Por que é necessário? Qual o impacto se não for comprado?" value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} maxLength={500} />
                <p className="text-[11px] text-muted-foreground">{justification.length}/500</p>
              </div>
            </div>
          )}

          {/* ---------- Step 3: Orçamento ---------- */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Código do Centro de Custo *</label>
                <Input placeholder="Ex.: CC-4200" value={costCenterCode} onChange={(e) => setCostCenterCode(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Código do Projeto (opcional)</label>
                <Input placeholder="Ex.: PRJ-2024-018" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Alocação Orçamentária *</label>
                <Select value={budgetAllocation} onValueChange={setBudgetAllocation}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {BUDGET.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {totalEstimated > 0 && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Resumo Financeiro</p>
                  <p className="text-lg font-bold">R$ {totalEstimated.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">{quantity} {unit} × R$ {parseFloat(estimatedUnitCost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              )}
            </div>
          )}

          {/* ---------- Step 4: Fornecedor ---------- */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Campos opcionais — preencha se já tiver um fornecedor em mente.</p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fornecedor Sugerido (opcional)</label>
                <Input placeholder="Nome do fornecedor" value={preferredSupplier} onChange={(e) => setPreferredSupplier(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Contato do Fornecedor</label>
                <Input placeholder="Telefone, email ou nome do contato" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="existing-contract" checked={existingContract} onCheckedChange={(v) => setExistingContract(v === true)} />
                <label htmlFor="existing-contract" className="text-sm">Possui contrato vigente com este fornecedor?</label>
              </div>

              {/* Review summary */}
              <div className="rounded-lg border-2 border-vp-yellow bg-amber-50/50 p-4 space-y-2 mt-4">
                <p className="text-xs font-semibold text-vp-yellow-dark">Resumo da Requisição</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Produto</span>
                  <span className="font-medium">{productName}</span>
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium">{CATEGORIES.find((c) => c.value === category)?.label}</span>
                  <span className="text-muted-foreground">Qtd</span>
                  <span className="font-medium">{quantity} {unit}</span>
                  {totalEstimated > 0 && (
                    <>
                      <span className="text-muted-foreground">Valor Estimado</span>
                      <span className="font-medium">R$ {totalEstimated.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Urgência</span>
                  <span className="font-medium">{URGENCY.find((u) => u.value === urgencyLevel)?.label}</span>
                  <span className="text-muted-foreground">Entrega até</span>
                  <span className="font-medium">{deliveryDeadline ? format(deliveryDeadline, "dd/MM/yyyy") : "—"}</span>
                  <span className="text-muted-foreground">Centro de Custo</span>
                  <span className="font-medium">{costCenterCode}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => step === 0 ? setDialogOpen(false) : setStep(step - 1)}>
              {step === 0 ? "Cancelar" : <><ChevronLeft className="h-4 w-4 mr-1" /> Voltar</>}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="vp" onClick={handleNext}>
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button variant="vp" onClick={handleSubmit}>
                <Package className="h-4 w-4 mr-1" /> Enviar Requisição
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}