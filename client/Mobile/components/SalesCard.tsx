/**
 * SalesCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from previous version:
 *  - Fixed height chart area (CHART_CONTAINER_H) → zero layout shift on toggle
 *  - Toggle moved to upper-right corner of the header row
 *  - Percentage rate removed from footer (was confusing)
 *  - Current day highlighted in weekly view (green bar, bold label)
 *  - Current week highlighted in monthly view (green bar, bold label)
 *  - Skeleton loader exported so home.tsx can show it before data loads
 *  - Removed useLayoutEffect (was unused)
 */

import React, {
  useState, useRef, useCallback, useMemo,
} from "react";
import {
  View, Text, TouchableOpacity, Animated, Easing,
  LayoutChangeEvent,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { SalesData, DailySale, WeeklySale } from "../app/hooks/UseHomeData";

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_HEIGHT            = 56;
const LINE_HEIGHT           = 56;
/** Fixed height for the entire chart area — prevents card resizing on toggle */
const CHART_CONTAINER_H     = 82;
const DOT_R                 = 4;
const LINE_THICK            = 2.5;
const LINE_COLOR            = "#166534";
const ANIM_MS               = 250;

// Today's day index 0=Sun … 6=Sat → map to our "Mon"…"Sun" labels
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TODAY_LABEL = DAY_LABELS[new Date().getDay()];

// Current ISO week-of-month (1–4) → "Wk N"
const getISOWeekOfMonth = (): string => {
  const now   = new Date();
  const day   = now.getDate();
  const wk    = Math.ceil(day / 7);
  return `Wk ${Math.min(wk, 4)}`;
};
const CURRENT_WEEK_LABEL = getISOWeekOfMonth();

type SalesView = "weekly" | "monthly";

// ─── Skeleton loader (also exported for use in home.tsx) ──────────────────────

export const SalesCardSkeleton: React.FC = () => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  React.useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ])).start();
  }, [pulse]);

  const Block = ({ h, w = "100%", r = 8 }: { h: number; w?: string | number; r?: number }) => (
    <Animated.View style={{
      height: h, borderRadius: r, backgroundColor: "#e5e7eb",
      marginBottom: 10, opacity: pulse,
      width: w as any,
    }} />
  );

  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 20, padding: 18,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    }}>
      {/* Header row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Block h={10} w="40%" r={5} />
          <Block h={32} w="55%" r={7} />
        </View>
        <Block h={28} w={80} r={14} />
      </View>
      {/* Chart bars */}
      <View style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_HEIGHT, gap: 4 }}>
        {[0.6, 0.8, 0.65, 1, 0.75, 0.9, 0.7].map((ratio, i) => (
          <Animated.View key={i} style={{
            flex: 1, height: BAR_HEIGHT * ratio,
            borderRadius: 4, backgroundColor: "#e5e7eb", opacity: pulse,
          }} />
        ))}
      </View>
      {/* X-axis labels */}
      <Block h={8} r={4} />
      {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        <Block h={10} w="35%" r={5} />
        <Block h={10} w="25%" r={5} />
      </View>
    </View>
  );
};

// ─── Pure-RN line graph ───────────────────────────────────────────────────────

interface Point { x: number; y: number }

const LineGraph: React.FC<{ points: Point[]; w: number; h: number }> = ({ points, w, h }) => {
  if (points.length < 2) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, width: w, height: h }}>
      {points.map((pt, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        const dx   = pt.x - prev.x;
        const dy   = pt.y - prev.y;
        const len  = Math.sqrt(dx * dx + dy * dy);
        const ang  = Math.atan2(dy, dx) * (180 / Math.PI);
        const mx   = (pt.x + prev.x) / 2;
        const my   = (pt.y + prev.y) / 2;
        return (
          <View key={`seg-${i}`} style={{
            position: "absolute",
            width: len, height: LINE_THICK, borderRadius: 2,
            backgroundColor: LINE_COLOR,
            left: mx - len / 2, top: my - LINE_THICK / 2,
            transform: [{ rotate: `${ang}deg` }],
          }} />
        );
      })}
      {points.map((pt, i) => (
        <View key={`dot-${i}`} style={{
          position: "absolute",
          width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
          backgroundColor: LINE_COLOR, borderWidth: 2, borderColor: "#fff",
          left: pt.x - DOT_R, top: pt.y - DOT_R,
        }} />
      ))}
    </View>
  );
};

