import React, { useState } from 'react';
import { X, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { submitHousingRequest } from '../lib/api.ts';

interface HousingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HousingRequestModal: React.FC<HousingRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [budget, setBudget] = useState<number>(1500);
  const [gender, setGender] = useState<string>('بنين');
  const [people, setPeople] = useState<number>(2);
  const [area, setArea] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!whatsapp.trim() || whatsapp.trim().length < 10) {
      setError('يرجى إدخال رقم واتساب صحيح للتواصل معك');
      return;
    }

    if (!budget || budget <= 0) {
      setError('يرجى تحديد الميزانية الشهرية التقريبية');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitHousingRequest({
        budget,
        gender,
        people,
        area: area.trim() || 'أي منطقة قريبة من الجامعة',
        whatsapp: whatsapp.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setArea('');
    setWhatsapp('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E4DDD0] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#FAF3E5] px-6 py-4 border-b border-[#E8DCBF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A15E] text-[#17140F] flex items-center justify-center font-bold">
              ❓
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B1712]">
                طلب سكن مخصص (مجاني)
              </h2>
              <span className="text-xs text-[#6B6255]">
                مش لاقي شقة تناسبك؟ سنبحث لك مباشرة وبدون أي عمولة!
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B6255] hover:text-[#1B1712] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-[#1B1712]">
                تم استلام طلبك بنجاح!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6255] max-w-sm mx-auto leading-relaxed">
                سيتواصل معك فريق <strong>أركان للتسويق العقاري</strong> عبر رقم الواتساب ({whatsapp}) فور توفر شقة تطابق مواصفاتك وميزانيتك.
              </p>
              <button
                onClick={handleReset}
                className="bg-[#17140F] hover:bg-[#2A241B] text-[#FAF7F1] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                إغلاق والعودة للتصفح
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                  الميزانية الشهرية المتوقعة (جنيه) *
                </label>
                <input
                  type="number"
                  min="300"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                  placeholder="مثال: 1500"
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3.5 py-2.5 text-sm text-[#1B1712] outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                  نوع السكن المطلوب *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('بنين')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      gender === 'بنين'
                        ? 'bg-[#17140F] text-[#C9A15E] border-[#17140F]'
                        : 'bg-[#FAF7F1] text-[#6B6255] border-[#E4DDD0] hover:bg-white'
                    }`}
                  >
                    طلاب (بنين)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('بنات')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      gender === 'بنات'
                        ? 'bg-[#17140F] text-[#C9A15E] border-[#17140F]'
                        : 'bg-[#FAF7F1] text-[#6B6255] border-[#E4DDD0] hover:bg-white'
                    }`}
                  >
                    طالبات (بنات)
                  </button>
                </div>
              </div>

              {/* People Count */}
              <div>
                <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                  عدد الأفراد / الطلاب *
                </label>
                <select
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3.5 py-2.5 text-sm text-[#1B1712] outline-none cursor-pointer"
                >
                  <option value={1}>طالب واحد (فردي / استوديو)</option>
                  <option value={2}>2 طلاب</option>
                  <option value={3}>3 طلاب</option>
                  <option value={4}>4 طلاب</option>
                  <option value={5}>5 طلاب فأكثر (مجموعة)</option>
                </select>
              </div>

              {/* Preferred Area */}
              <div>
                <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                  المنطقة أو الشارع المفضل (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: المساعيد، شارع البحر، بجوار البوابة مباشرة..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3.5 py-2.5 text-sm text-[#1B1712] outline-none"
                />
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                  رقم الواتساب للتواصل معك *
                </label>
                <input
                  type="tel"
                  placeholder="مثال: 01550454849"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3.5 py-2.5 text-sm text-[#1B1712] outline-none text-right font-mono"
                />
                <span className="text-[11px] text-[#6B6255] mt-1 block">
                  سنرسل لك عروض الشقق المتوافقة مباشرة عبر واتساب بدون إزعاج
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'جارٍ إرسال الطلب...' : 'إرسال طلب السكن مجانًا'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
