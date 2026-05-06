/**
 * InteractiveSalesChart.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Drill-down bar chart replacing the old Daily/Weekly toggle + trend buttons.
 *
 * UX flow:
 *   Monthly (4 weeks)
 *     └─ tap a week bar  → drill into that week's 7 daily bars + trend line
 *           └─ tap a day bar → drill into that day's hourly bars + trend line
 *
 * First tap on a bar:  highlights it and shows a hint
 * Second tap (same):   drills down one level
 * Back arrow:          goes up one level
 *
 * Trend line is drawn with pure React Native (no SVG dependency):
 *   Each segment is an absolutely-positioned rotated <View />.
 */

import React, {
  useState, useCallback, useMemo, useRef,
} from "react";
import {
  View, Text, TouchableOpacity, Animated, Easing,
  useWindowDimensions,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import type { SalesData, DailySale, HourlySale } from "../../hooks/UseHomeData";

// ─── Types ────────────────────────────────────────────────────────────────────

type DrillLevel = "monthly" | "weekly" | "daily";
type BarItem    = { label: string; amount: number };
type Point      = { x: number; y: number };

// ─── Pure-RN Trend Line ───────────────────────────────────────────────────────
// Each segment is a thin View placed at the midpoint between two data points
// and rotated to the correct angle.  No react-native-svg required.

const TREND_COLOR   = "#166534";
const DOT_SIZE      = 7;
const SEGMENT_H     = 2.5;

const TrendLine: React.FC<{
  points: Point[];
  containerW: number;
  containerH: number;
}> = ({ points, containerW, containerH }) => {
  if (points.length < 2) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: containerW, height: containerH,
      }}
    >
      {/* ── Segments ── */}
      {points.map((pt, i) => {
        if (i === 0) return null;
        const prev  = points[i - 1];
        const dx    = pt.x - prev.x;
        const dy    = pt.y - prev.y;
        const len   = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const midX  = (pt.x + prev.x) / 2;
        const midY  = (pt.y + prev.y) / 2;

        return (
          <View
            key={`seg-${i}`}
            style={{
              position: "absolute",
              width:  len,
              height: SEGMENT_H,
              borderRadius: 2,
              backgroundColor: TREND_COLOR,
              // Centre the view on the midpoint, then rotate
              left: midX - len / 2,
              top:  midY - SEGMENT_H / 2,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}

      {/* ── Dots ── */}
      {points.map((pt, i) => (
        <View
          key={`dot-${i}`}
          style={{
            position: "absolute",
            width:  DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: TREND_COLOR,
            borderWidth: 2,
            borderColor: "#fff",
            left: pt.x - DOT_SIZE / 2,
            top:  pt.y - DOT_SIZE / 2,
          }}
        />
      ))}
    </View>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_HEIGHT   = 64;
const CARD_PADDING   = 40; // total horizontal padding inside the sales card

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  data: SalesData;
  /** Optional fixed-width override (used in tests / Storybook) */
  fixedWidth?: number;
}

export const InteractiveSalesChart: React.FC<Props> = ({ data, fixedWidth }) => {
  const { width: SCREEN_W } = useWindowDimensions();
  const chartW = fixedWidth ?? SCREEN_W - CARD_PADDING;

  // ── Drill-down state ──────────────────────────────────────────────────────
  const [level,       setLevel]       = useState<DrillLevel>("monthly");
  const [selWeek,     setSelWeek]     = useState<string | null>(null);
  const [selDay,      setSelDay]      = useState<string | null>(null);
  /** The bar the user single-tapped (awaiting second tap to drill in) */
  const [pendingBar,  setPendingBar]  = useState<string | null>(null);

  // ── Fade animation for level transitions ─────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = useCallback((fn: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 120,
        useNativeDriver: true, easing: Easing.out(Easing.ease),
      }),
      // "Dummy" timing with duration 0 to run fn mid-sequence
      Animated.timing(new Animated.Value(0), {
        toValue: 1, duration: 0, useNativeDriver: true,
      }),
    ]).start(() => {
      fn();
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 200,
        useNativeDriver: true, easing: Easing.in(Easing.ease),
      }).start();
    });
  }, [fadeAnim]);

  // ── Derived display data ──────────────────────────────────────────────────
  const { bars, trendItems, title, hintText } = useMemo(() => {
    if (level === "monthly") {
      return {
        bars:       data.weekly.map((w: DailySale) => ({ label: w.day, amount: w.amount })),
        trendItems: ([] as BarItem[]),
        title:      "Monthly Sales",
        hintText:   pendingBar
          ? `Tap ${pendingBar} again to see daily breakdown`
          : "Tap a bar to preview its trend",
      };
    }

    if (level === "weekly") {
      const weekBars = selWeek
        ? (data.drillDown.byWeek[selWeek] ?? []).map((d: DailySale) => ({ label: d.day, amount: d.amount }))
        : data.weekly.map((d: DailySale) => ({ label: d.day, amount: d.amount }));
      const trendRaw = pendingBar
        ? (data.drillDown.byDay[pendingBar] ?? []).map((h: HourlySale) => ({ label: h.hour, amount: h.amount }))
        : [];
      return {
        bars:       weekBars,
        trendItems: trendRaw,
        title:      selWeek ?? "This Week",
        hintText:   pendingBar
          ? `Tap ${pendingBar} again to see hourly breakdown`
          : "Tap a day to preview its trend",
      };
    }

    // "daily" (hourly view)
    const hourBars = selDay
      ? (data.drillDown.byDay[selDay] ?? []).map((h: HourlySale) => ({ label: h.hour, amount: h.amount }))
      : [];
    return {
      bars:       hourBars,
      trendItems: ([] as BarItem[]),
      title:      selDay ?? "Today",
      hintText:   "Hourly breakdown",
    };
  }, [level, selWeek, selDay, pendingBar, data]);

  const maxBar   = Math.max(...bars.map((b: BarItem) => b.amount),   1);
  const maxTrend = Math.max(...trendItems.map((t: BarItem) => t.amount), 1);
  const total    = bars.reduce((s: number, b: BarItem) => s + b.amount, 0);

  // ── Build trend-line points ───────────────────────────────────────────────
  // The trend overlay maps the drill-down data onto the SAME x-positions as the bars.
  const trendPoints: Point[] = useMemo(() => {
    if (!trendItems.length) return [];
    const barW = chartW / bars.length;
    return trendItems.map((td: BarItem, i: number) => ({
      x: barW * i + barW / 2,
      y: CHART_HEIGHT - (td.amount / maxTrend) * CHART_HEIGHT,
    }));
  }, [trendItems, bars.length, chartW, maxTrend]);

  // ── Bar interaction ───────────────────────────────────────────────────────
  const handleBarPress = useCallback((bar: BarItem) => {
    if (level === "daily") return; // no further drill

    if (pendingBar === bar.label) {
      // Second tap → drill down
      animateTransition(() => {
        if (level === "monthly") {
          setSelWeek(bar.label);
          setLevel("weekly");
        } else {
          setSelDay(bar.label);
          setLevel("daily");
        }
        setPendingBar(null);
      });
    } else {
      // First tap → select + show trend preview
      setPendingBar(bar.label);
    }
  }, [level, pendingBar, animateTransition]);

  const goBack = useCallback(() => {
    animateTransition(() => {
      if (level === "daily") {
        setLevel("weekly");
        setSelDay(null);
        setPendingBar(null);
      } else {
        setLevel("monthly");
        setSelWeek(null);
        setPendingBar(null);
      }
    });
  }, [level, animateTransition]);

  // ── Summary data for the footer row ──────────────────────────────────────
  const bestBar = bars.length
    ? bars.reduce((best: BarItem, b: BarItem) => (b.amount > best.amount ? b : best), bars[0])
    : null;

  // ── Breadcrumb labels ─────────────────────────────────────────────────────
  const breadcrumb = useMemo(() => {
    if (level === "monthly") return null;
    if (level === "weekly")  return selWeek;
    return `${selWeek} › ${selDay}`;
  }, [level, selWeek, selDay]);

  return (
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 20,
    }}>
      {/* ── Header ── */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {level !== "monthly" && (
            <TouchableOpacity
              onPress={goBack}
              style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: "#f0fdf4",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <FontAwesome5 name="arrow-left" size={10} color="#15803d" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d", letterSpacing: 1.5, textTransform: "uppercase" }}>
              {title}
            </Text>
            <Text style={{ fontSize: 30, fontWeight: "800", color: "#111827", lineHeight: 38, marginTop: 2 }}>
              ₱{total.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f0fdf4", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 4, marginTop: 4 }}>
          <MaterialCommunityIcons name="trending-up" size={13} color="#15803d" />
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#15803d" }}>+12%</Text>
        </View>
      </View>

      {/* ── Breadcrumb ── */}
      {breadcrumb && (
        <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "600", marginBottom: 2 }}>
          {breadcrumb}
        </Text>
      )}

      {/* ── Hint ── */}
      {level !== "daily" && (
        <Text style={{ fontSize: 10, color: pendingBar ? "#15803d" : "#9ca3af", fontWeight: pendingBar ? "700" : "500", marginBottom: 8 }}>
          {hintText}
        </Text>
      )}

      {/* ── Chart ── */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={{ position: "relative" }}>
          {/* Bars */}
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: CHART_HEIGHT }}>
            {bars.map((bar: BarItem) => {
              const barH    = Math.max((bar.amount / maxBar) * CHART_HEIGHT, 4);
              const isSel   = pendingBar === bar.label;
              return (
                <TouchableOpacity
                  key={bar.label}
                  onPress={() => handleBarPress(bar)}
                  activeOpacity={0.7}
                  style={{ flex: 1, height: CHART_HEIGHT, alignItems: "center", justifyContent: "flex-end" }}
                >
                  <View
                    style={{
                      height: barH,
                      width: "72%",
                      borderRadius: 4,
                      backgroundColor: isSel ? "#166534" : "#bbf7d0",
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Trend line overlay */}
          {trendPoints.length >= 2 && (
            <TrendLine
              points={trendPoints}
              containerW={chartW}
              containerH={CHART_HEIGHT}
            />
          )}
        </View>

        {/* X-axis labels */}
        <View style={{ flexDirection: "row", marginTop: 5, gap: 4 }}>
          {bars.map((bar: BarItem) => (
            <Text
              key={bar.label}
              style={{ flex: 1, fontSize: 9, color: pendingBar === bar.label ? "#15803d" : "#9ca3af", textAlign: "center", fontWeight: pendingBar === bar.label ? "800" : "500" }}
            >
              {bar.label}
            </Text>
          ))}
        </View>
      </Animated.View>

      {/* ── Footer summary ── */}
      {bestBar && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6" }}>
          <View>
            <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "500" }}>
              {level === "monthly" ? "Best Week" : level === "weekly" ? "Best Day" : "Peak Hour"}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
              {bestBar.label} · ₱{bestBar.amount.toLocaleString()}
            </Text>
          </View>

          {pendingBar && level !== "daily" && (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "500" }}>Tap again to enter</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#15803d" }}>{pendingBar}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};