import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Car,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Shield,
  Loader2,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
} from "lucide-react";

interface FineResult {
  fineNumber?: string;
  fineDate?: string;
  description?: string;
  amount?: string;
  blackPoints?: number;
  isPaid?: "paid" | "unpaid" | "partial";
  location?: string;
}

interface QueryResult {
  success: boolean;
  queryId: number;
  fines: FineResult[];
  totalAmount?: string;
  totalFines?: number;
  errorMessage?: string;
}

export default function Home() {
  const [plateSource, setPlateSource] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [plateCode, setPlateCode] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: options } = trpc.fines.getOptions.useQuery();
  const { data: history, refetch: refetchHistory } = trpc.fines.getHistory.useQuery(
    { limit: 10 },
    { enabled: showHistory }
  );

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      setResult(data as QueryResult);
      if (data.success && data.totalFines === 0) {
        toast.success("لا توجد مخالفات مسجلة على هذه اللوحة");
      } else if (data.success && (data.totalFines ?? 0) > 0) {
        toast.warning(`تم العثور على ${data.totalFines} مخالفة`);
      } else if (!data.success) {
        toast.error(data.errorMessage || "فشل الاستعلام");
      }
      refetchHistory();
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء الاستعلام: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateSource) {
      toast.error("يرجى اختيار الإمارة");
      return;
    }
    if (!plateNumber.trim()) {
      toast.error("يرجى إدخال رقم اللوحة");
      return;
    }
    if (!plateCode) {
      toast.error("يرجى اختيار كود اللوحة");
      return;
    }
    setResult(null);
    queryMutation.mutate({ plateSource, plateNumber: plateNumber.trim(), plateCode });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      success: { label: "ناجح", variant: "default" },
      failed: { label: "فشل", variant: "destructive" },
      no_fines: { label: "لا مخالفات", variant: "secondary" },
      pending: { label: "جاري...", variant: "outline" },
    };
    return map[status] || { label: status, variant: "outline" };
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-full p-2">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نظام استعلام المخالفات المرورية</h1>
              <p className="text-sm text-primary-foreground/70">شرطة دبي - خدمة إلكترونية</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نموذج الاستعلام */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border-border">
              <CardHeader className="bg-secondary/50 rounded-t-lg border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Car className="w-5 h-5 text-primary" />
                  الاستعلام عن المخالفات المرورية
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  أدخل بيانات اللوحة للاستعلام عن المخالفات من موقع شرطة دبي
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* الإمارة */}
                    <div className="space-y-2">
                      <Label htmlFor="plateSource" className="text-foreground font-semibold">
                        الإمارة <span className="text-destructive">*</span>
                      </Label>
                      <Select value={plateSource} onValueChange={setPlateSource}>
                        <SelectTrigger id="plateSource" className="w-full bg-background">
                          <SelectValue placeholder="اختر الإمارة" />
                        </SelectTrigger>
                        <SelectContent>
                          {options?.plateSources.map((src) => (
                            <SelectItem key={src.value} value={src.value}>
                              {src.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* رقم اللوحة */}
                    <div className="space-y-2">
                      <Label htmlFor="plateNumber" className="text-foreground font-semibold">
                        رقم اللوحة <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="plateNumber"
                        type="text"
                        placeholder="مثال: 12345"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="bg-background text-center font-bold text-lg tracking-widest"
                        maxLength={10}
                        dir="ltr"
                      />
                    </div>

                    {/* كود اللوحة */}
                    <div className="space-y-2">
                      <Label htmlFor="plateCode" className="text-foreground font-semibold">
                        كود اللوحة <span className="text-destructive">*</span>
                      </Label>
                      <Select value={plateCode} onValueChange={setPlateCode}>
                        <SelectTrigger id="plateCode" className="w-full bg-background">
                          <SelectValue placeholder="اختر الكود" />
                        </SelectTrigger>
                        <SelectContent>
                          {options?.plateCodes.map((code) => (
                            <SelectItem key={code.value} value={code.value}>
                              {code.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* معاينة اللوحة */}
                  {(plateNumber || plateCode || plateSource) && (
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-2">معاينة اللوحة</p>
                      <div className="inline-flex items-center gap-2 bg-white border-2 border-primary rounded-lg px-6 py-3 shadow-sm">
                        <span className="text-primary font-bold text-lg">{plateCode || "—"}</span>
                        <Separator orientation="vertical" className="h-8 bg-primary/30" />
                        <span className="font-bold text-2xl tracking-widest text-foreground" dir="ltr">
                          {plateNumber || "——"}
                        </span>
                        <Separator orientation="vertical" className="h-8 bg-primary/30" />
                        <span className="text-muted-foreground text-xs">{plateSource || "—"}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base"
                    disabled={queryMutation.isPending}
                  >
                    {queryMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري الاستعلام من موقع شرطة دبي...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 ml-2" />
                        استعلام عن المخالفات
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* نتائج الاستعلام */}
            {queryMutation.isPending && (
              <Card className="border-primary/20 shadow-md">
                <CardContent className="py-12 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-foreground font-semibold text-lg">جاري الاستعلام من موقع شرطة دبي</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    يتم الاتصال بالموقع الرسمي وجلب البيانات، قد يستغرق هذا بضع ثوانٍ...
                  </p>
                </CardContent>
              </Card>
            )}

            {result && !queryMutation.isPending && (
              <div className="space-y-4 animate-fade-in-up">
                {/* ملخص النتائج */}
                <Card
                  className={`border-2 shadow-md ${
                    !result.success
                      ? "border-destructive/50 bg-destructive/5"
                      : result.totalFines === 0
                      ? "border-green-500/50 bg-green-50"
                      : "border-amber-500/50 bg-amber-50"
                  }`}
                >
                  <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-3 ${
                          !result.success
                            ? "bg-destructive/10"
                            : result.totalFines === 0
                            ? "bg-green-100"
                            : "bg-amber-100"
                        }`}
                      >
                        {!result.success ? (
                          <AlertTriangle className="w-8 h-8 text-destructive" />
                        ) : result.totalFines === 0 ? (
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        {!result.success ? (
                          <>
                            <h3 className="font-bold text-destructive text-lg">فشل الاستعلام</h3>
                            <p className="text-muted-foreground text-sm mt-1">{result.errorMessage}</p>
                          </>
                        ) : result.totalFines === 0 ? (
                          <>
                            <h3 className="font-bold text-green-700 text-lg">لا توجد مخالفات</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              لا توجد مخالفات مرورية مسجلة على هذه اللوحة
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-amber-700 text-lg">
                              تم العثور على {result.totalFines} مخالفة
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              إجمالي المبلغ المستحق:{" "}
                              <span className="font-bold text-destructive">
                                {result.totalAmount} درهم
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                      {result.success && (result.totalFines ?? 0) > 0 && (
                        <div className="text-left">
                          <div className="bg-destructive/10 rounded-lg px-4 py-3 text-center">
                            <p className="text-xs text-muted-foreground">الإجمالي</p>
                            <p className="text-2xl font-bold text-destructive">{result.totalAmount}</p>
                            <p className="text-xs text-muted-foreground">درهم إماراتي</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* تفاصيل المخالفات */}
                {result.fines && result.fines.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      تفاصيل المخالفات
                    </h3>
                    {result.fines.map((fine, index) => (
                      <Card key={index} className="fine-card border border-border shadow-sm">
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {fine.fineNumber && (
                                  <Badge variant="outline" className="text-xs font-mono">
                                    #{fine.fineNumber}
                                  </Badge>
                                )}
                                <Badge
                                  variant={
                                    fine.isPaid === "paid"
                                      ? "default"
                                      : fine.isPaid === "partial"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {fine.isPaid === "paid"
                                    ? "مدفوعة"
                                    : fine.isPaid === "partial"
                                    ? "مدفوعة جزئياً"
                                    : "غير مدفوعة"}
                                </Badge>
                                {(fine.blackPoints ?? 0) > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {fine.blackPoints} نقطة سوداء
                                  </Badge>
                                )}
                              </div>
                              {fine.description && (
                                <p className="text-sm text-foreground font-medium">{fine.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                {fine.fineDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {fine.fineDate}
                                  </span>
                                )}
                                {fine.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {fine.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            {fine.amount && (
                              <div className="text-left shrink-0">
                                <div className="flex items-center gap-1 text-destructive font-bold text-lg">
                                  <DollarSign className="w-4 h-4" />
                                  {fine.amount}
                                </div>
                                <p className="text-xs text-muted-foreground">درهم</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* رسالة عند عدم وجود تفاصيل */}
                {result.success && result.totalFines === 0 && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="py-8 text-center">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-bold text-lg">سجل نظيف!</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        لا توجد أي مخالفات مرورية مسجلة على هذه اللوحة
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-4">
            {/* معلومات الخدمة */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  عن الخدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>استعلام مباشر من موقع شرطة دبي الرسمي</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>نتائج فورية ومحدّثة</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>حفظ سجل الاستعلامات السابقة</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>دعم جميع إمارات الدولة</span>
                </div>
                <Separator />
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-700 text-xs font-medium flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    هذه خدمة تعليمية. البيانات تُجلب من الموقع الرسمي لشرطة دبي.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* سجل الاستعلامات */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    الاستعلامات الأخيرة
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    {showHistory ? "إخفاء" : "عرض"}
                  </Button>
                </div>
              </CardHeader>
              {showHistory && (
                <CardContent className="pt-0">
                  {!history || history.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      لا توجد استعلامات سابقة
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((q) => {
                        const statusInfo = getStatusBadge(q.status);
                        return (
                          <div
                            key={q.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                            onClick={() => {
                              setPlateSource(q.plateSource);
                              setPlateNumber(q.plateNumber);
                              setPlateCode(q.plateCode);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-mono font-bold text-foreground truncate" dir="ltr">
                                {q.plateCode} {q.plateNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">{q.plateSource}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={statusInfo.variant} className="text-xs">
                                {statusInfo.label}
                              </Badge>
                              {q.totalFines != null && q.totalFines > 0 && (
                                <span className="text-xs text-destructive font-bold">
                                  {q.totalFines}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* إحصائيات سريعة */}
            {result?.success && (
              <Card className="shadow-sm border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    نتيجة الاستعلام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-foreground">{result.totalFines ?? 0}</p>
                      <p className="text-xs text-muted-foreground">عدد المخالفات</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-destructive">{result.totalAmount ?? "0"}</p>
                      <p className="text-xs text-muted-foreground">درهم إجمالاً</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-12 py-6">
        <div className="container text-center">
          <p className="text-sm text-primary-foreground/70">
            نظام استعلام المخالفات المرورية — مبني على خدمات شرطة دبي الإلكترونية
          </p>
          <p className="text-xs text-primary-foreground/50 mt-1">
            للأغراض التعليمية فقط
          </p>
        </div>
      </footer>
    </div>
  );
}
