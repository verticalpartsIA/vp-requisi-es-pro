/**
 * VP Click — wrapper client-side
 *
 * Chame sempre com void + .catch para que erros de integração nunca bloqueiem o fluxo principal.
 * Exemplo: void notifyVpClickClient({ ... }).catch(console.warn)
 */

import { notifyVpClickStage } from "@/features/vpclick/server";

export type VpClickStage =
  | "V1"
  | "V2"
  | "V3_approved"
  | "V3_rejected"
  | "V4"
  | "V5";

export interface VpClickNotifyInput {
  stage: VpClickStage;
  requisitionId: string;
  ticketNumber: string;
  title: string;
  module: string;
  requesterName: string;
  requiresReceipt?: boolean;
}

export async function notifyVpClickClient(input: VpClickNotifyInput): Promise<void> {
  await notifyVpClickStage({
    data: {
      ...input,
      requiresReceipt: input.requiresReceipt ?? false,
    },
  });
}
