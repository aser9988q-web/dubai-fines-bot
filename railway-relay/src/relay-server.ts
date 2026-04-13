import "dotenv/config";
import express from "express";
import axios from "axios";
import helmet from "helmet";
import http from "node:http";
import https from "node:https";
import { ProxyAgent } from "proxy-agent";
import { scrapeDubaiFines } from "./scraper";

const app = express();

const PORT = Number.parseInt(process.env.RELAY_PORT || process.env.PORT || "8787", 10);
const RELAY_TOKEN = process.env.DUBAI_POLICE_RELAY_TOKEN?.trim() || "";
const DUBAI_POLICE_API = "https://www.dubaipolice.gov.ae/dpapp";

const API_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ar,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer:
    "https://www.dubaipolice.gov.ae/app/services/fine-payment/details",
  Origin: "https://www.dubaipolice.gov.ae",
};

const API_GET_HEADERS = {
  Accept: API_HEADERS.Accept,
  "Accept-Language": API_HEADERS["Accept-Language"],
  "User-Agent": API_HEADERS["User-Agent"],
  Referer: API_HEADERS.Referer,
  Origin: API_HEADERS.Origin,
};

const DEFAULT_HTTP_AGENT = new http.Agent({
  keepAlive: true,
  maxSockets: Number.parseInt(process.env.OUTBOUND_HTTP_MAX_SOCKETS || "200", 10) || 200,
  maxFreeSockets: Number.parseInt(process.env.OUTBOUND_HTTP_MAX_FREE_SOCKETS || "50", 10) || 50,
});

const DEFAULT_HTTPS_AGENT = new https.Agent({
  keepAlive: true,
  maxSockets: Number.parseInt(process.env.OUTBOUND_HTTPS_MAX_SOCKETS || "200", 10) || 200,
  maxFreeSockets: Number.parseInt(process.env.OUTBOUND_HTTPS_MAX_FREE_SOCKETS || "50", 10) || 50,
});

let cachedProxyUrl: string | null | undefined;
let cachedProxyAgent: ProxyAgent | null | undefined;

function normalizeProxyUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

function isDubaiPoliceProxyEnabled() {
  const raw = process.env.DUBAI_POLICE_PROXY_ENABLED?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function getDubaiPoliceProxyUrl() {
  if (!isDubaiPoliceProxyEnabled()) return null;

  const raw = [
    process.env.DUBAI_POLICE_PROXY_URL,
    process.env.OUTBOUND_PROXY_URL,
    process.env.HTTPS_PROXY,
    process.env.HTTP_PROXY,
  ].find((value) => typeof value === "string" && value.trim());

  return raw ? normalizeProxyUrl(raw) : null;
}

function redactProxyUrl(proxyUrl: string | null) {
  if (!proxyUrl) return "none";

  try {
    const parsed = new URL(proxyUrl);
    if (parsed.username) parsed.username = "***";
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "[invalid proxy url]";
  }
}

function getProxyAgent() {
  const proxyUrl = getDubaiPoliceProxyUrl();
  if (!proxyUrl) return null;

  if (cachedProxyUrl === proxyUrl && cachedProxyAgent) {
    return cachedProxyAgent;
  }

  cachedProxyUrl = proxyUrl;
  cachedProxyAgent = new ProxyAgent({
    getProxyForUrl: () => proxyUrl,
  });
  console.log(`[Relay] Dubai Police proxy enabled via ${redactProxyUrl(proxyUrl)}`);
  return cachedProxyAgent;
}

function getAxiosNetworkConfig() {
  const proxyAgent = getProxyAgent();
  if (!proxyAgent) {
    return {
      httpAgent: DEFAULT_HTTP_AGENT,
      httpsAgent: DEFAULT_HTTPS_AGENT,
    };
  }

  return {
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent,
    proxy: false as const,
  };
}

function parseRawJson(raw: unknown) {
  if (raw && typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("<")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function assertRelayToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!RELAY_TOKEN) {
    res.status(500).json({ success: false, errorMessage: "Relay token is not configured" });
    return;
  }

  const incoming = req.header("x-relay-token")?.trim() || "";
  if (!incoming || incoming !== RELAY_TOKEN) {
    res.status(401).json({ success: false, errorMessage: "Unauthorized relay request" });
    return;
  }

  next();
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json({ limit: "1mb" }));

app.get("/relay/health", (_req, res) => {
  res.json({ status: "ok", service: "dubai-police-relay", timestamp: new Date().toISOString() });
});

app.use("/relay", assertRelayToken);

app.post("/relay/scrape", async (req, res) => {
  const { plateSource, plateNumber, plateCode, plateCodeId, plateCategory } = req.body ?? {};

  try {
    const result = await scrapeDubaiFines(
      String(plateSource ?? ""),
      String(plateNumber ?? ""),
      String(plateCode ?? ""),
      {
        plateCodeId: typeof plateCodeId === "number" ? plateCodeId : undefined,
        plateCategory: typeof plateCategory === "number" ? plateCategory : undefined,
      }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(502).json({
      success: false,
      errorMessage: error instanceof Error ? error.message : "Relay scrape failed",
    });
  }
});

app.get("/relay/plate-data/:plateSrcCode", async (req, res) => {
  try {
    const response = await axios.get(
      `${DUBAI_POLICE_API}/finespayment/getPlateData/${encodeURIComponent(req.params.plateSrcCode)}`,
      {
        headers: API_GET_HEADERS,
        timeout: 15000,
        responseType: "text",
        transformResponse: [(data) => data],
        validateStatus: () => true,
        ...getAxiosNetworkConfig(),
      }
    );

    const data = parseRawJson(response.data);
    res.status(response.status >= 400 ? response.status : 200).json({
      success: response.status < 400,
      status: response.status,
      data,
      rawText: typeof response.data === "string" ? response.data.slice(0, 500) : undefined,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      errorMessage: error instanceof Error ? error.message : "Relay upstream request failed",
    });
  }
});

app.post("/relay/search-fines", async (req, res) => {
  const { inquiryType, plateNo, plateCat, plateSrcCode, plateCodeId } = req.body ?? {};

  try {
    const response = await axios.post(
      `${DUBAI_POLICE_API}/finespayment/searchFines`,
      {
        inquiryType: typeof inquiryType === "number" ? inquiryType : 3,
        plateNo,
        plateCat,
        plateSrcCode,
        plateCodeId,
      },
      {
        headers: API_HEADERS,
        timeout: 25000,
        responseType: "text",
        transformResponse: [(data) => data],
        validateStatus: () => true,
        ...getAxiosNetworkConfig(),
      }
    );

    const data = parseRawJson(response.data);
    res.status(response.status >= 400 ? response.status : 200).json({
      success: response.status < 400,
      status: response.status,
      data,
      rawText: typeof response.data === "string" ? response.data.slice(0, 500) : undefined,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      errorMessage: error instanceof Error ? error.message : "Relay upstream request failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Dubai Police relay server listening on http://localhost:${PORT}`);
});