// ─── Bar chart ────────────────────────────────────────────────────────────────

interface BarChartProps {
  data:         { label: string; amount: number }[];
  selected?:    string | null;
  highlighted?: string | null; // current day/week — always visually distinct
  onPress?:     (label: string) => void;
  height?:      number;
}

const BarChart: React.FC<BarChartProps> = ({
  data, selected, highlighted, onPress, height = BAR_HEIGHT,
}) => {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    // Fixed height container so the card never resizes
    <View style={{ height: CHART_CONTAINER_H }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", height, gap: 3 }}>
        {data.map((item) => {
          const barH       = Math.max((item.amount / max) * height, 4);
          const isSelected = selected === item.label;
          const isCurrent  = highlighted === item.label;
          const barColor   = isSelected
            ? "#166534"
            : isCurrent
            ? "#16a34a"       // slightly lighter green for "today"
            : "#bbf7d0";

          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => onPress?.(item.label)}
              activeOpacity={onPress ? 0.65 : 1}
              style={{ flex: 1, height, alignItems: "center", justifyContent: "flex-end" }}
            >
              <View style={{
                height: barH, width: "72%", borderRadius: 4,
                backgroundColor: barColor,
              }} />
            </TouchableOpacity>
          );
        })}
      </View>
      {/* X-axis labels */}
      <View style={{ flexDirection: "row", marginTop: 6, gap: 3 }}>
        {data.map(item => {
          const isCurrent  = highlighted === item.label;
          const isSelected = selected === item.label;
          return (
            <Text key={item.label} style={{
              flex: 1, textAlign: "center", fontSize: 9,
              fontWeight: (isCurrent || isSelected) ? "800" : "500",
              color: isSelected ? "#166534" : isCurrent ? "#16a34a" : "#9ca3af",
            }}>
              {item.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

// ─── Fade + scale transition wrapper ─────────────────────────────────────────

const FadeView: React.FC<{ visible: boolean; children: React.ReactNode }> = ({ visible, children }) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scale   = useRef(new Animated.Value(visible ? 1 : 0.97)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: ANIM_MS, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(scale,   { toValue: visible ? 1 : 0.97, duration: ANIM_MS, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, scale]);
  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
};

// ─── Main SalesCard ───────────────────────────────────────────────────────────

interface Props { data: SalesData }

export const SalesCard: React.FC<Props> = ({ data }) => {
  const [view,       setView]       = useState<SalesView>("weekly");
  const [selectedWk, setSelectedWk] = useState<string | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // Cross-fade on view switch
  const viewFade = useRef(new Animated.Value(1)).current;

  const switchView = useCallback((next: SalesView) => {
    if (next === view) return;
    Animated.timing(viewFade, {
      toValue: 0, duration: 110, useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      setView(next);
      setSelectedWk(null);
      Animated.timing(viewFade, {
        toValue: 1, duration: 190, useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    });
  }, [view, viewFade]);

  const handleWeekTap = useCallback((wk: string) => {
    setSelectedWk(prev => (prev === wk ? null : wk));
  }, []);

  // Totals
  const total = view === "weekly"
    ? data.weekly.reduce((s: number, d: DailySale) => s + d.amount, 0)
    : data.monthly.reduce((s: number, d: WeeklySale) => s + d.amount, 0);

  // Best bar for footer
  const weeklyBest  = [...data.weekly].sort((a: DailySale, b: DailySale) => b.amount - a.amount)[0];
  const monthlyBest = [...data.monthly].sort((a: WeeklySale, b: WeeklySale) => b.amount - a.amount)[0];

  // Drill-down daily data for selected week
  const drillData: DailySale[] | null = selectedWk
    ? (data.drillDown.byWeek[selectedWk] ?? null)
    : null;

  // Line graph points
  const linePoints = useMemo<Point[]>(() => {
    if (!drillData || chartWidth === 0) return [];
    const max   = Math.max(...drillData.map((d: DailySale) => d.amount), 1);
    const count = drillData.length;
    return drillData.map((d: DailySale, i: number) => ({
      x: (chartWidth / (count - 1)) * i,
      y: LINE_HEIGHT - (d.amount / max) * LINE_HEIGHT,
    }));
  }, [drillData, chartWidth]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 20, padding: 18,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    }}>

      {/* ── Header: total + toggle in same row ── */}
      <View style={{
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 14,
      }}>
        {/* Left: label + amount */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{
            fontSize: 10, fontWeight: "700", color: "#15803d",
            letterSpacing: 1.5, textTransform: "uppercase",
          }}>
            {view === "weekly"
              ? "This Week"
              : selectedWk
              ? `${selectedWk} — Daily Breakdown`
              : "This Month"}
          </Text>
          <Text style={{
            fontSize: 26, fontWeight: "800", color: "#111827",
            lineHeight: 34, marginTop: 2,
          }}>
            ₱{total.toLocaleString()}
          </Text>
        </View>

        {/* Right: toggle — upper right corner */}
        <View style={{
          flexDirection: "row", backgroundColor: "#f3f4f6",
          borderRadius: 12, padding: 3,
        }}>
          {(["weekly", "monthly"] as SalesView[]).map(v => (
            <TouchableOpacity
              key={v}
              onPress={() => switchView(v)}
              style={{
                paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9,
                backgroundColor: view === v ? "#166534" : "transparent",
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                fontSize: 10, fontWeight: "700",
                color: view === v ? "#fff" : "#9ca3af",
              }}>
                {v === "weekly" ? "Weekly" : "Monthly"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Chart area — fixed height so card never shifts ── */}
      <Animated.View style={{ opacity: viewFade }} onLayout={onLayout}>

        {/* Monthly: 4-week bars + drill-down line graph */}
        {view === "monthly" && (
          selectedWk && drillData ? (
            // Drill-down: line graph
            <FadeView visible>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => setSelectedWk(null)}
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons name="arrow-left" size={14} color="#15803d" />
                </TouchableOpacity>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#6b7280" }}>
                  Back to monthly view
                </Text>
              </View>
              {/* Fixed-height line chart wrapper */}
              <View style={{ height: CHART_CONTAINER_H }}>
                <View style={{ position: "relative", height: LINE_HEIGHT }}>
                  {linePoints.length >= 2 && (
                    <LineGraph points={linePoints} w={chartWidth} h={LINE_HEIGHT} />
                  )}
                </View>
                <View style={{ flexDirection: "row", marginTop: 6 }}>
                  {drillData.map((d: DailySale) => (
                    <Text key={d.day} style={{
                      flex: 1, textAlign: "center", fontSize: 9,
                      fontWeight: d.day === TODAY_LABEL ? "800" : "500",
                      color: d.day === TODAY_LABEL ? "#16a34a" : "#9ca3af",
                    }}>
                      {d.day}
                    </Text>
                  ))}
                </View>
              </View>
            </FadeView>
          ) : (
            // Monthly bars
            <FadeView visible>
              <Text style={{
                fontSize: 10, color: "#9ca3af", fontWeight: "600", marginBottom: 6,
              }}>
                Tap a week to see daily breakdown
              </Text>
              <BarChart
                data={data.monthly.map((d: WeeklySale) => ({ label: d.week, amount: d.amount }))}
                selected={selectedWk}
                highlighted={CURRENT_WEEK_LABEL}
                onPress={handleWeekTap}
                height={BAR_HEIGHT}
              />
            </FadeView>
          )
        )}

        {/* Weekly: 7 daily bars with today highlighted */}
        {view === "weekly" && (
          <FadeView visible>
            <BarChart
              data={data.weekly.map((d: DailySale) => ({ label: d.day, amount: d.amount }))}
              highlighted={TODAY_LABEL}
              height={BAR_HEIGHT}
            />
          </FadeView>
        )}
      </Animated.View>

      {/* ── Footer: best bar only (percentage removed) ── */}
      <View style={{
        flexDirection: "row", justifyContent: "space-between",
        marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6",
      }}>
        <View>
          <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "500" }}>
            {view === "weekly" ? "Best Day" : "Best Week"}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
            {view === "weekly"
              ? `${weeklyBest.day} · ₱${weeklyBest.amount.toLocaleString()}`
              : `${monthlyBest.week} · ₱${monthlyBest.amount.toLocaleString()}`}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "500" }}>Today</Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#16a34a" }}>
            {/* Find today's amount if available */}
            {view === "weekly"
              ? (() => {
                  const todayData = data.weekly.find((d: DailySale) => d.day === TODAY_LABEL);
                  return todayData ? `₱${todayData.amount.toLocaleString()}` : "—";
                })()
              : `${CURRENT_WEEK_LABEL}`}
          </Text>
        </View>
      </View>
    </View>
  );
};