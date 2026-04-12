const normalizeEnvValue = (value: string | undefined | null): string => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

export const ENV = {
  appId: normalizeEnvValue(process.env.VITE_APP_ID),
  cookieSecret: normalizeEnvValue(process.env.JWT_SECRET),
  databaseUrl: normalizeEnvValue(process.env.DATABASE_URL),
  oAuthServerUrl: normalizeEnvValue(process.env.OAUTH_SERVER_URL),
  ownerOpenId: normalizeEnvValue(process.env.OWNER_OPEN_ID),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: normalizeEnvValue(process.env.BUILT_IN_FORGE_API_URL),
  forgeApiKey: normalizeEnvValue(process.env.BUILT_IN_FORGE_API_KEY),
};
