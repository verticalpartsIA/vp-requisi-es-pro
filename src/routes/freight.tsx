import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck, Plus, ChevronRight, ChevronLeft, MapPin, Package, CalendarIcon, ClipboardList,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  { id: "M5-000028", title: "Frete Chapas Aço SP→CWB", requester: "Maria Costa", urgency: "MEDIUM", status: "COMPRA", date: "24/04" },
  { id: "M5-000027", title: "Transporte Equipamento RJ→SP", requester: "João Lima", urgency: "HIGH", status: "COTAÇÃO", date: "22/04" },
];

const VEHICLE_TYPES = [
  { value: "TRUCK", label: "Caminhão" },
  { value: "VAN", label: "Van/Furgão" },
  { value: "FLATBED", label: "Prancha" },
  { value: "CONTAINER", label: "Container" },
  { value: "OTHER", label: "Outro" },
];

const URGENCY = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

const STEPS = [
  { label: "Rota", icon: MapPin },
  { label: "Carga", icon: Package },
  { label: "Prazo", icon: ClipboardList },
];

export const Route = createFileRoute("/freight")({
  head: () => ({
    meta: [
      { title: "M5 Frete — VPRequisições" },
      { name: "description", content: "Requisição de frete e transporte" },
    ],
  }),
  component: FreightPage,
});

function FreightPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [cargoDescription, setCargoDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [fragile, setFragile] = useState(false);

  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [justification, setJustification] = useState("");

  const resetForm = () => {
    setStep(0);
    setOriginAddress(""); setDestinationAddress(""); setVehicleType("");
    setCargoDescription(""); setWeight(""); setDimensions(""); setFragile(false);
    setPickupDate(undefined); setUrgencyLevel(""); setJustification("");
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!originAddress.trim()) { toast.error("Informe o endereço de origem."); return false; }
      if (!destinationAddress.trim()) { toast.error("Informe o endereço de destino."); return false; }
      if (!vehicleType) { toast.error("Selecione o tipo de veículo."); return false; }
    }
    if (step === 1) {
      if (cargoDescription.length < 10) { toast.error("Descrição da carga deve ter pelo menos 10 caracteres."); return false; }
    }
    if (step === 2) {
      if (!pickupDate) { toast.error("Informe a data de coleta."); return false; }
      if (!urgencyLevel) { toast.error("Selecione o nível de urgência."); return false; }
      if (justification.length < 10) { toast.error("Justificativa deve ter pelo menos 10 caracteres."); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };

  const handleSubmit = () => {
    if (!validateStep()) return;
    toast.success("Requisição de frete criada!", { description: `${originAddress} → ${destinationAddress}` });
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Truck className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M5 — Frete</h1>
            <p className="text-sm text-muted-foreground">Transporte e logística</p>
          </div>
        </div>
        <Button variant="vp" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nova Requisição
        </Button>
      </div>

      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Truck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de frete ainda."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Frete</DialogTitle>
            <DialogDescription>Informe os dados do transporte.</DialogDescription>
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
                <label className="text-sm font-medium">Endereço de Origem *</label>
                <Input placeholder="Cidade, estado ou endereço completo" value={originAddress} onChange={(e) => setOriginAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Endereço de Destino *</label>
                <Input placeholder="Cidade, estado ou endereço completo" value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Veículo *</label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição da Carga *</label>
                <Textarea placeholder="O que será transportado? Quantidade, tipo..." value={cargoDescription} onChange={(e) => setCargoDescription(e.target.value)} rows={3} maxLength={500} />
                <p className="text-[11px] text-muted-foreground">{cargoDescription.length}/500</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Peso Estimado (kg)</label>
                  <Input type="number" min="0" placeholder="Ex.: 500" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Dimensões (CxLxA)</label>
                  <Input placeholder="Ex.: 2m x 1m x 0.5m" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <label className="text-sm font-medium">Carga Frágil?</label>
                  <p className="text-xs text-muted-foreground">Requer cuidados especiais no transporte</p>
                </div>
                <Switch checked={fragile} onCheckedChange={setFragile} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Data de Coleta *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pickupDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate}
                      disabled={(d) => d < addDays(new Date(), 1)} initialFocus className="p-3 pointer-events-auto" />
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
                <Textarea placeholder="Motivo do frete, urgência..." value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} maxLength={500} />
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
              <Button variant="vp" onClick={handleSubmit}><Truck className="h-4 w-4 mr-1" /> Enviar Requisição</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}