import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Wrench, Plus, ChevronRight, ChevronLeft, FileText, CalendarIcon, ClipboardList,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";
import { toast } from "sonner";

const sampleTickets: TicketRow[] = [
  { id: "M3-000018", title: "Consultoria ERP Financeiro", requester: "Roberto Alves", urgency: "LOW", status: "COTAÇÃO", date: "22/04" },
  { id: "M3-000017", title: "Manutenção Ar Condicionado", requester: "Lucia Ramos", urgency: "MEDIUM", status: "COMPRA", date: "20/04" },
  { id: "M3-000016", title: "Auditoria ISO 9001", requester: "Paulo Souza", urgency: "HIGH", status: "APROVAÇÃO", date: "18/04" },
  { id: "M3-000015", title: "Limpeza Industrial Anual", requester: "Marcos Reis", urgency: "MEDIUM", status: "CONCLUÍDO", date: "15/04" },
];

const SERVICE_TYPES = [
  { value: "CONSULTORIA", label: "Consultoria" },
  { value: "MANUTENCAO", label: "Manutenção" },
  { value: "PROJETO", label: "Projeto" },
  { value: "AUDITORIA", label: "Auditoria" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "OUTRO", label: "Outro" },
];

const URGENCY = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

const STEPS = [
  { label: "Serviço", icon: Wrench },
  { label: "Detalhes", icon: FileText },
  { label: "Prazo", icon: ClipboardList },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "M3 Serviços — VPRequisições" },
      { name: "description", content: "Requisição de serviços terceirizados" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");

  const [scopeOfWork, setScopeOfWork] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [executionLocation, setExecutionLocation] = useState("");

  const [deadline, setDeadline] = useState<Date | undefined>();
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [justification, setJustification] = useState("");

  const resetForm = () => {
    setStep(0);
    setServiceName(""); setServiceType(""); setDescription("");
    setScopeOfWork(""); setDeliverables(""); setExecutionLocation("");
    setDeadline(undefined); setUrgencyLevel(""); setJustification("");
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (serviceName.length < 5) { toast.error("Nome do serviço deve ter pelo menos 5 caracteres."); return false; }
      if (!serviceType) { toast.error("Selecione o tipo de serviço."); return false; }
      if (description.length < 20) { toast.error("Descrição deve ter pelo menos 20 caracteres."); return false; }
    }
    if (step === 1) {
      if (scopeOfWork.length < 10) { toast.error("Escopo deve ter pelo menos 10 caracteres."); return false; }
    }
    if (step === 2) {
      if (!deadline) { toast.error("Informe o prazo desejado."); return false; }
      if (!urgencyLevel) { toast.error("Selecione o nível de urgência."); return false; }
      if (justification.length < 10) { toast.error("Justificativa deve ter pelo menos 10 caracteres."); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };

  const handleSubmit = () => {
    if (!validateStep()) return;
    toast.success("Requisição de serviço criada!", { description: serviceName });
    setDialogOpen(false);
    resetForm();
  };

  const minDate = addDays(new Date(), 3);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Wrench className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M3 — Serviços</h1>
            <p className="text-sm text-muted-foreground">Consultoria, manutenção e projetos</p>
          </div>
        </div>
        <Button variant="vp" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nova Requisição
        </Button>
      </div>

      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Wrench className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de serviço ainda."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Serviço</DialogTitle>
            <DialogDescription>Descreva o serviço necessário.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <button key={s.label} type="button" onClick={() => { if (i < step) setStep(i); }}
                  className={cn("flex flex-col items-center gap-1 text-[10px] font-medium transition-colors flex-1",
                    active ? "text-vp-yellow-dark" : done ? "text-green-600" : "text-muted-foreground")}>
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    active ? "border-vp-yellow bg-amber-50" : done ? "border-green-500 bg-green-50" : "border-border")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {s.label}
                </button>
              );
            })}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome do Serviço *</label>
                <Input placeholder="Ex.: Manutenção Preventiva Ar Condicionado" value={serviceName} onChange={(e) => setServiceName(e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Serviço *</label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição Detalhada *</label>
                <Textarea placeholder="Descreva o serviço, contexto e necessidade..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} />
                <p className="text-[11px] text-muted-foreground">{description.length}/1000</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Escopo do Trabalho *</label>
                <Textarea placeholder="O que precisa ser feito? Quais atividades estão incluídas?" value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} rows={3} maxLength={1000} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Entregáveis Esperados</label>
                <Textarea placeholder="Relatório, laudo, execução concluída..." value={deliverables} onChange={(e) => setDeliverables(e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Local de Execução</label>
                <Input placeholder="Endereço, setor, área" value={executionLocation} onChange={(e) => setExecutionLocation(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Prazo Desejado *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={deadline} onSelect={setDeadline}
                      disabled={(d) => d < minDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nível de Urgência *</label>
                <div className="grid grid-cols-4 gap-2">
                  {URGENCY.map((u) => (
                    <button key={u.value} type="button" onClick={() => setUrgencyLevel(u.value)}
                      className={cn("rounded-lg border-2 p-2.5 text-xs font-medium text-center transition-all",
                        urgencyLevel === u.value
                          ? u.value === "LOW" ? "border-green-500 bg-green-50 text-green-700"
                          : u.value === "MEDIUM" ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : u.value === "HIGH" ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-red-500 bg-red-50 text-red-700"
                          : "border-border hover:border-muted-foreground/40")}>
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Justificativa *</label>
                <Textarea placeholder="Por que este serviço é necessário?" value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} maxLength={500} />
                <p className="text-[11px] text-muted-foreground">{justification.length}/500</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => step === 0 ? setDialogOpen(false) : setStep(step - 1)}>
              {step === 0 ? "Cancelar" : <><ChevronLeft className="h-4 w-4 mr-1" /> Voltar</>}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="vp" onClick={handleNext}>Próximo <ChevronRight className="h-4 w-4 ml-1" /></Button>
            ) : (
              <Button variant="vp" onClick={handleSubmit}><Wrench className="h-4 w-4 mr-1" /> Enviar Requisição</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}