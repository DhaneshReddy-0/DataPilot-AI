import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  Lightbulb,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

export default function AiInsightsTab({ insights }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!insights) return null;

  const { executiveSummary, insights: insightCards = [], riskAlerts = [], recommendations = [] } = insights;

  const handleSpeakBriefing = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    // Build speech text
    const textToRead = `${executiveSummary}. Key insights: ` + 
      insightCards.map(c => `${c.title}. ${c.text}`).join('. ') + 
      `. Strategic recommendations: ` + recommendations.join('. ');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopy = () => {
    const fullText = `Executive AI Synthesis:\n${executiveSummary}\n\n` +
      `Key Insights:\n` + insightCards.map(i => `• ${i.title}: ${i.text}`).join('\n') +
      `\n\nRecommendations:\n` + recommendations.map(r => `• ${r}`).join('\n') +
      `\n\nRisk Factors:\n` + riskAlerts.map(r => `• ${r}`).join('\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'highlight':
        return 'bg-cyan-50 text-cyan-400 border-cyan-200';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Executive Briefing Header Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-900 shadow-lg shadow-cyan-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Executive Intelligence Briefing</h3>
              <p className="text-xs text-slate-500">Autonomous analytical narrative & data storytelling</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Audio Voice Narration */}
            <button
              onClick={handleSpeakBriefing}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isPlayingAudio 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-700 text-slate-700 border-slate-200'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
              <span>{isPlayingAudio ? 'Stop Audio' : 'Listen to Briefing'}</span>
            </button>

            {/* Copy Briefing */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-700 text-slate-700 border border-slate-200 transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <div className="mt-6 text-sm text-slate-700 leading-relaxed font-normal bg-slate-100 p-4 rounded-xl border border-slate-200/80">
          {executiveSummary}
        </div>
      </div>

      {/* Structured Discovery Cards */}
      <div>
        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-cyan-400" />
          Autonomous Analytical Discoveries
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insightCards.map((item, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-5 border border-slate-200 hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getImpactBadge(item.impact)}`}>
                  {item.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
              </div>
              <h5 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h5>
              <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations & Risk Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recommendations */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
            <Compass className="h-5 w-5" />
            <h4 className="text-sm font-bold text-slate-900">Actionable Recommendations</h4>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-2.5 mb-4 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
            <h4 className="text-sm font-bold text-slate-900">Critical Risk & Anomaly Alerts</h4>
          </div>

          <div className="space-y-3">
            {riskAlerts.length > 0 ? (
              riskAlerts.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 leading-relaxed">{risk}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                No high-severity risk vulnerabilities or anomaly clusters flagged.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
