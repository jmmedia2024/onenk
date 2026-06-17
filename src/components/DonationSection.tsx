import React, { useState, useEffect } from 'react';
import { Landmark, Award, ShieldCheck, Heart, Users, Receipt, Share2, Clipboard, Check } from 'lucide-react';
import { DonationPledge } from '../types';

export default function DonationSection() {
  const [pledges, setPledges] = useState<DonationPledge[]>([]);
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState<number>(30000);
  const [customAmount, setCustomAmount] = useState('');
  const [donateType, setDonateType] = useState<'monthly' | 'once'>('once');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [cheerMessage, setCheerMessage] = useState('');
  const [completedPledge, setCompletedPledge] = useState<DonationPledge | null>(null);

  const [copiedBank, setCopiedBank] = useState(false);

  // Fetch real donations from SQL Database
  const fetchPledges = async () => {
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (data.success && data.donations) {
        const mapped: DonationPledge[] = data.donations.map((d: any) => ({
          id: d.id,
          name: d.donorName,
          amount: Number(d.amount),
          type: d.isRegular ? 'monthly' : 'once',
          paymentMethod: d.paymentMethod === '신용카드' ? 'card' : 'bank',
          message: d.message || '',
          date: d.date
        }));
        setPledges(mapped);
      }
    } catch (err) {
      console.error('Error fetching real donations:', err);
    }
  };

  useEffect(() => {
    fetchPledges();
  }, []);

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) return;

    const finalAmount = amount === 0 ? Number(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('올바른 후원 금액을 지정해 주세요.');
      return;
    }

    const payload = {
      donorName: donorName.trim(),
      amount: finalAmount,
      paymentMethod: paymentMethod === 'card' ? '신용카드' : '계좌이체 (농협)',
      message: cheerMessage.trim(),
      isRegular: donateType === 'monthly' ? 1 : 0
    };

    try {
      const res = await fetch('/api/donations/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        const pledgeItem: DonationPledge = {
          id: `pledge-${Date.now()}`,
          name: donorName.trim(),
          amount: finalAmount,
          type: donateType,
          paymentMethod,
          message: cheerMessage.trim(),
          date: new Date().toISOString().split('T')[0]
        };

        setCompletedPledge(pledgeItem);
        fetchPledges(); // Refresh list immediately from database!

        // Reset fields
        setDonorName('');
        setCustomAmount('');
        setCheerMessage('');
      } else {
        alert(data.message || '후원 약정 저장 실패');
      }
    } catch (err) {
      console.error('Pledge submit error:', err);
      alert('서버와의 통신에 장애가 발생했습니다.');
    }
  };

  const copyBankAccount = () => {
    navigator.clipboard.writeText('농협은행 301-7200-3400-11 (예금주: 사단법인 북한이탈주민중앙회)');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // Transparency report stats
  const budgetAllocation = [
    { title: '위기 가정 무상 법률 지원 및 상담구호', pct: '40%', detail: '소송대리비, 긴급 생계 약품 보급' },
    { title: '차세대 통일 청년 특별 장학 사업', pct: '30%', detail: '고등/대학 장학생 기금 집행' },
    { title: '통일 하나눔 봉사단 빵 제조 및 나눔 비용', pct: '20%', detail: '식자재 조달, 연대 구비 배출' },
    { title: '일반 투명 관리 통합 시스템 전산 운영비', pct: '10%', detail: 'JM 전산 보안망, 홈페이지 서버' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4" id="donation-section-container">
      {/* Top Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left: General Guidance & copy bank accounts */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white/40 border border-gray-100 p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                정직한 투명 운영 약정
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-3">
                후원 기부 안내 및 신뢰 약속
              </h3>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                사단법인 북한이탈주민중앙회는 국세청 지정 지정 기부금 단체이며, 기부해주시는 회비와 후원금은 
                전원 세액 공제 영수증 발행이 가능하며 10원 한 장 투명하게 전산 보고됩니다.
              </p>
            </div>

            {/* Official Accounts Card */}
            <div className="glass-card p-5 rounded-2xl border border-blue-100 space-y-3 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <Landmark className="w-4 h-4 text-blue-600" />
                <span>공식 세입 정기 후원 전용 계좌</span>
              </div>
              
              <div className="bg-gray-50/70 border border-gray-100/50 p-4 rounded-xl space-y-2">
                <div className="text-xs text-blue-900 font-extrabold select-all leading-relaxed">
                  농협은행 301-7200-3400-11
                </div>
                <div className="text-[10px] text-gray-400">
                  예금주: 사단법인 북한이탈주민중앙회
                </div>
              </div>

              <button
                onClick={copyBankAccount}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-colors shadow-sm"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> 계좌 정보 복사 완료!
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" /> 계좌번호 간편 버튼 복사
                  </>
                )}
              </button>
            </div>

            {/* Integrity Certifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">기부금 공제 대상</h4>
                  <p className="text-[10px] text-gray-400">연말정산 15~30% 공제</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl">
                <Award className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">지정기부금 정식 단체</h4>
                  <p className="text-[10px] text-gray-400">안전 기재부 공시 승인</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Budget Expense allocating Report cards */}
        <div className="lg:col-span-6">
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-gray-100 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" /> 기부금 투명 사용 계획 및 분배율
            </h3>
            <p className="text-xs text-gray-500">
              우리는 회원의 자조 소양을 높이고 지역사회 실천 봉사에 최고 비율의 세입액을 안배 및 정결 위임합니다.
            </p>

            <div className="space-y-4 pt-1">
              {budgetAllocation.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700 leading-relaxed">{item.title}</span>
                    <span className="font-black text-emerald-600 font-mono text-sm">{item.pct}</span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: item.pct }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-400">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Donation Action Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (8-span): Action Forms / Certificate */}
        <div className="lg:col-span-8">
          {completedPledge ? (
            /* Certificate View */
            <div className="glass-card p-8 rounded-3xl border-2 border-amber-200/60 bg-amber-50/5/10 relative overflow-hidden flex flex-col justify-between space-y-8 animate-in fade-in" id="donation-receipt-canvas">
              {/* decorative watermark */}
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-5">
                <Heart className="w-[300px] h-[300px] text-amber-500" />
              </div>

              <div className="text-center space-y-2 relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block font-mono">
                  HONORARY PLEDGE CERTIFICATE
                </span>
                <h4 className="text-2xl font-black text-gray-950 font-serif tracking-wide mt-2">
                  정 입 기 부 증 서
                </h4>
                <div className="text-xs text-gray-500 font-mono">No. BUM-2026-{completedPledge.id.split('-')[1]}</div>
              </div>

              <div className="space-y-4 text-center py-6 border-y border-dashed border-gray-100 relative z-10">
                <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto font-sans">
                  귀하(<strong className="text-lg text-gray-900 font-black">{completedPledge.name}</strong>)는 수혜자에서 
                  참여 기여자로 주도적인 삶을 실현하고자 사단법인 북한이탈주민중앙회에 정성스러운 
                  후원을 약정해 주셨기에 존중과 평화의 뜻을 담아 이 감사증서를 수여합니다.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-xs bg-white/70 p-4 border border-gray-100 rounded-xl">
                  <div>
                    <span className="text-gray-400">약정 후원 액수</span>
                    <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                      {completedPledge.amount.toLocaleString()} 원 ({completedPledge.type === 'monthly' ? '정기' : '일시'})
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">결제 약정일</span>
                    <div className="font-extrabold text-gray-900 text-sm mt-0.5">{completedPledge.date}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="text-left text-[11px] text-gray-400">
                  * 본 증서는 약정을 기리기 위한 기념물이며 정규 기부금 영수증은 홈택스에서 발행됩니다.
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompletedPledge(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    새로 Pledge 작성하기
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                  >
                    증서 인쇄 출력
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Main Form */
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-gray-100 space-y-6">
              <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" /> 실시간 후원 약정 동참하기
              </h4>
              <p className="text-xs text-gray-400">정보를 입력하여 후원금을 약정하시면, 명예의 전당 명부에 귀하의 소중한 의지가 등록됩니다.</p>

              <form onSubmit={handlePledgeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">후원자 실명 / 단체명</label>
                    <input
                      type="text"
                      placeholder="김중앙, 익명후원, 주식회사 북민"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      required
                      className="w-full text-xs bg-white border border-gray-200 focus:border-blue-500 focus:outline-none px-3.5 py-2.5 rounded-xl transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">납부 주무 분류</label>
                    <div className="grid grid-cols-2 gap-2 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setDonateType('once')}
                        className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                          donateType === 'once'
                            ? 'bg-blue-50 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-500'
                        }`}
                      >
                        일시 기탁 후원
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonateType('monthly')}
                        className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                          donateType === 'monthly'
                            ? 'bg-blue-50 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-500'
                        }`}
                      >
                        정기 회비 후원
                      </button>
                    </div>
                  </div>
                </div>

                {/* Amount Select Grid */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">약정 후원 액수 설정</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([10000, 30000, 50000] as const).map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => { setAmount(amt); setCustomAmount(''); }}
                        className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                          amount === amt
                            ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                      >
                        {amt.toLocaleString()} 원
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount(0)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        amount === 0
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      직접 수동 입력
                    </button>
                  </div>

                  {amount === 0 && (
                    <div className="mt-3 relative">
                      <input
                        type="number"
                        placeholder="직접 기탁하실 원화 액수를 입력하세요 (예: 100000)"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        required={amount === 0}
                        className="w-full text-xs font-mono bg-white border border-gray-200 focus:border-blue-500 focus:outline-none pl-4 pr-10 py-2.5 rounded-xl"
                      />
                      <span className="text-xs text-gray-400 font-bold absolute right-4 top-3">원</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">인사말 및 격려 한마디 (방명록 공유)</label>
                  <textarea
                    rows={3}
                    placeholder="탈북 청소년 장학 인재와 봉사단에 전하고 싶은 힘찬 한마디를 나누어 주세요..."
                    value={cheerMessage}
                    onChange={(e) => setCheerMessage(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 focus:border-blue-500 focus:outline-none px-3.5 py-2.5 rounded-xl transition-all font-sans"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full text-center py-3 bg-gray-900 border border-gray-800 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                >
                  명예 감사 후원 약정서 제출 및 증서 발급
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side (4-span): Live Donor Wall Register */}
        <div className="lg:col-span-4 max-h-[500px]">
          <div className="glass-card p-5 rounded-2xl border border-gray-100 h-full flex flex-col overflow-hidden">
            <h4 className="font-extrabold text-gray-900 text-xs border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>투명 후원 천사 명부 (전 산)</span>
              <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 rounded">실시간</span>
            </h4>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50/70 mt-2 space-y-0.5 h-[340px]">
              {pledges.map((p) => (
                <div key={p.id} className="py-3.5 space-y-1 pr-1.5" id={`pledge-item-${p.id}`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <strong className="text-gray-800 font-bold">{p.name}</strong>
                    <span className="text-emerald-600 font-black font-mono">
                      {p.amount.toLocaleString()}원
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-500 italic leading-relaxed break-words font-sans">
                    "{p.message || '소중한 통일 평화 인재를 옹호합니다.'}"
                  </p>
                  
                  <div className="flex justify-between items-center text-[9px] text-gray-400">
                    <span className="uppercase">{p.type === 'monthly' ? '매월 정기' : '일시 기탁'}</span>
                    <span>{p.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
