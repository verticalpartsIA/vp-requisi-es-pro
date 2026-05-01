import { supabaseBrowser } from "@/lib/supabase-browser";
import type { TicketRow } from "@/components/tickets-table";

interface ProductRequisitionInput {
  productName: string;
  description: string;
  quantity: number;
  technicalSpecs: string;
  brandPreference: string;
  modelReference: string;
  referenceLinks: string[];
  onlinePurchaseSuggestion: string;
  deliveryDeadline: string;
  deliveryLocation: string;
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  justification: string;
  requesterName: string;
  requesterEmail: string;
  requesterDepartment: string;
  requesterProfileId?: string;
}

export async function listProductRequisitionsClient() {
  const { data, error } = await supabaseBrowser
    .from("requisitions")
    .select("ticket_number,title,requester_name,urgency,status,created_at")
    .eq("module", "M1")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data || []) as Array<{
    ticket_number: string;
    title: string;
    requester_name: string;
    urgency: TicketRow["urgency"];
    status: TicketRow["status"];
    created_at: string;
  }>).map((item) => ({
    id: item.ticket_number,
    title: item.title,
    requester: item.requester_name,
    urgency: item.urgency,
    status: item.status,
    date: new Date(item.created_at).toLocaleDateString("pt-BR"),
  })) satisfies TicketRow[];
}

export async function createProductRequisitionClient(input: ProductRequisitionInput) {
  const { data, error } = await supabaseBrowser
    .from("requisitions")
    .insert({
      module: "M1",
      title: input.productName,
      description: input.description,
      justification: input.justification,
      urgency: input.urgencyLevel,
      desired_date: input.deliveryDeadline.slice(0, 10),
      requester_name: input.requesterName,
      requester_email: input.requesterEmail,
      requester_department: input.requesterDepartment,
      requester_profile_id: input.requesterProfileId ?? null,
      estimated_cost: null,
      module_data: {
        product_name: input.productName,
        quantity: input.quantity,
        technical_specs: input.technicalSpecs,
        brand_preference: input.brandPreference,
        model_reference: input.modelReference,
        reference_links: input.referenceLinks,
        online_purchase_suggestion: input.onlinePurchaseSuggestion,
        delivery_location: input.deliveryLocation,
      },
    })
    .select("id,ticket_number,status")
    .single();

  if (error) throw error;

  const { error: logError } = await supabaseBrowser
    .from("audit_logs")
    .insert({
      requisition_id: data.id,
      ticket_number: data.ticket_number,
      action: "REQUISITION_CREATED",
      new_status: data.status,
      details: {
        module: "M1",
      },
    });

  if (logError) throw logError;

  return {
    id: data.id,
    ticketNumber: data.ticket_number,
  };
}
