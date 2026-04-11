import "dotenv/config";
import express from "express";
import axios from "axios";
import helmet from "helmet";
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
  const { plateSource, plateNumber, plateCode } = req.body ?? {};

  try {
    const result = await scrapeDubaiFines(String(plateSource ?? ""), String(plateNumber ?? ""), String(plateCode ?? ""));
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
        headers: API_HEADERS,
        timeout: 15000,
        responseType: "text",
        transformResponse: [(data) => data],
        validateStatus: () => true,
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
