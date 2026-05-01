import { supabaseBrowser } from "@/lib/supabase-browser";
import type { ApprovalRequestItem } from "@/features/approvals/api";

type WinCriteria = "price" | "deadline" | "price_deadline";

function moduleLabel(module: string) {
  if (module === "M1") return "M1 — Produtos";
  if (module === "M2") return "M2 — Viagens";
  if (module === "M3") return "M3 — Serviços";
  if (module === "M4") return "M4 — Manutenção";
  if (module === "M5") return "M5 — Frete";
  return "M6 — Locação";
}

export async function listPendingApprovalsClient() {
  const currentUser = (await supabaseBrowser.auth.getUser()).data.user;
  const { data: roleRows, error: roleRowsError } = await supabaseBrowser
    .from("user_roles")
    .select("role,approval_tier")
    .eq("user_id", currentUser?.id || "");
  if (roleRowsError) throw roleRowsError;

  const hasAdminRole = (roleRows || []).some((item) => item.role === "admin");
  const maxApprovalTier = Math.max(
    0,
    ...(roleRows || [])
      .filter((item) => item.role === "aprovador")
      .map((item) => item.approval_tier || 0),
  );

  const { data: approvals, error: approvalsError } = await supabaseBrowser
    .from("approvals")
    .select("id,requisition_id,quotation_id,approval_level,total_value,decision")
    .eq("decision", "pending")
    .order("created_at", { ascending: true });
  if (approvalsError) throw approvalsError;
  const filteredApprovals = (approvals || []).filter((item) => hasAdminRole || item.approval_level <= maxApprovalTier);
  if (!filteredApprovals.length) return [] satisfies ApprovalRequestItem[];

  const requisitionIds = filteredApprovals.map((item) => item.requisition_id);
  const { data: requisitions, error: requisitionsError } = await supabaseBrowser
    .from("requisitions")
    .select("id,ticket_number,module,title,justification,requester_name,status,created_at")
    .in("id", requisitionIds)
    .eq("status", "APROVAÇÃO");
  if (requisitionsError) throw requisitionsError;

  const quotationIds = filteredApprovals.map((item) => item.quotation_id).filter(Boolean) as string[];
  const { data: quotations, error: quotationsError } = quotationIds.length === 0
    ? { data: [], error: null }
    : await supabaseBrowser.from("quotations").select("id,requisition_id,win_criteria").in("id", quotationIds);
  if (quotationsError) throw quotationsError;

  const { data: suppliers, error: suppliersError } = quotationIds.length === 0
    ? { data: [], error: null }
    : await supabaseBrowser
        .from("quotation_suppliers")
        .select("quotation_id,supplier_name,price,deadline,notes,is_winner")
        .in("quotation_id", quotationIds);
  if (suppliersError) throw suppliersError;

  const requisitionById = new Map((requisitions || []).map((item) => [item.id, item]));
  const quotationByRequisition = new Map((quotations || []).map((item) => [item.requisition_id, item]));
  const suppliersByQuotation = new Map<string, typeof suppliers>();

  (suppliers || []).forEach((supplier) => {
    const current = suppliersByQuotation.get(supplier.quotation_id) || [];
    current.push(supplier);
    suppliersByQuotation.set(supplier.quotation_id, current);
  });

  return filteredApprovals
    .map((approval) => {
      const requisition = requisitionById.get(approval.requisition_id);
      if (!requisition) return null;
      const quotation = quotationByRequisition.get(requisition.id);
      const approvalSuppliers = quotation ? suppliersByQuotation.get(quotation.id) || [] : [];

      return {
        requisitionId: requisition.id,
        approvalId: approval.id,
        quotationId: quotation?.id || null,
        id: requisition.ticket_number,
        title: requisition.title,
        module: moduleLabel(requisition.module),
        requesterName: requisition.requester_name,
        requesterNotes: requisition.justification,
        totalValue: approval.total_value || 0,
        approvalLevel: approval.approval_level as 1 | 2 | 3,
        winCriteria: (quotation?.win_criteria as WinCriteria | null) || "price",
        suppliers: approvalSuppliers.map((supplier) => ({
          name: supplier.supplier_name,
          price: supplier.price || 0,
          deadline: supplier.deadline || "—",
          notes: supplier.notes || "",
          isWinner: supplier.is_winner,
        })),
        createdAt: new Date(requisition.created_at).toLocaleDateString("pt-BR"),
      };
    })
    .filter(Boolean) as ApprovalRequestItem[];
}

export async function approveRequisitionClient(approvalId: string, requisitionId: string, justification: string) {
  const { data: requisition, error: requisitionError } = await supabaseBrowser
    .from("requisitions")
    .select("ticket_number,status")
    .eq("id", requisitionId)
    .single();
  if (requisitionError) throw requisitionError;

  const { error: approvalError } = await supabaseBrowser
    .from("approvals")
    .update({
      decision: "approved",
      justification: justification || null,
      decided_at: new Date().toISOString(),
      approver_id: (await supabaseBrowser.auth.getUser()).data.user?.id ?? null,
    })
    .eq("id", approvalId);
  if (approvalError) throw approvalError;

  const { error: requisitionUpdateError } = await supabaseBrowser
    .from("requisitions")
    .update({ status: "COMPRA" })
    .eq("id", requisitionId);
  if (requisitionUpdateError) throw requisitionUpdateError;

  const { error: logError } = await supabaseBrowser.from("audit_logs").insert({
    requisition_id: requisitionId,
    ticket_number: requisition.ticket_number,
    action: "APPROVAL_GRANTED",
    old_status: requisition.status,
    new_status: "COMPRA",
    details: { justification },
  });
  if (logError) throw logError;
}

export async function rejectRequisitionClient(approvalId: string, requisitionId: string, justification: string) {
  const { data: requisition, error: requisitionError } = await supabaseBrowser
    .from("requisitions")
    .select("ticket_number,status")
    .eq("id", requisitionId)
    .single();
  if (requisitionError) throw requisitionError;

  const { error: approvalError } = await supabaseBrowser
    .from("approvals")
    .update({
      decision: "rejected",
      justification: justification || null,
      decided_at: new Date().toISOString(),
      approver_id: (await supabaseBrowser.auth.getUser()).data.user?.id ?? null,
    })
    .eq("id", approvalId);
  if (approvalError) throw approvalError;

  const { error: requisitionUpdateError } = await supabaseBrowser
    .from("requisitions")
    .update({ status: "REJEITADO" })
    .eq("id", requisitionId);
  if (requisitionUpdateError) throw requisitionUpdateError;

  const { error: logError } = await supabaseBrowser.from("audit_logs").insert({
    requisition_id: requisitionId,
    ticket_number: requisition.ticket_number,
    action: "APPROVAL_REJECTED",
    old_status: requisition.status,
    new_status: "REJEITADO",
    details: { justification },
  });
  if (logError) throw logError;
}
