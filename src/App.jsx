import { useState, useMemo, useCallback } from "react";

const LN101 = Math.log(101);
const BUDGET = 50000;

function research(r) {
  if (r <= 0) return 0;
  return (200000 * Math.log(1 + r)) / LN101;
}

function scale(s) {
  return (7 * s) / 100;
}

function pnl(r, s, sp, speedMult) {
  const gross = research(r) * scale(s) * speedMult;
  const budget = ((r + s + sp) / 100) * BUDGET;
  return { gross, budget, net: gross - budget };
}

const SPEED_MULTS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

function formatNum(n) {
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toFixed(1);
}

function Slider({ label, value, onChange, max, color, icon }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a8f98" }}>
          {icon} {label}
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
          {value}%
        </span>
      </div>
      <div style={{ position: "relative", height: 36, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3, background: "#1a1d23" }} />
        <div style={{ position: "absolute", left: 0, width: `${value}%`, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${color}44, ${color})`, transition: "width 0.1s" }} />
        <input
          type="range" min={0} max={max} value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ position: "absolute", left: 0, right: 0, width: "100%", height: 36, opacity: 0, cursor: "pointer", margin: 0 }}
        />
        <div style={{
          position: "absolute",
          left: `calc(${value}% - 10px)`,
          width: 20, height: 20, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 12px ${color}66`,
          border: "3px solid #0d0f13",
          transition: "left 0.1s",
          pointerEvents: "none"
        }} />
      </div>
    </div>
  );
}

