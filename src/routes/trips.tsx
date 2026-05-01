import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Plane, Plus, ChevronRight, ChevronLeft, MapPin, Hotel,
  CalendarIcon, Car, Target, AlertTriangle,
} from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
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
  { id: "M2-000042", title: "Viagem SP — Cliente ABC Ltda", requester: "João Silva", urgency: "HIGH", status: "APROVAÇÃO", date: "27/04" },
  { id: "M2-000041", title: "Treinamento RJ — NR-12", requester: "Ana Costa", urgency: "MEDIUM", status: "COTAÇÃO", date: "25/04" },
  { id: "M2-000040", title: "Feira Industrial Hannover", requester: "Carlos Lima", urgency: "LOW", status: "ABERTO", date: "23/04" },
];

const TRANSPORT_MODES = [
  { value: "AVIAO", label: "Avião" },
  { value: "CARRO_EMPRESA", label: "Carro da Empresa" },
  { value: "CARRO_PROPRIO", label: "Carro Próprio" },
  { value: "ONIBUS", label: "Ônibus" },
];

const PURPOSES = [
  { value: "OBRA", label: "Obra" },
  { value: "CURSO", label: "Curso" },
  { value: "VISITA_CLIENTE", label: "Visita a Cliente" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "EVENTO_FEIRA", label: "Evento/Feira" },
];

