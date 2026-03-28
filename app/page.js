"use client";
import { useState, useEffect } from "react";
import { FEDERAL_QUESTIONS, STATE_DATA, CATEGORIES, ALL_STATES, STATE_NAMES } from "../lib/stateData";

const NAVY = "#0B1D3A";
const GOLD = "#C8A951";
const LIGHT = "#F8F7F4";
const WHITE = "#FFFFFF";

export default function Home() {
  const [screen, setScreen] = useState("landing");
  const [selectedState, setSelectedState] = useState(null);
  const [profile, setProfile] = useState({ employees: "", industry: "" });
  const [currentCat, setCurrentCat] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const stateHasData = (code) => !!STATE_DATA[code];

  const getQuestions = () => {
    if (!selectedState || !STATE_DATA[selectedState]) return FEDERAL_QUESTIONS;
    const stateQs = STATE_DATA[selectedState].questions || [];
    return [...FEDERAL_QUESTIONS, ...stateQs];
  };

  const getCatQuestions = (catId) => getQuestions().filter(q => q.cat === catId);

  const allCatsWithQuestions = CATEGORIES.filter(c => getCatQuestions(c.id).length > 0);

  const totalQuestions = getQuestions().length;
  const answeredCount = Object.keys(answers).length;

  const calculateScore = () => {
    const qs = getQuestions();
    let earned = 0, possible = 0;
    qs.forEach(q => {
      possible += q.weight * 3;
      if (answers[q.id] === "yes") earned += q.weight * 3;
      else if (answers[q.id] === "partial") earned += q.weight * 1.5;
    });
    return possible > 0 ? Math.round((earned / possible) * 100) : 0;
  };

  const getCatScore = (catId) => {
    const qs = getCatQuestions(catId);
    let earned = 0, possible = 0;
    qs.forEach(q => {
      possible += q.weight * 3;
      if (answers[q.id] === "yes") earned += q.weight * 3;
      else if (answers[q.id] === "partial") earned += q.weight * 1.5;
    });
    return possible > 0 ? Math.round((earned / possible) * 100) : 0;
  };

  const getGaps = () => {
    return getQuestions().filter(q => answers[q.id] === "no" || answers[q.id] === "unsure")
      .sort((a, b) => b.weight - a.weight);
  };

  const scoreColor = (s) => s >= 80 ? "#2E7D32" : s >= 60 ? "#F57F17" : "#C62828";
  const scoreLabel = (s) => s >= 80 ? "Strong" : s >= 60 ? "Needs Improvement" : "At Risk";

  const filteredStates = ALL_STATES.filter(code => {
    const name = STATE_NAMES[code] || code;
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const styles = {
    container: { maxWidth: 720, margin: "0 auto", padding: "24px 16px", minHeight: "100vh", background: LIGHT },
    header: { textAlign: "center", marginBottom: 32, paddingTop: 24 },
    logo: { fontSize: 28, fontWeight: 700, color: NAVY, letterSpacing: "-0.5px" },
    logoAccent: { color: GOLD },
    subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
    card: { background: WHITE, borderRadius: 12, padding: "24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    btn: { display: "inline-block", padding: "12px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s" },
    btnPrimary: { background: NAVY, color: WHITE },
    btnGold: { background: GOLD, color: NAVY },
    btnOutline: { background: "transparent", border: `2px solid ${NAVY}`, color: NAVY },
    stateGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 },
    stateBtn: { padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: WHITE, cursor: "pointer", textAlign: "left", fontSize: 13, fontFamily: "inherit", transition: "all 0.2s" },
    stateBtnActive: { borderColor: NAVY, background: `${NAVY}10` },
    stateBtnDisabled: { opacity: 0.45, cursor: "default", background: "#f5f5f5" },
    progressBar: { width: "100%", height: 6, background: "#e0e0e0", borderRadius: 3, marginBottom: 16 },
    progressFill: { height: "100%", borderRadius: 3, background: NAVY, transition: "width 0.3s" },
    questionCard: { padding: "16px 0", borderBottom: "1px solid #eee" },
    answerBtns: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
    answerBtn: { padding: "8px 16px", borderRadius: 6, border: "1px solid #ccc", background: WHITE, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
    answerActive: { borderColor: NAVY, background: NAVY, color: WHITE },
  };

  // LANDING
  if (screen === "landing") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>HR <span style={styles.logoAccent}>Codex</span></div>
          <p style={styles.subtitle}>Free Employment Compliance Assessment</p>
        </div>
        <div style={styles.card}>
          <h2 style={{ color: NAVY, fontSize: 22, margin: "0 0 8px" }}>How compliant is your business?</h2>
          <p style={{ color: "#555", lineHeight: 1.6, margin: "0 0 16px" }}>
            Answer questions about your employment practices and get an instant compliance score with actionable recommendations. Takes about 5 minutes.
          </p>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>
            Select your state to begin. You will be assessed on federal requirements plus state-specific laws.
          </p>
          <input
            type="text"
            placeholder="Search states..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14, marginBottom: 12, fontFamily: "inherit", boxSizing: "border-box" }}
          />
          <div style={styles.stateGrid}>
            {filteredStates.map(code => {
              const has = stateHasData(code);
              return (
                <button
                  key={code}
                  onClick={() => { if (has) { setSelectedState(code); setScreen("profile"); } }}
                  style={{
                    ...styles.stateBtn,
                    ...(has ? {} : styles.stateBtnDisabled),
                    ...(selectedState === code ? styles.stateBtnActive : {}),
                  }}
                  disabled={!has}
                >
                  <strong>{code}</strong> <span style={{ color: "#888" }}>{STATE_NAMES[code]}</span>
                  {!has && <span style={{ display: "block", fontSize: 10, color: "#aaa", marginTop: 2 }}>Coming soon</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "16px 0", color: "#999", fontSize: 12 }}>
          Published by HR Codex &middot; Professional HR Compliance Resources
        </div>
      </div>
    );
  }

  // PROFILE
  if (screen === "profile") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>HR <span style={styles.logoAccent}>Codex</span></div>
          <p style={styles.subtitle}>{STATE_DATA[selectedState]?.name || STATE_NAMES[selectedState]} Compliance Assessment</p>
        </div>
        <div style={styles.card}>
          <h2 style={{ color: NAVY, fontSize: 20, margin: "0 0 16px" }}>Tell us about your business</h2>
          <label style={{ display: "block", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>How many employees do you have?</span>
            <select value={profile.employees} onChange={e => setProfile({...profile, employees: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}>
              <option value="">Select...</option>
              <option value="1-4">1-4</option>
              <option value="5-14">5-14</option>
              <option value="15-49">15-49</option>
              <option value="50-99">50-99</option>
              <option value="100+">100+</option>
            </select>
          </label>
          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>Primary industry</span>
            <select value={profile.industry} onChange={e => setProfile({...profile, industry: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}>
              <option value="">Select...</option>
              <option value="construction">Construction / Trades</option>
              <option value="healthcare">Healthcare</option>
              <option value="retail">Retail</option>
              <option value="restaurant">Restaurant / Food Service</option>
              <option value="professional">Professional Services</option>
              <option value="technology">Technology</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setScreen("landing"); setSelectedState(null); }} style={{ ...styles.btn, ...styles.btnOutline }}>Back</button>
            <button onClick={() => { if (profile.employees && profile.industry) setScreen("assess"); }}
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: (profile.employees && profile.industry) ? 1 : 0.5 }}
              disabled={!profile.employees || !profile.industry}>
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ASSESSMENT
  if (screen === "assess" && !showResults) {
    const cat = allCatsWithQuestions[currentCat];
    const catQs = getCatQuestions(cat.id);
    const catAnswered = catQs.filter(q => answers[q.id]).length;
    const isLastCat = currentCat === allCatsWithQuestions.length - 1;
    const allCatAnswered = catAnswered === catQs.length;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>HR <span style={styles.logoAccent}>Codex</span></div>
          <p style={styles.subtitle}>{STATE_DATA[selectedState]?.name} &middot; {cat.icon} {cat.title}</p>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(answeredCount / totalQuestions) * 100}%` }} />
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 16, textAlign: "right" }}>
          {answeredCount} of {totalQuestions} questions answered &middot; Category {currentCat + 1} of {allCatsWithQuestions.length}
        </div>
        <div style={styles.card}>
          <h3 style={{ color: NAVY, margin: "0 0 16px" }}>{cat.icon} {cat.title}</h3>
          {catQs.map((q, i) => (
            <div key={q.id} style={styles.questionCard}>
              <p style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.5, color: "#333" }}>
                {q.critical && <span style={{ color: "#C62828", fontWeight: 600, fontSize: 12, marginRight: 4 }}>CRITICAL</span>}
                {q.text}
              </p>
              <div style={styles.answerBtns}>
                {["yes","no","partial","unsure"].map(val => (
                  <button key={val} onClick={() => setAnswers({...answers, [q.id]: val})}
                    style={{ ...styles.answerBtn, ...(answers[q.id] === val ? styles.answerActive : {}) }}>
                    {val === "yes" ? "\u2705 Yes" : val === "no" ? "\u274C No" : val === "partial" ? "\u{1F7E1} Partially" : "\u2753 Unsure"}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "space-between" }}>
            <button onClick={() => { if (currentCat > 0) setCurrentCat(currentCat - 1); }}
              style={{ ...styles.btn, ...styles.btnOutline, visibility: currentCat === 0 ? "hidden" : "visible" }}>
              Previous
            </button>
            {isLastCat ? (
              <button onClick={() => setShowResults(true)}
                style={{ ...styles.btn, ...styles.btnGold }}>
                View My Results
              </button>
            ) : (
              <button onClick={() => setCurrentCat(currentCat + 1)}
                style={{ ...styles.btn, ...styles.btnPrimary }}>
                Next Category
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (showResults) {
    const score = calculateScore();
    const gaps = getGaps();
    const criticalGaps = gaps.filter(g => g.critical);

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>HR <span style={styles.logoAccent}>Codex</span></div>
          <p style={styles.subtitle}>{STATE_DATA[selectedState]?.name} Compliance Results</p>
        </div>

        {/* Score Card */}
        <div style={{ ...styles.card, textAlign: "center", border: `2px solid ${scoreColor(score)}20` }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: scoreColor(score) }}>{score}%</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: scoreColor(score), marginBottom: 4 }}>{scoreLabel(score)}</div>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
            Based on {answeredCount} questions covering federal and {STATE_DATA[selectedState]?.name} requirements
          </p>
        </div>

        {/* Category Breakdown */}
        <div style={styles.card}>
          <h3 style={{ color: NAVY, margin: "0 0 16px" }}>Category Breakdown</h3>
          {allCatsWithQuestions.map(cat => {
            const cs = getCatScore(cat.id);
            return (
              <div key={cat.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{cat.icon} {cat.title}</span>
                  <span style={{ fontWeight: 600, color: scoreColor(cs) }}>{cs}%</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "#e8e8e8", borderRadius: 4 }}>
                  <div style={{ width: `${cs}%`, height: "100%", background: scoreColor(cs), borderRadius: 4, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Critical Gaps - Free */}
        {criticalGaps.length > 0 && (
          <div style={{ ...styles.card, borderLeft: `4px solid #C62828` }}>
            <h3 style={{ color: "#C62828", margin: "0 0 12px" }}>Critical Compliance Gaps ({criticalGaps.length})</h3>
            {criticalGaps.slice(0, 3).map(g => (
              <div key={g.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
                <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 500, color: "#333" }}>{g.text}</p>
                {g.freeDetail && <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.5 }}>{g.detail}</p>}
                {!g.freeDetail && <p style={{ margin: 0, fontSize: 12, color: "#999", fontStyle: "italic" }}>\u{1F512} Full analysis available in the complete report</p>}
              </div>
            ))}
            {criticalGaps.length > 3 && (
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>+{criticalGaps.length - 3} more critical gaps in the full report</p>
            )}
          </div>
        )}

        {/* Upsell */}
        <div style={{ ...styles.card, background: NAVY, color: WHITE, textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px", color: GOLD }}>Get Your Complete Compliance Report</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 16px", color: "rgba(255,255,255,0.8)" }}>
            Unlock detailed analysis of every compliance gap with specific remediation steps, legal references, and priority actions for your {STATE_DATA[selectedState]?.name} business.
          </p>
          <ul style={{ textAlign: "left", fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.9)", margin: "0 0 20px", paddingLeft: 20 }}>
            <li>Detailed analysis of all {gaps.length} compliance gaps</li>
            <li>Specific legal citations and remediation steps</li>
            <li>Priority action items ranked by risk level</li>
            <li>State-specific regulatory references</li>
          </ul>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/create-checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ state: selectedState, answers, profile }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else alert("Checkout is being configured. Please try again shortly.");
              } catch (e) {
                alert("Checkout is being configured. Please try again shortly.");
              }
            }}
            style={{ ...styles.btn, background: GOLD, color: NAVY, fontSize: 16, padding: "14px 32px", width: "100%" }}>
            Get Complete Report — $47
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
            Instant access. One-time purchase. No subscription.
          </p>
        </div>

        {/* Restart */}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => {
            setScreen("landing"); setSelectedState(null); setProfile({ employees: "", industry: "" });
            setCurrentCat(0); setAnswers({}); setShowResults(false);
          }} style={{ ...styles.btn, ...styles.btnOutline }}>
            Take Another Assessment
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 24, padding: "16px", background: "rgba(11,29,58,0.03)", borderRadius: 8, border: "1px solid rgba(11,29,58,0.06)" }}>
          <p style={{ fontSize: 11, color: "#888", lineHeight: 1.6, margin: 0 }}>
            <strong>Important Notice:</strong> This assessment is published by HR Codex as an educational resource. It does not constitute legal advice and no attorney-client or professional-services relationship is created by its use. Employment laws change frequently and this tool may not reflect the most recent updates. Consult a licensed employment attorney in your state before making compliance decisions. HR Codex expressly disclaims all liability for actions taken or not taken based on these results.
          </p>
        </div>

        <div style={{ textAlign: "center", padding: "16px 0", color: "#999", fontSize: 12 }}>
          HR CODEX &middot; Professional HR Compliance Resources
        </div>
      </div>
    );
  }

  return null;
}
