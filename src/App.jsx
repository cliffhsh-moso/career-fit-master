import React, { useState } from 'react';
import { 
  Briefcase, TrendingUp, Building2, FileText, Sparkles, Upload, 
  UserCheck, Target, Award, AlertCircle, MessageSquare, 
  Rocket, Search, ThumbsUp, History, BrainCircuit, Microscope
} from 'lucide-react';

export default function CareerFitMasterApp() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    
    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsDataURL(file);
      });
      
      const isText = file.type === 'text/plain';
      if (isText) {
        const text = await file.text();
        setResumeText(text);
      } else {
        setResumeText(base64Data);
      }
    } catch (error) {
      console.error(error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  const analyzeResume = async () => {
    setLoading(true);
    
    const steps = [
      "🧠 문맥 기반 행동 패턴 분석 중...",
      "🔍 프로젝트 내 숨겨진 기여도 추론 중...",
      "📊 성향 스펙트럼(Work Style) 산출 중...",
      "🦄 맞춤형 기업 문화 매칭 중...",
      "📝 최종 심층 리포트 작성 중..."
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const intervalId = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
      }
    }, 1500);

    try {
      const isPdf = resumeFile?.type === 'application/pdf';
      const isImage = resumeFile?.type.startsWith('image/');
      
      const SYSTEM_PROMPT = `
Role: 당신은 20년 차 '조직 심리학자'이자 '헤드헌터'입니다.
단순한 이력 요약이 아니라, 텍스트 뒤에 숨겨진 지원자의 [고유한 특성]과 [일하는 방식]을 파헤쳐야 합니다.

[분석 지침]
1. 행동 기반 성향 분석 (Behavioral Profiling):
   - 이력서의 동사(Verb)와 서술 방식을 분석하세요. 
   - 예: "시스템을 처음부터 설계했다" -> [개척가형], "기존 문제를 20% 최적화했다" -> [분석가형]

2. 맥락 기반 역량 추론 (Contextual Inference):
   - 기술 스택이 명시되지 않았어도, 프로젝트의 성격을 통해 사용자의 내공을 유추하세요.

3. 4가지 성향 스펙트럼 측정 (0~100점):
   - 안정 지향 (0) <---> 도전/혁신 지향 (100)
   - 원칙 준수 (0) <---> 유연/실용 주의 (100)
   - 개인 기여 (0) <---> 팀/리더십 중심 (100)
   - 스페셜리스트 (0) <---> 제너럴리스트 (100)

4. 기업 매칭: 최소 5개 이상의 다양한 한국 기업을 추천하세요 (대기업, 유니콘, 스타트업 포함).

[Output Format - JSON Only]
{
  "profileSummary": {
    "personaKeyword": "이력서를 관통하는 키워드",
    "oneLiner": "지원자의 특성을 설명하는 한 줄"
  },
  "traitSpectrum": {
    "riskTolerance": 85,
    "flexibility": 70,
    "collaboration": 40,
    "scope": 30
  },
  "deepAnalysis": {
    "hiddenStrengths": ["강점1", "강점2", "강점3"],
    "workStyle": "일하는 방식 설명",
    "leadershipPotential": "리더십 잠재력"
  },
  "top3Recommendations": [
    {
      "rank": 1,
      "name": "기업명",
      "type": "Startup/Unicorn/Enterprise",
      "industry": "산업군",
      "matchScore": 95,
      "reason": "매칭 이유",
      "hiringTrend": "채용 트렌드",
      "potentialRoles": ["직무1", "직무2"],
      "blindReview": {
        "pros": "장점",
        "cons": "단점",
        "keywords": ["#키워드1", "#키워드2"]
      }
    }
  ],
  "careerAdvice": "커리어 조언"
}`;

      let messageContent;

      if (isPdf) {
        messageContent = [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: resumeText }
          },
          { type: "text", text: `위 이력서를 분석해주세요.\n${SYSTEM_PROMPT}` }
        ];
      } else if (isImage) {
        messageContent = [
          {
            type: "image",
            source: { type: "base64", media_type: resumeFile.type, data: resumeText }
          },
          { type: "text", text: `위 이력서를 분석해주세요.\n${SYSTEM_PROMPT}` }
        ];
      } else {
        messageContent = `다음 이력서를 분석해주세요.\n${resumeText}\n\n${SYSTEM_PROMPT}`;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: messageContent }]
        })
      });

      const data = await response.json();
      const text = data.content.find(item => item.type === "text")?.text || "";
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsedAnalysis = JSON.parse(cleanText);
      setAnalysis(parsedAnalysis);

    } catch (error) {
      console.error(error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      clearInterval(intervalId);
      setLoading(false);
    }
  };

  const SpectrumBar = ({ label, leftLabel, rightLabel, value, colorClass }) => (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
        <div className={`h-full absolute top-0 left-0 rounded-full transition-all duration-1000 ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>0</span>
        <span className="font-semibold text-slate-600">{label}</span>
        <span>100</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-10 pt-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Career Fit <span className="text-indigo-600">Master</span>
              <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full align-top font-bold">Pro</span>
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            이력서의 행간을 읽어 당신의 <span className="font-bold text-indigo-600">일하는 DNA</span>를 분석합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <Upload className="w-5 h-5 text-indigo-600" />
                이력서 심층 분석
              </h2>
              
              <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer block">
                <input id="file-upload" type="file" onChange={handleFileUpload} accept=".pdf,.txt,.jpg,.jpeg,.png" className="hidden" />
                <div className="hover:scale-105 transition-transform duration-200">
                  <Microscope className="w-12 h-12 text-slate-400 mx-auto mb-3 hover:text-indigo-500" />
                  <p className="font-semibold text-slate-700">이력서 파일 업로드</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, 텍스트, 이미지 지원</p>
                </div>
              </label>

              {resumeFile && (
                <div className="mt-4 bg-slate-100 rounded-lg p-3 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 truncate flex-1">{resumeFile.name}</span>
                  <button onClick={() => { setResumeFile(null); setResumeText(''); setAnalysis(null); }} className="text-red-500 hover:text-red-700 text-xs font-bold">삭제</button>
                </div>
              )}

              <button onClick={analyzeResume} disabled={loading || !resumeFile} className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2">
                {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />분석 중...</> : <><BrainCircuit className="w-5 h-5" />DNA 분석 시작</>}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-slate-200 p-10">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 animate-pulse">{loadingStep}</h3>
                <p className="text-slate-500 text-sm">사용자의 특성과 성향을 다각도로 분석하고 있습니다.</p>
              </div>
            ) : analysis ? (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 p-6 text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                      <BrainCircuit className="w-5 h-5" />
                      <span className="text-sm font-bold tracking-wider uppercase">Behavioral DNA</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                      {analysis.profileSummary?.personaKeyword || '분석 결과'}
                    </h2>
                    <p className="text-slate-300 text-lg italic">"{analysis.profileSummary?.oneLiner || '분석 완료'}"</p>
                  </div>
                  
                  <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        성향 스펙트럼
                      </h3>
                      <SpectrumBar label="혁신 성향" leftLabel="안정" rightLabel="도전" value={analysis.traitSpectrum?.riskTolerance || 50} colorClass="bg-indigo-500" />
                      <SpectrumBar label="유연성" leftLabel="원칙" rightLabel="실용" value={analysis.traitSpectrum?.flexibility || 50} colorClass="bg-teal-500" />
                      <SpectrumBar label="협업" leftLabel="개인" rightLabel="팀" value={analysis.traitSpectrum?.collaboration || 50} colorClass="bg-orange-500" />
                      <SpectrumBar label="범위" leftLabel="Deep" rightLabel="Wide" value={analysis.traitSpectrum?.scope || 50} colorClass="bg-blue-500" />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <Search className="w-4 h-4 text-indigo-600" />
                          숨겨진 핵심 역량
                        </h3>
                        <ul className="space-y-2">
                          {analysis.deepAnalysis?.hiddenStrengths?.length > 0 ? analysis.deepAnalysis.hiddenStrengths.map((item, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 bg-white p-2 rounded border border-slate-100 shadow-sm">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          )) : <li className="text-sm text-slate-500">정보 없음</li>}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">리더십 잠재력</h3>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {analysis.deepAnalysis?.leadershipPotential || '정보 없음'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">일하는 방식</h3>
                    <p className="text-sm text-slate-700 leading-relaxed border-l-4 border-indigo-200 pl-4">
                      {analysis.deepAnalysis?.workStyle || '정보 없음'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                    문화 적합도 Top {analysis.top3Recommendations?.length || 0} 기업
                  </h3>
                  <div className="space-y-6">
                    {analysis.top3Recommendations?.length > 0 ? analysis.top3Recommendations.map((company, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${company.type === 'Startup' ? 'bg-green-50 text-green-600 border-green-200' : company.type === 'Unicorn' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                {company.type}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">{company.industry}</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">#{company.rank} {company.name}</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-indigo-600">{company.matchScore}%</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Match</div>
                          </div>
                        </div>

                        <div className="p-5 grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm font-bold text-slate-900 mb-2">🎯 매칭 포인트</h5>
                              <p className="text-sm text-slate-700 leading-relaxed">{company.reason}</p>
                            </div>
                            
                            {company.potentialRoles?.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-slate-900 mb-2">💼 추천 직무</h5>
                                <div className="flex flex-wrap gap-2">
                                  {company.potentialRoles.map((role, rIdx) => (
                                    <span key={rIdx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{role}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h5 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1">
                                <History className="w-3.5 h-3.5 text-slate-400" />
                                채용 히스토리
                              </h5>
                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">{company.hiringTrend}</p>
                            </div>
                          </div>

                          <div className="bg-indigo-50/30 rounded-xl p-4 border border-indigo-100">
                            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                              <MessageSquare className="w-4 h-4 text-indigo-500" />
                              현직자 리얼 보이스
                            </h5>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <ThumbsUp className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-700"><span className="font-semibold">장점:</span> {company.blindReview?.pros}</p>
                              </div>
                              <div className="flex gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-700"><span className="font-semibold">단점:</span> {company.blindReview?.cons}</p>
                              </div>
                              <div className="flex flex-wrap gap-1 pt-2">
                                {company.blindReview?.keywords?.map((k, kIdx) => (
                                  <span key={kIdx} className="text-[10px] bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-200">{k}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500">추천 기업 정보가 없습니다.</div>}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-indigo-50">Career Advice</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">{analysis.careerAdvice || '분석 결과를 바탕으로 커리어 방향을 고민해보세요.'}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 min-h-[400px]">
                <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium text-center">
                  이력서를 업로드하면<br/>
                  당신의 <span className="text-indigo-500 font-bold">행동 패턴</span>과 <span className="text-indigo-500 font-bold">숨겨진 성향</span>을 분석합니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