function Bar({ value, maxVal, color, height = 120 }) {
  const pct = maxVal > 0 ? Math.max(0, Math.min(1, Math.abs(value) / maxVal)) : 0;
  const isNeg = value < 0;
  return (
    <div style={{ width: "100%", height, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", position: "relative" }}>
      <div style={{
        width: "100%",
        height: `${pct * 100}%`,
        minHeight: value !== 0 ? 2 : 0,
        borderRadius: "4px 4px 0 0",
        background: isNeg
          ? `linear-gradient(180deg, #ff4d4f22, #ff4d4f88)`
          : `linear-gradient(180deg, ${color}22, ${color}aa)`,
        border: `1px solid ${isNeg ? "#ff4d4f" : color}44`,
        borderBottom: "none",
        transition: "height 0.3s ease",
      }} />
    </div>
  );
}

export default function IMCSimulator() {
  const [r, setR] = useState(23);
  const [s, setS] = useState(77);
  const [sp, setSp] = useState(0);

  const total = r + s + sp;
  const overBudget = total > 100;

  const handleR = useCallback((v) => setR(Math.min(v, 100)), []);
  const handleS = useCallback((v) => setS(Math.min(v, 100)), []);
  const handleSp = useCallback((v) => setSp(Math.min(v, 100)), []);

  const results = useMemo(() => {
    if (overBudget) return null;
    return SPEED_MULTS.map((m) => {
      const { gross, budget, net } = pnl(r, s, sp, m);
      return { mult: m, gross, budget, net };
    });
  }, [r, s, sp, overBudget]);

  const researchVal = research(r);
  const scaleVal = scale(s);
  const budgetUsed = ((r + s + sp) / 100) * BUDGET;
  const unspent = BUDGET - budgetUsed;

  const maxNet = results ? Math.max(...results.map((x) => Math.abs(x.net)), 1) : 1;

  const optimalR = 23, optimalS = 77, optimalSp = 0;
  const isOptimal = r === optimalR && s === optimalS && sp === optimalSp;

  const bestNet = results ? Math.max(...results.map((x) => x.net)) : 0;
  const worstNet = results ? Math.min(...results.map((x) => x.net)) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0f13",
      color: "#e2e4e9",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px 20px",
      boxSizing: "border-box",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Instrument+Serif&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4a5568", marginBottom: 4, fontWeight: 600 }}>
          IMC Prosperity 4
        </div>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 32,
          fontWeight: 400,
          margin: "0 0 4px",
          background: "linear-gradient(135deg, #e2e4e9, #7eb8f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Invest & Expand
        </h1>
        <div style={{ fontSize: 13, color: "#5a6170" }}>Budget Allocation Simulator</div>
      </div>

      {/* Controls */}
      <div style={{
        background: "#13161c",
        borderRadius: 16,
        padding: "24px 20px 16px",
        border: "1px solid #1e2129",
        marginBottom: 16,
      }}>
        <Slider label="Research" value={r} onChange={handleR} max={100} color="#7eb8f7" icon="◈" />
        <Slider label="Scale" value={s} onChange={handleS} max={100} color="#59d9a4" icon="◇" />
        <Slider label="Speed" value={sp} onChange={handleSp} max={100} color="#f0a55e" icon="△" />

        {/* Summary row */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          padding: "12px 14px",
          borderRadius: 10,
          background: overBudget ? "#ff4d4f11" : "#1a1d23",
          border: `1px solid ${overBudget ? "#ff4d4f44" : "#22252d"}`,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#5a6170", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
              Total Allocated
            </div>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: overBudget ? "#ff4d4f" : total === 100 ? "#59d9a4" : "#e2e4e9",
            }}>
              {total}%
            </span>
            {overBudget && <span style={{ fontSize: 12, color: "#ff4d4f", marginLeft: 8 }}>exceeds 100%</span>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#5a6170", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
              Budget Used
            </div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: "#8a8f98" }}>
              {formatNum(budgetUsed)}
            </span>
            {unspent > 0 && !overBudget && (
              <span style={{ fontSize: 11, color: "#5a6170", marginLeft: 6 }}>({formatNum(unspent)} saved)</span>
            )}
          </div>
        </div>
      </div>

      {/* Computed values */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#13161c", borderRadius: 12, padding: "14px 16px", border: "1px solid #1e2129" }}>
          <div style={{ fontSize: 11, color: "#5a6170", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Research Output</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: "#7eb8f7" }}>
            {formatNum(researchVal)}
          </div>
        </div>
        <div style={{ background: "#13161c", borderRadius: 12, padding: "14px 16px", border: "1px solid #1e2129" }}>
          <div style={{ fontSize: 11, color: "#5a6170", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Scale Multiplier</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: "#59d9a4" }}>
            {scaleVal.toFixed(2)}×
          </div>
        </div>
      </div>

      {/* Results Chart */}
      {results && !overBudget && (
        <div style={{
          background: "#13161c",
          borderRadius: 16,
          padding: "20px 16px 16px",
          border: "1px solid #1e2129",
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8a8f98", marginBottom: 16 }}>
            Net PnL by Speed Ranking
          </div>

          {/* Bar chart */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${SPEED_MULTS.length}, 1fr)`, gap: 4, marginBottom: 8 }}>
            {results.map((row, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: row.net >= 0 ? "#59d9a4" : "#ff4d4f",
                  marginBottom: 4,
                  whiteSpace: "nowrap",
                }}>
                  {row.net >= 0 ? "+" : ""}{(row.net / 1000).toFixed(0)}k
                </div>
                <Bar value={row.net} maxVal={maxNet} color="#7eb8f7" height={100} />
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#f0a55e",
                  marginTop: 6,
                }}>
                  {row.mult.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#4a5568", marginTop: 4 }}>
            Speed Multiplier →
          </div>
        </div>
      )}

      {/* Detail Table */}
      {results && !overBudget && (
        <div style={{
          background: "#13161c",
          borderRadius: 16,
          padding: "20px 12px 12px",
          border: "1px solid #1e2129",
          marginBottom: 16,
          overflowX: "auto",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8a8f98", marginBottom: 14, paddingLeft: 4 }}>
            Detailed Breakdown
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #22252d" }}>
                {["Spd ×", "Gross", "Cost", "Net PnL"].map((h, i) => (
                  <th key={i} style={{
                    padding: "6px 6px 10px",
                    textAlign: i === 0 ? "center" : "right",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#4a5568",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => {
                const isBest = row.net === bestNet;
                const isWorst = row.net === worstNet;
                return (
                  <tr key={i} style={{
                    borderBottom: i < results.length - 1 ? "1px solid #1a1d23" : "none",
                    background: isBest ? "#59d9a408" : isWorst ? "#ff4d4f06" : "transparent",
                  }}>
                    <td style={{ padding: "8px 6px", textAlign: "center", color: "#f0a55e", fontWeight: 700 }}>
                      {row.mult.toFixed(1)}
                    </td>
                    <td style={{ padding: "8px 6px", textAlign: "right", color: "#8a8f98" }}>
                      {formatNum(row.gross)}
                    </td>
                    <td style={{ padding: "8px 6px", textAlign: "right", color: "#5a6170" }}>
                      {formatNum(row.budget)}
                    </td>
                    <td style={{
                      padding: "8px 6px",
                      textAlign: "right",
                      fontWeight: 700,
                      color: row.net >= 0 ? "#59d9a4" : "#ff4d4f",
                    }}>
                      {row.net >= 0 ? "+" : ""}{formatNum(row.net)}
                      {isBest && <span style={{ fontSize: 9, marginLeft: 4, color: "#59d9a4" }}>▲</span>}
                      {isWorst && <span style={{ fontSize: 9, marginLeft: 4, color: "#ff4d4f" }}>▼</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Nash hint */}
      <div style={{
        background: isOptimal ? "#59d9a408" : "#f0a55e08",
        borderRadius: 12,
        padding: "14px 16px",
        border: `1px solid ${isOptimal ? "#59d9a422" : "#f0a55e22"}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: isOptimal ? "#59d9a4" : "#f0a55e", marginBottom: 6 }}>
          {isOptimal ? "◈ Nash Equilibrium" : "◈ Analysis Note"}
        </div>
        <div style={{ fontSize: 12, color: "#8a8f98", lineHeight: 1.5 }}>
          {isOptimal
            ? "This is the symmetric Nash equilibrium. If all players invest 0% in Speed, everyone ties for rank 1 and receives the 0.9 multiplier — yielding 618,097 net PnL."
            : `The Nash equilibrium allocation is 23/77/0. Your current split ${r}/${s}/${sp} yields a best-case of +${formatNum(bestNet)} and worst-case of ${worstNet >= 0 ? "+" : ""}${formatNum(worstNet)}.`
          }
        </div>
      </div>

      {/* Formulas */}
      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "#0f1116", border: "1px solid #1a1d23" }}>
        <div style={{ fontSize: 10, color: "#3d4250", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Formulas</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#3d4250", lineHeight: 1.8 }}>
          Research(x) = 200k × ln(1+x) / ln(101)<br />
          Scale(x) = 7 × x / 100<br />
          PnL = Research × Scale × Speed − Budget
        </div>
      </div>
    </div>
  );
}