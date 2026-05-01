import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  HardHat, Plus, ChevronRight, ChevronLeft, Cog, AlertTriangle, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";
import { toast } from "sonner";

const sampleTickets: TicketRow[] = [
  { id: "M4-000031", title: "Prensa Hidráulica — Vazamento", requester: "Carlos Mota", urgency: "URGENT", status: "ABERTO", date: "25/04" },
  { id: "M4-000030", title: "Esteira Transportadora — Rolamento", requester: "André Lopes", urgency: "HIGH", status: "COTAÇÃO", date: "24/04" },
  { id: "M4-000029", title: "Compressor Ar — Preventiva", requester: "Rita Gomes", urgency: "MEDIUM", status: "COMPRA", date: "22/04" },
  { id: "M4-000028", title: "CNC Torno — Troca Ferramenta", requester: "Felipe Dias", urgency: "HIGH", status: "RECEBIMENTO", date: "20/04" },
  { id: "M4-000027", title: "Ponte Rolante — Inspeção NR-11", requester: "Jorge Nunes", urgency: "LOW", status: "CONCLUÍDO", date: "18/04" },
];

const MAINTENANCE_TYPES = [
  { value: "CORRETIVA", label: "Corretiva" },
  { value: "PREVENTIVA", label: "Preventiva" },
  { value: "PREDITIVA", label: "Preditiva" },
];

const URGENCY = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

const STEPS = [
  { label: "Equipamento", icon: Cog },
  { label: "Problema", icon: AlertTriangle },
  { label: "Prioridade", icon: ClipboardList },
];

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "M4 Manutenção — VPRequisições" },
      { name: "description", content: "Requisição de manutenção industrial" },
    ],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentTag, setEquipmentTag] = useState("");
  const [sector, setSector] = useState("");

  const [maintenanceType, setMaintenanceType] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [machineDown, setMachineDown] = useState(false);

  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [justification, setJustification] = useState("");

  const resetForm = () => {
    setStep(0);
    setEquipmentName(""); setEquipmentTag(""); setSector("");
    setMaintenanceType(""); setProblemDescription(""); setMachineDown(false);
    setUrgencyLevel(""); setJustification("");
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (equipmentName.length < 3) { toast.error("Nome do equipamento deve ter pelo menos 3 caracteres."); return false; }
      if (!sector.trim()) { toast.error("Informe o setor."); return false; }
    }
    if (step === 1) {
      if (!maintenanceType) { toast.error("Selecione o tipo de manutenção."); return false; }
      if (problemDescription.length < 20) { toast.error("Descrição do problema deve ter pelo menos 20 caracteres."); return false; }
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
    toast.success("Requisição de manutenção criada!", { description: equipmentName });
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <HardHat className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M4 — Manutenção</h1>
            <p className="text-sm text-muted-foreground">Corretiva, preventiva e preditiva</p>
          </div>
        </div>
        <Button variant="vp" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nova Requisição
        </Button>
      </div>

      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<HardHat className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de manutenção ainda."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Manutenção</DialogTitle>
            <DialogDescription>Informe o equipamento e o problema.</DialogDescription>
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
                <Input placeholder="Ex.: Prensa Hidráulica 200t" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">TAG / Patrimônio</label>
                  <Input placeholder="Ex.: PH-001" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Setor / Linha *</label>
                  <Input placeholder="Ex.: Linha 3 — Usinagem" value={sector} onChange={(e) => setSector(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Manutenção *</label>
                <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição do Problema *</label>
                <Textarea placeholder="Descreva o defeito, sintoma ou necessidade..." value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} rows={4} maxLength={1000} />
                <p className="text-[11px] text-muted-foreground">{problemDescription.length}/1000</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <div>
                  <label className="text-sm font-medium text-red-700">Máquina Parada?</label>
                  <p className="text-xs text-red-600">Marque se o equipamento está inoperante</p>
                </div>
                <Switch checked={machineDown} onCheckedChange={setMachineDown} />
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
              {machineDown && (
                <div className="rounded-lg border-2 border-red-300 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Equipamento parado — prioridade elevada automaticamente
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Justificativa *</label>
                <Textarea placeholder="Impacto na produção, riscos de segurança..." value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} maxLength={500} />
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
              <Button variant="vp" onClick={handleSubmit}><HardHat className="h-4 w-4 mr-1" /> Enviar Requisição</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}