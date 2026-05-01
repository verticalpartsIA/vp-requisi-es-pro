function getEnvValue(name: string) {
  return process.env[name];
}

function requireEnv(name: string) {
  const value = getEnvValue(name);

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: requireEnv("VITE_SUPABASE_URL"),
    anonKey: requireEnv("VITE_SUPABASE_ANON_KEY"),
  };
}

export function getSupabaseEnv() {
  return {
    ...getSupabasePublicEnv(),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getDefaultRequester() {
  return {
    name: getEnvValue("DEFAULT_REQUESTER_NAME") || "Operador VerticalParts",
    email: getEnvValue("DEFAULT_REQUESTER_EMAIL") || "operador@verticalparts.com.br",
    department: getEnvValue("DEFAULT_REQUESTER_DEPARTMENT") || "Compras",
  };
}
