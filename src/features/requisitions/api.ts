import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDefaultRequester } from "@/lib/env";
import type { TicketRow } from "@/components/tickets-table";
import type { ProductModuleData, RequisitionRecord } from "@/lib/requisitions";
import { supabaseRest } from "@/lib/supabase-rest";

const productRequisitionSchema = z.object({
  productName: z.string().min(5).max(200),
  description: z.string().min(20).max(1000),
  quantity: z.number().positive(),
  technicalSpecs: z.string().max(2000).optional().default(""),
  brandPreference: z.string().max(200).optional().default(""),
  modelReference: z.string().max(200).optional().default(""),
  referenceLinks: z.array(z.string().max(500)).max(5),
  onlinePurchaseSuggestion: z.string().max(1000).optional().default(""),
  deliveryDeadline: z.string(),
  deliveryLocation: z.string().min(1).max(500),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  justification: z.string().min(10).max(500),
});

function mapProductTicket(ticket: RequisitionRecord): TicketRow {
  return {
    id: ticket.ticket_number,
    title: ticket.title,
    requester: ticket.requester_name,
    urgency: ticket.urgency,
    status: ticket.status,
    date: format(new Date(ticket.created_at), "dd/MM", { locale: ptBR }),
  };
}

export const listProductRequisitions = createServerFn({ method: "GET" }).handler(async () => {
  const response = await supabaseRest<RequisitionRecord[]>(
    "requisitions?select=id,ticket_number,module,title,description,justification,urgency,status,requester_name,requester_email,requester_department,desired_date,created_at,completed_at,module_data&module=eq.M1&order=created_at.desc&limit=20",
  );

  return response.data.map(mapProductTicket);
});

export const createProductRequisition = createServerFn({ method: "POST" })
  .inputValidator(productRequisitionSchema)
  .handler(async ({ data }) => {
    const requester = getDefaultRequester();
    const moduleData: ProductModuleData = {
      product_name: data.productName,
      quantity: data.quantity,
      technical_specs: data.technicalSpecs,
      brand_preference: data.brandPreference,
      model_reference: data.modelReference,
      reference_links: data.referenceLinks,
      online_purchase_suggestion: data.onlinePurchaseSuggestion,
      delivery_location: data.deliveryLocation,
    };

    const response = await supabaseRest<RequisitionRecord[]>("requisitions", {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: [
        {
          module: "M1",
          title: data.productName,
          description: data.description,
          justification: data.justification,
          urgency: data.urgencyLevel,
          status: "ABERTO",
          desired_date: data.deliveryDeadline,
          requester_name: requester.name,
          requester_email: requester.email,
          requester_department: requester.department,
          module_data: moduleData,
        },
      ],
    });

    const created = response.data[0];

    if (!created) {
      throw new Error("A requisição foi enviada, mas o Supabase não retornou o registro criado.");
    }

    await supabaseRest("audit_logs", {
      method: "POST",
      body: [
        {
          requisition_id: created.id,
          ticket_number: created.ticket_number,
          action: "REQUISITION_CREATED",
          new_status: "ABERTO",
          actor_name: requester.name,
          details: {
            module: "M1",
            urgency: data.urgencyLevel,
          },
        },
      ],
    });

    return {
      id: created.id,
      ticketNumber: created.ticket_number,
    };
  });
