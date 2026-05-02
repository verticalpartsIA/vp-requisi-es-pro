/**
 * Traduz erros do Supabase/PostgREST para mensagens amigáveis ao usuário.
 */
export function friendlySupabaseError(error: unknown): string {
  const msg =
    error instanceof Error
      ? error.message
      : (error as { message?: string })?.message ?? "";

  if (msg.includes("row-level security") || msg.includes("42501")) {
    return "Sem permissão para realizar esta ação. Contate o administrador do sistema.";
  }
  if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
    return "Registro já existente. Verifique os dados e tente novamente.";
  }
  if (msg.includes("foreign key") || msg.includes("violates foreign key")) {
    return "Referência inválida. Verifique os dados e tente novamente.";
  }
  if (msg.includes("not-null") || msg.includes("null value in column")) {
    return "Campo obrigatório não preenchido. Verifique os dados.";
  }
  if (msg.includes("JWT") || msg.includes("invalid token") || msg.includes("token is expired")) {
    return "Sessão expirada. Faça login novamente.";
  }
  return msg || "Não foi possível realizar a operação. Tente novamente.";
}