const STEPS = [
  { label: "Roteiro", icon: MapPin },
  { label: "Hospedagem", icon: Hotel },
  { label: "Objetivo", icon: Target },
];

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "M2 Viagens — VPRequisições" },
      { name: "description", content: "Requisição de viagens corporativas" },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Step 0 — Route
  const [travelerName, setTravelerName] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [transportMode, setTransportMode] = useState("");

  // Step 1 — Accommodation
  const [needsHotel, setNeedsHotel] = useState(false);
  const [hotelNights, setHotelNights] = useState("");
  const [needsLocalCar, setNeedsLocalCar] = useState(false);

  // Step 2 — Purpose
  const [purposes, setPurposes] = useState<string[]>([]);
  const [justification, setJustification] = useState("");
  const [shortNoticeJustification, setShortNoticeJustification] = useState("");

  const durationDays = useMemo(() => {
    if (departureDate && returnDate) return differenceInCalendarDays(returnDate, departureDate);
    return 0;
  }, [departureDate, returnDate]);

  const isAdvancedNotice = useMemo(() => {
    if (!departureDate) return true;
    return differenceInCalendarDays(departureDate, new Date()) >= 5;
  }, [departureDate]);

  const resetForm = () => {
    setStep(0);
    setTravelerName(""); setOriginCity(""); setDestinationCity("");
    setDepartureDate(undefined); setReturnDate(undefined); setTransportMode("");
    setNeedsHotel(false); setHotelNights(""); setNeedsLocalCar(false);
    setPurposes([]); setJustification(""); setShortNoticeJustification("");
  };

  const togglePurpose = (val: string) => {
    setPurposes((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!travelerName.trim()) { toast.error("Informe o nome do viajante."); return false; }
      if (!originCity.trim()) { toast.error("Informe a cidade de origem."); return false; }
      if (!destinationCity.trim()) { toast.error("Informe a cidade de destino."); return false; }
      if (!departureDate) { toast.error("Informe a data de partida."); return false; }
      if (!returnDate) { toast.error("Informe a data de retorno."); return false; }
      if (returnDate <= departureDate) { toast.error("Data de retorno deve ser posterior à partida."); return false; }
      if (!transportMode) { toast.error("Selecione o meio de transporte."); return false; }
    }
    if (step === 1) {
      if (needsHotel && (!hotelNights || parseInt(hotelNights) <= 0)) {
        toast.error("Informe o número de noites de hotel."); return false;
      }
    }
    if (step === 2) {
      if (purposes.length === 0) { toast.error("Selecione pelo menos um objetivo."); return false; }
      if (justification.length < 20) { toast.error("Justificativa deve ter pelo menos 20 caracteres."); return false; }
      if (!isAdvancedNotice && shortNoticeJustification.length < 50) {
        toast.error("Justificativa de urgência deve ter pelo menos 50 caracteres."); return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };

  const handleSubmit = () => {
    if (!validateStep()) return;
    toast.success("Requisição de viagem criada!", {
      description: `${originCity} → ${destinationCity} (${durationDays} dias)`,
    });
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Plane className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M2 — Viagens</h1>
            <p className="text-sm text-muted-foreground">Passagens, hotel e despesas</p>
          </div>
        </div>
        <Button variant="vp" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nova Requisição
        </Button>
      </div>

      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Plane className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de viagem ainda."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Viagem</DialogTitle>
            <DialogDescription>Preencha os dados da viagem corporativa.</DialogDescription>
          </DialogHeader>

          {/* Stepper */}
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

          {/* Step 0: Roteiro */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome do Viajante *</label>
                <Input placeholder="Nome completo" value={travelerName} onChange={(e) => setTravelerName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cidade de Origem *</label>
                  <Input placeholder="Ex.: São Paulo" value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cidade de Destino *</label>
                  <Input placeholder="Ex.: Curitiba" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Data de Partida *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !departureDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departureDate ? format(departureDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate}
                        disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Data de Retorno *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={returnDate} onSelect={setReturnDate}
                        disabled={(d) => d < (departureDate || new Date())} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {departureDate && returnDate && durationDays > 0 && (
                <p className="text-sm text-muted-foreground">Duração: <span className="font-semibold text-foreground">{durationDays} dia(s)</span></p>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Meio de Transporte *</label>
                <Select value={transportMode} onValueChange={setTransportMode}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {TRANSPORT_MODES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 1: Hospedagem */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <label className="text-sm font-medium">Precisa de Hotel?</label>
                  <p className="text-xs text-muted-foreground">Marque se necessita hospedagem</p>
                </div>
                <Switch checked={needsHotel} onCheckedChange={setNeedsHotel} />
              </div>
              {needsHotel && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Noites de Hotel *</label>
                  <Input type="number" min="1" placeholder="0" value={hotelNights} onChange={(e) => setHotelNights(e.target.value)} />
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <label className="text-sm font-medium">Carro Alocado no Destino?</label>
                  <p className="text-xs text-muted-foreground">Necessita locação de veículo</p>
                </div>
                <Switch checked={needsLocalCar} onCheckedChange={setNeedsLocalCar} />
              </div>
            </div>
          )}

          {/* Step 2: Objetivo */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Objetivo da Viagem * (selecione um ou mais)</label>
                <div className="grid grid-cols-2 gap-2">
                  {PURPOSES.map((p) => (
                    <button key={p.value} type="button" onClick={() => togglePurpose(p.value)}
                      className={cn("rounded-lg border-2 p-2.5 text-xs font-medium text-center transition-all",
                        purposes.includes(p.value) ? "border-vp-yellow bg-amber-50 text-vp-yellow-dark" : "border-border hover:border-muted-foreground/40")}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Justificativa *</label>
                <Textarea placeholder="Descreva o motivo da viagem..." value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} maxLength={500} />
                <p className="text-[11px] text-muted-foreground">{justification.length}/500</p>
              </div>
              {!isAdvancedNotice && (
                <div className="space-y-1.5 rounded-lg border-2 border-orange-300 bg-orange-50 p-3">
                  <label className="text-sm font-medium flex items-center gap-1 text-orange-700">
                    <AlertTriangle className="h-4 w-4" /> Justificativa de Urgência *
                  </label>
                  <p className="text-xs text-orange-600">Viagem com menos de 5 dias de antecedência requer justificativa detalhada (mín. 50 caracteres).</p>
                  <Textarea placeholder="Explique a urgência..." value={shortNoticeJustification}
                    onChange={(e) => setShortNoticeJustification(e.target.value)} rows={3} maxLength={500} />
                  <p className="text-[11px] text-muted-foreground">{shortNoticeJustification.length}/500</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => step === 0 ? setDialogOpen(false) : setStep(step - 1)}>
              {step === 0 ? "Cancelar" : <><ChevronLeft className="h-4 w-4 mr-1" /> Voltar</>}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="vp" onClick={handleNext}>Próximo <ChevronRight className="h-4 w-4 ml-1" /></Button>
            ) : (
              <Button variant="vp" onClick={handleSubmit}><Plane className="h-4 w-4 mr-1" /> Enviar Requisição</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}