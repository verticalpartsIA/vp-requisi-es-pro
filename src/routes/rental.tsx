import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Key, Plus, ChevronRight, ChevronLeft, CalendarIcon, Cog, ClipboardList,
} from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
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
  { id: "M6-000012", title: "Guindaste 20t — Linha Produção", requester: "Pedro Santos", urgency: "HIGH", status: "APROVAÇÃO", date: "26/04" },
];

const EQUIPMENT_CATEGORIES = [
  { value: "GUINDASTE", label: "Guindaste" },
  { value: "PLATAFORMA", label: "Plataforma Elevatória" },
  { value: "GERADOR", label: "Gerador" },
  { value: "COMPRESSOR", label: "Compressor" },
  { value: "VEICULO", label: "Veículo" },
  { value: "OUTRO", label: "Outro" },
];

const URGENCY = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

const STEPS = [
  { label: "Equipamento", icon: Cog },
  { label: "Período", icon: CalendarIcon },
  { label: "Justificativa", icon: ClipboardList },
];

export const Route = createFileRoute("/rental")({
  head: () => ({
    meta: [
      { title: "M6 Locação — VPRequisições" },
      { name: "description", content: "Requisição de locação de equipamentos e veículos" },
    ],
  }),
  component: RentalPage,
});

function RentalPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [equipmentName, setEquipmentName] = useState("");
  const [category, setCategory] = useState("");
  const [specs, setSpecs] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [justification, setJustification] = useState("");

  const rentalDays = useMemo(() => {
    if (startDate && endDate) return differenceInCalendarDays(endDate, startDate);
    return 0;
  }, [startDate, endDate]);

  const resetForm = () => {
    setStep(0);
    setEquipmentName(""); setCategory(""); setSpecs(""); setQuantity("1");
    setStartDate(undefined); setEndDate(undefined); setDeliveryLocation("");
    setUrgencyLevel(""); setJustification("");
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (equipmentName.length < 3) { toast.error("Nome do equipamento deve ter pelo menos 3 caracteres."); return false; }
      if (!category) { toast.error("Selecione a categoria."); return false; }
      if (!quantity || parseInt(quantity) <= 0) { toast.error("Quantidade deve ser maior que 0."); return false; }
    }
    if (step === 1) {
      if (!startDate) { toast.error("Informe a data de início."); return false; }
      if (!endDate) { toast.error("Informe a data de término."); return false; }
      if (endDate <= startDate) { toast.error("Data de término deve ser posterior ao início."); return false; }
      if (!deliveryLocation.trim()) { toast.error("Informe o local de entrega."); return false; }
    }
    if (step === 2) {
      if (!urgencyLevel) { toast.error("Selecione o nível de urgência."); return false; }
      if (justification.length < 10) { toast.error("Justificativa deve ter pelo menos 10 caracteres."); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };

  const handleSubmit = () => {
    if (!validateStep()) return;
    toast.success("Requisição de locação criada!", { description: `${equipmentName} — ${rentalDays} dia(s)` });
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Key className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M6 — Locação</h1>
            <p className="text-sm text-muted-foreground">Equipamentos e veículos temporários</p>
          </div>
        </div>
        <Button variant="vp" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nova Requisição
        </Button>
      </div>

      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Key className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de locação ainda."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Locação</DialogTitle>
            <DialogDescription>Informe o equipamento e período de locação.</DialogDescription>
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
                <label className="text-sm font-medium">Nome do Equipamento *</label>
                <Input placeholder="Ex.: Guindaste 20 toneladas" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Categoria *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Especificações Técnicas</label>
                <Textarea placeholder="Capacidade, potência, requisitos especiais..." value={specs} onChange={(e) => setSpecs(e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Quantidade *</label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Data de Início *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate}
                        disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Data de Término *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate}
                        disabled={(d) => d < (startDate || new Date())} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {startDate && endDate && rentalDays > 0 && (
                <p className="text-sm text-muted-foreground">Período: <span className="font-semibold text-foreground">{rentalDays} dia(s)</span></p>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Local de Entrega *</label>
                <Input placeholder="Endereço, obra, setor" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
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
                <Textarea placeholder="Por que a locação é necessária? Alternativas consideradas..." value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} maxLength={500} />
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
              <Button variant="vp" onClick={handleSubmit}><Key className="h-4 w-4 mr-1" /> Enviar Requisição</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}