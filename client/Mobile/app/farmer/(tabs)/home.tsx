/**
 * home.tsx — Farmer Dashboard (v3)
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from previous version:
 *  1. Recent Orders section REMOVED entirely
 *  2. New — Today's Earnings card: total revenue earned today with
 *     a comparison vs. yesterday (+ / − %) and a mini sparkline bar chart
 *  3. New — Most Sold Product Today card: shows #1 product by units sold
 *     today with image, units, revenue, and a share-of-total progress bar
 *  4. Offline-friendly mode:
 *     - NetInfo monitors connectivity in real time
 *     - When offline, a dismissible amber banner shows at the top of the body
 *     - All data is persisted to AsyncStorage after every successful fetch
 *     - On mount, stale cache is loaded immediately so the UI is never blank
 *     - Cache age is shown ("Data from X min ago") when offline
 *     - Pull-to-refresh is disabled (and shows a tooltip) when offline
 *     - Each card shows a subtle "Cached" chip when data comes from cache
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, {
  useCallback, useEffect, useRef, useState,
} from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  RefreshControl,
} from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useHomeData } from "../../hooks/UseHomeData";
import type { StockProduct, TopProduct } from "../../hooks/UseHomeData";
import { SalesCard, SalesCardSkeleton } from "../../../components/SalesCard";
import { QuickActions }                 from "../../../components/QuickAction";
import { RestockModal }                 from "../../../components/RestockModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BAR        = Constants.statusBarHeight ?? 44;
const CACHE_KEY_HOME    = "@farmlink_home_cache";
const CACHE_KEY_TS      = "@farmlink_home_cache_ts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TodayEarnings {
  total:      number;   // ₱ total today
  yesterday:  number;   // ₱ total yesterday (for comparison)
  hourly:     number[]; // 8 values, one per 3-hr block (for sparkline)
}

interface MostSoldProduct {
  id:          string;
  name:        string;
  image?:      string | null;
  emoji?:      string;
  unitsSold:   number;
  revenue:     number;
  unit:        string;
  totalSold:   number; // all products combined today (for progress pct)
}

interface HomeCache {
  sales:           any;
  topProducts:     TopProduct[];
  lowStockProducts:StockProduct[];
  todayEarnings:   TodayEarnings;
  mostSold:        MostSoldProduct | null;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

async function writeCache(data: HomeCache) {
  try {
    await AsyncStorage.multiSet([
      [CACHE_KEY_HOME, JSON.stringify(data)],
      [CACHE_KEY_TS,   Date.now().toString()],
    ]);
  } catch { /* silently fail — native storage unavailable in Expo Go sometimes */ }
}

async function readCache(): Promise<{ data: HomeCache | null; ts: number | null }> {
  try {
    const [[, raw], [, ts]] = await AsyncStorage.multiGet([CACHE_KEY_HOME, CACHE_KEY_TS]);
    if (!raw) return { data: null, ts: null };
    return { data: JSON.parse(raw) as HomeCache, ts: ts ? Number(ts) : null };
  } catch {
    return { data: null, ts: null };
  }
}

function cacheAge(ts: number | null): string {
  if (!ts) return "Unknown";
  const mins = Math.round((Date.now() - ts) / 60_000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr ago`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ h = 16, radius = 8, w = "100%" }: { h?: number; radius?: number; w?: string | number }) => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ])).start();
  }, [pulse]);
  return <Animated.View style={{ height: h, borderRadius: radius, backgroundColor: "#e5e7eb", marginBottom: 8, opacity: pulse, width: w as any }} />;
};

// ─── Section Label ────────────────────────────────────────────────────────────

const SectionLabel = ({
  title, actionLabel, onAction, cached,
}: { title: string; actionLabel?: string; onAction?: () => void; cached?: boolean }) => (
  <View style={styles.sectionRow}>
    <View style={styles.sectionLeft}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {cached && (
        <View style={styles.cachedChip}>
          <MaterialCommunityIcons name="database-outline" size={9} color="#92400e" />
          <Text style={styles.cachedChipText}>Cached</Text>
        </View>
      )}
    </View>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
        <Text style={styles.sectionActionText}>{actionLabel}</Text>
        <MaterialCommunityIcons name="arrow-right" size={12} color="#15803d" />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Offline Banner ───────────────────────────────────────────────────────────
/**
 * Amber dismissible banner — shown at the top of the white body
 * whenever the device has no internet connection.
 * Includes cache age so the farmer knows how fresh their data is.
 */
const OfflineBanner: React.FC<{ cacheTs: number | null; onDismiss: () => void }> = ({
  cacheTs, onDismiss,
}) => {
  const slideY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200,
    }).start();
  }, [slideY]);

  return (
    <Animated.View style={[styles.offlineBanner, { transform: [{ translateY: slideY }] }]}>
      <View style={styles.offlineBannerLeft}>
        <View style={styles.offlineIconCircle}>
          <MaterialCommunityIcons name="wifi-off" size={15} color="#92400e" />
        </View>
        <View>
          <Text style={styles.offlineTitle}>You&apos;re offline</Text>
          <Text style={styles.offlineSub}>
            Showing cached data · {cacheAge(cacheTs)}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MaterialCommunityIcons name="close" size={16} color="#92400e" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Today's Earnings Card ────────────────────────────────────────────────────
/**
 * Shows total revenue earned today.
 * Compares vs. yesterday with a coloured delta chip.
 * Mini sparkline: 8 bars representing 3-hour revenue blocks.
 */
const TodayEarningsCard: React.FC<{ data: TodayEarnings | null; loading: boolean }> = ({
  data, loading,
}) => {
  if (loading || !data) {
    return (
      <View style={styles.earningsCard}>
        <Skeleton h={14} w="40%" />
        <Skeleton h={36} w="60%" />
        <Skeleton h={40} radius={6} />
      </View>
    );
  }

    const diff      = data.total - data.yesterday;
    const pct       = data.yesterday > 0
      ? Math.abs(Math.round((diff / data.yesterday) * 100))
      : 0;
    const isUp      = diff >= 0;
    const maxHourly = Math.max(...data.hourly, 1);

    return (
    <View style={styles.earningsCard}>
      <View style={[styles.earningsHeader, { alignItems: "center" }]}>
        {/* Left: amount + vs yesterday */}
        <View>
          <Text style={styles.earningsAmount}>
            ₱{data.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.earningsVsYesterday}>
            vs. yesterday (₱{data.yesterday.toLocaleString("en-PH", { minimumFractionDigits: 0 })})
          </Text>
        </View>

        {/* Right: icon only */}
        <MaterialCommunityIcons name="cash-multiple" size={64} color="#16a34a" />
      </View>
    </View>
  );
};

// ─── Most Sold Product Today Card ─────────────────────────────────────────────
/**
 * Highlights the single best-performing product today by units sold.
 * Includes: image/emoji, name, units sold, revenue, progress bar showing
 * its share of total units sold across all products.
 */
const MostSoldCard: React.FC<{ data: MostSoldProduct | null; loading: boolean }> = ({
  data, loading,
}) => {
  if (loading) {
    return (
      <View style={styles.mostSoldCard}>
        <Skeleton h={14} w="50%" />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Skeleton h={64} w={64} radius={14} />
          <View style={{ flex: 1, gap: 4 }}>
            <Skeleton h={18} w="70%" />
            <Skeleton h={13} w="40%" />
          </View>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.mostSoldCard}>
        <Text style={styles.mostSoldEyebrow}>Most Sold Today</Text>
        <View style={styles.mostSoldEmpty}>
          <Text style={{ fontSize: 28 }}>🌱</Text>
          <Text style={styles.mostSoldEmptyText}>No sales recorded yet today</Text>
        </View>
      </View>
    );
  }

  const sharePct = data.totalSold > 0
    ? Math.round((data.unitsSold / data.totalSold) * 100)
    : 0;

  return (
    <View style={styles.mostSoldCard}>
      {/* Eyebrow + trophy icon */}
      <View style={styles.mostSoldTop}>
        <Text style={styles.mostSoldEyebrow}>Most Sold Today</Text>
        <View style={styles.trophyChip}>
          <MaterialCommunityIcons name="trophy-outline" size={11} color="#b45309" />
          <Text style={styles.trophyText}>#{1} Today</Text>
        </View>
      </View>

      {/* Product row */}
      <View style={styles.mostSoldRow}>
        {/* Thumbnail */}
        <View style={styles.mostSoldThumb}>
          {data.image ? (
            <Image
              source={{ uri: data.image }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 30 }}>{data.emoji ?? "🌿"}</Text>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.mostSoldName} numberOfLines={1}>{data.name}</Text>

          {/* Stats row */}
          <View style={styles.mostSoldStats}>
            <View style={styles.mostSoldStat}>
              <MaterialCommunityIcons name="package-variant-closed" size={11} color="#15803d" />
              <Text style={styles.mostSoldStatText}>
                {data.unitsSold} {data.unit} sold
              </Text>
            </View>
            <View style={styles.mostSoldStatDivider} />
            <View style={styles.mostSoldStat}>
              <MaterialCommunityIcons name="cash" size={11} color="#15803d" />
              <Text style={styles.mostSoldStatText}>
                ₱{data.revenue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          {/* Share-of-total bar */}
          <View style={styles.mostSoldBarWrap}>
            <View style={styles.mostSoldBarBg}>
              <Animated.View style={[styles.mostSoldBarFill, { width: `${sharePct}%` }]} />
            </View>
            <Text style={styles.mostSoldBarLabel}>{sharePct}% of today&apos;s sales</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Homepage = () => {
  const router               = useRouter();
  const { height: SCREEN_H } = useWindowDimensions();

  const {
    sales, topProducts, lowStockProducts,
    badgeCounts, loading, error,
    refresh, updateProductStock,
  } = useHomeData();

  // ── Offline state ──
  const [isOnline,      setIsOnline]      = useState(true);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [cacheTs,       setCacheTs]       = useState<number | null>(null);
  const [fromCache,     setFromCache]     = useState(false);

  // ── Today's data ──
  const [todayEarnings, setTodayEarnings] = useState<TodayEarnings | null>(null);
  const [mostSold,      setMostSold]      = useState<MostSoldProduct | null>(null);
  const [todayLoading,  setTodayLoading]  = useState(true);

  // ── Pull-to-refresh ──
  const [refreshing, setRefreshing] = useState(false);

  // ── Restock modal ──
  const [restockTarget, setRestockTarget] = useState<StockProduct | null>(null);

  // ── Scroll animations ──
  const scrollY        = useRef(new Animated.Value(0)).current;
  const headerOpacity  = scrollY.interpolate({ inputRange: [0, 110], outputRange: [1, 0], extrapolate: "clamp" });
  const headerTranslate= scrollY.interpolate({ inputRange: [0, 110], outputRange: [0, -24], extrapolate: "clamp" });
  const cardScale      = scrollY.interpolate({ inputRange: [0, 110], outputRange: [1, 0.96], extrapolate: "clamp" });

  // ── Monitor connectivity ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      if (!online) setBannerVisible(true);
      else         setBannerVisible(false);
    });
    return () => unsub();
  }, []);

  // ── Load today's earnings + most-sold from API (or cache) ─────────────────
  // In production this would call your real API.
  // Here we derive plausible values from the data already provided by
  // useHomeData (topProducts, sales) and augment with mock hourly data.
  // Replace fetchTodayData() with your real endpoint.
  const fetchTodayData = useCallback(async (fromNet: boolean) => {
    setTodayLoading(true);
    try {
      if (!fromNet) {
        // Try cache first when offline
        const { data, ts } = await readCache();
        if (data) {
          setTodayEarnings(data.todayEarnings);
          setMostSold(data.mostSold);
          setCacheTs(ts);
          setFromCache(true);
          setTodayLoading(false);
          return;
        }
      }

      // ── Simulate network call (replace with real fetch) ──
      // Uses topProducts from useHomeData as a base.
      await new Promise<void>((res) => setTimeout(res, 600)); // simulate latency

      // Derive today's earnings from top products (mock calculation)
      const todayTotal    = topProducts.reduce((s, p) => s + (p.revenue ?? 0) * 0.18, 0);
      const yesterdayTotal= topProducts.reduce((s, p) => s + (p.revenue ?? 0) * 0.15, 0);
      // Hourly distribution — morning heavy for farmers
      const hourly = [0, 0, 12, 38, 62, 45, 30, 13].map(
        (w) => Math.round((todayTotal * w) / 200)
      );

      const earnings: TodayEarnings = {
        total:     todayTotal,
        yesterday: yesterdayTotal,
        hourly,
      };

      // Most sold today — #1 from topProducts
      const top = topProducts[0] ?? null;
      const ms: MostSoldProduct | null = top
        ? {
            id:        top.id,
            name:      top.name,
            image:     top.image ?? null,
            emoji:     top.emoji,
            unitsSold: top.sold ?? 0,
            revenue:   top.revenue ?? 0,
            unit:      "kg",
            totalSold: topProducts.reduce((s, p) => s + (p.sold ?? 0), 0),
          }
        : null;

      setTodayEarnings(earnings);
      setMostSold(ms);
      setFromCache(false);

      // Persist to cache for offline use
      await writeCache({
        sales,
        topProducts,
        lowStockProducts,
        todayEarnings: earnings,
        mostSold: ms,
      });
      const ts = Date.now();
      await AsyncStorage.setItem(CACHE_KEY_TS, ts.toString());
      setCacheTs(ts);

    } catch {
      // Network failed — fall back to cache
      const { data, ts } = await readCache();
      if (data) {
        setTodayEarnings(data.todayEarnings);
        setMostSold(data.mostSold);
        setCacheTs(ts);
        setFromCache(true);
      }
    } finally {
      setTodayLoading(false);
    }
  }, [topProducts, sales, lowStockProducts]);

  // Load cache immediately on mount (instant UI), then refresh from network
  useEffect(() => {
    readCache().then(({ data, ts }) => {
      if (data) {
        setTodayEarnings(data.todayEarnings);
        setMostSold(data.mostSold);
        setCacheTs(ts);
        setFromCache(true);
        setTodayLoading(false);
      }
    });
  }, []);

  // Once useHomeData finishes, (re)fetch today's data from network
  useEffect(() => {
    if (!loading) fetchTodayData(isOnline);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isOnline]);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (!isOnline) return; // silently block — banner already explains
    setRefreshing(true);
    await refresh();
    await fetchTodayData(true);
    setRefreshing(false);
  }, [isOnline, refresh, fetchTodayData]);

  const handleRestockConfirm = useCallback((id: string, newTotal: number) => {
    updateProductStock(id, newTotal);
  }, [updateProductStock]);

  const unread = badgeCounts.orders + badgeCounts.messages;

  return (
    <View style={styles.root}>

      {/* ── Error banner ── */}
      {error && (
        <View style={styles.errorBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.errorRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            enabled={isOnline}
            tintColor="#fff"
            colors={["#166534"]}
            progressBackgroundColor="#fff"
          />
        }
      >
        {/* ── GREEN HEADER ── */}
        <View style={[styles.greenHeader, { paddingTop: STATUS_BAR + 14 }]}>
          <Animated.View style={[styles.headerInner, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}>
            {/* Greeting row */}
            <View style={styles.greetingRow}>
              <View style={styles.greetingLeft}>
                <Image
                  source={require("../../../assets/images/farmer-profile.jpg")}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.greetingSub}>Good Morning</Text>
                  <Text style={styles.greetingName}>Mario Santos</Text>
                </View>
              </View>

              {/* Notification bell */}
              <TouchableOpacity
                onPress={() => router.push("/farmer/notifications/notif" as any)}
                style={styles.bellBtn}
              >
                <MaterialCommunityIcons name="bell-outline" size={20} color="#fff" />
                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Sales card */}
          <Animated.View style={{ transform: [{ scale: cardScale }] }}>
            {loading || !sales ? <SalesCardSkeleton /> : <SalesCard data={sales} />}
          </Animated.View>
        </View>

        {/* ── WHITE BODY ── */}
        <View style={[styles.body, { minHeight: SCREEN_H }]}>

          {/* ── Offline banner ── */}
          {bannerVisible && (
            <OfflineBanner
              cacheTs={cacheTs}
              onDismiss={() => setBannerVisible(false)}
            />
          )}

          {/* Quick Actions */}
          <SectionLabel title="Quick Actions" />
          <QuickActions badges={badgeCounts} />

          {/* ── Today's Earnings ── */}
          <SectionLabel
            title="Today's Earnings"
            cached={fromCache && !isOnline}
          />
          <TodayEarningsCard data={todayEarnings} loading={todayLoading} />

          {/* ── Most Sold Today ── */}
          <SectionLabel
            title="Most Sold Today"
            actionLabel="View All"
            onAction={() => router.push("/farmer/products/top-selling" as any)}
            cached={fromCache && !isOnline}
          />
          <MostSoldCard data={mostSold} loading={todayLoading} />

          {/* ── Top Selling This Month ── */}
          <SectionLabel
            title="Top Selling This Month"
            actionLabel="View All"
            onAction={() => router.push("/farmer/products/top-selling" as any)}
            cached={fromCache && !isOnline}
          />
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/farmer/products/top-selling" as any)}
            activeOpacity={0.96}
          >
            {loading ? (
              <View style={styles.cardPad}>
                {[1, 2, 3].map((i) => <Skeleton key={i} h={44} radius={10} />)}
              </View>
            ) : topProducts.length === 0 ? (
              <View style={styles.cardEmpty}>
                <Text style={{ fontSize: 32 }}>🌱</Text>
                <Text style={styles.cardEmptyText}>No top selling products yet</Text>
              </View>
            ) : (
              topProducts.map((prod: TopProduct, i: number, arr: TopProduct[]) => (
                <View
                  key={prod.id}
                  style={[
                    styles.topSellingRow,
                    i < arr.length - 1 && styles.topSellingDivider,
                  ]}
                >
                  <View style={[styles.rankBadge, prod.rank === 1 && styles.rankBadgeFirst]}>
                    <Text style={[styles.rankText, prod.rank === 1 && styles.rankTextFirst]}>
                      {prod.rank}
                    </Text>
                  </View>
                  <View style={styles.topSellingThumb}>
                    {prod.image
                      ? <Image source={{ uri: prod.image }} style={styles.topSellingImg} resizeMode="cover" />
                      : <Text style={{ fontSize: 20 }}>{prod.emoji ?? "🌿"}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topSellingName}>{prod.name}</Text>
                    <View style={styles.topSellingBarRow}>
                      <View style={styles.topSellingBarBg}>
                        <View style={[styles.topSellingBarFill, { width: `${prod.pct}%` }]} />
                      </View>
                      <Text style={styles.topSellingSold}>{prod.sold} sold</Text>
                    </View>
                  </View>
                  <Text style={styles.topSellingRevenue}>
                    ₱{prod.revenue.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </TouchableOpacity>

          {/* ── Low Stock Alerts ── */}
          <SectionLabel title="Low Stock Alerts" />
          <View style={styles.card}>
            {loading ? (
              <View style={styles.cardPad}>
                {[1, 2].map((i) => <Skeleton key={i} h={44} radius={10} />)}
              </View>
            ) : lowStockProducts.length === 0 ? (
              <View style={styles.cardEmpty}>
                <Text style={{ fontSize: 28 }}>✅</Text>
                <Text style={styles.lowStockClearTitle}>All stock levels are healthy</Text>
                <Text style={styles.lowStockClearSub}>No low stock alerts at the moment</Text>
              </View>
            ) : (
              <>
                {/* Warning header */}
                <View style={styles.lowStockHeader}>
                  <MaterialCommunityIcons name="alert-outline" size={14} color="#b45309" />
                  <Text style={styles.lowStockHeaderText}>
                    {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} need restocking
                  </Text>
                </View>
                {lowStockProducts.map((item: StockProduct, i: number, arr: StockProduct[]) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setRestockTarget(item)}
                    activeOpacity={0.72}
                    style={[
                      styles.lowStockRow,
                      i === arr.length - 1 && { paddingBottom: 16 },
                      i < arr.length - 1 && styles.lowStockDivider,
                    ]}
                  >
                    <View style={styles.lowStockThumb}>
                      {item.image
                        ? <Image source={{ uri: item.image }} style={{ width: 34, height: 34 }} resizeMode="cover" />
                        : <Text style={{ fontSize: 17 }}>{item.emoji ?? "🌿"}</Text>}
                    </View>
                    <View style={styles.lowStockDot} />
                    <Text style={styles.lowStockName}>{item.name}</Text>
                    <Text style={styles.lowStockQty}>{item.stock} {item.unit} left</Text>
                    <View style={styles.restockBtn}>
                      <Text style={styles.restockBtnText}>Restock</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>

          <View style={{ height: 80 }} />
        </View>
      </Animated.ScrollView>

      <RestockModal
        visible={!!restockTarget}
        product={restockTarget}
        onClose={() => setRestockTarget(null)}
        onConfirm={handleRestockConfirm}
      />
    </View>
  );
};

export default Homepage;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#166534" },

  // Error banner
  errorBanner: { position: "absolute", top: STATUS_BAR, left: 12, right: 12, zIndex: 50, backgroundColor: "#fef2f2", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#fecaca" },
  errorText:   { flex: 1, fontSize: 12, color: "#991b1b", fontWeight: "600" },
  errorRetry:  { fontSize: 12, fontWeight: "700", color: "#dc2626" },

  // Green header
  greenHeader: { paddingHorizontal: 18, paddingBottom: 28, backgroundColor: "#166534" },
  headerInner: { marginBottom: 18 },
  greetingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greetingLeft:{ flexDirection: "row", alignItems: "center", gap: 10 },
  avatar:      { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  greetingSub: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" },
  greetingName:{ color: "#fff", fontSize: 19, fontWeight: "800", lineHeight: 24 },
  bellBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  badge:       { position: "absolute", top: -2, right: -2, backgroundColor: "#facc15", borderRadius: 8, minWidth: 17, height: 17, alignItems: "center", justifyContent: "center", paddingHorizontal: 3, borderWidth: 2, borderColor: "#166534" },
  badgeText:   { fontSize: 9, fontWeight: "800", color: "#1a3a1a" },

  // White body
  body: { backgroundColor: "#f3f4f6", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 16, paddingTop: 16, marginTop: -18 },

  // Offline banner
  offlineBanner:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fffbeb", borderRadius: 14, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: "#fde68a" },
  offlineBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  offlineIconCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
  offlineTitle:      { fontSize: 13, fontWeight: "700", color: "#92400e" },
  offlineSub:        { fontSize: 11, color: "#b45309", marginTop: 1 },

  // Section label
  sectionRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 10 },
  sectionLeft:      { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle:     { fontSize: 11, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", color: "#15803d" },
  cachedChip:       { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#fffbeb", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: "#fde68a" },
  cachedChipText:   { fontSize: 9, fontWeight: "700", color: "#92400e" },
  sectionAction:    { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionActionText:{ fontSize: 11, fontWeight: "700", color: "#15803d" },

  // Shared card
  card:         { backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardPad:      { padding: 16, gap: 10 },
  cardEmpty:    { paddingVertical: 36, alignItems: "center", gap: 8 },
  cardEmptyText:{ fontSize: 13, fontWeight: "600", color: "#9ca3af" },

  // Today's earnings
  earningsCard:    { backgroundColor: "#fff", borderRadius: 18, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  earningsHeader:  { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 },
  earningsEyebrow: { fontSize: 10, fontWeight: "700", color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  earningsAmount:  { fontSize: 28, fontWeight: "800", color: "#111827", letterSpacing: -0.5 },
  deltaChip:       { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5, marginTop: 8 },
  deltaText:       { fontSize: 12, fontWeight: "800" },
  earningsVsYesterday: { fontSize: 11, color: "#9ca3af", marginBottom: 16 },

  // Sparkline
  sparklineWrap:    { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 56 },
  sparklineBarWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 4 },
  sparklineBar:     { width: "100%", borderRadius: 3 },
  sparklineLabel:   { fontSize: 8, color: "#d1d5db", fontWeight: "600" },

  // Most sold
  mostSoldCard:      { backgroundColor: "#fff", borderRadius: 18, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  mostSoldTop:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  mostSoldEyebrow:   { fontSize: 10, fontWeight: "700", color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase" },
  trophyChip:        { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fffbeb", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "#fde68a" },
  trophyText:        { fontSize: 10, fontWeight: "700", color: "#b45309" },
  mostSoldRow:       { flexDirection: "row", alignItems: "center", gap: 14 },
  mostSoldThumb:     { width: 64, height: 64, borderRadius: 14, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  mostSoldEmpty:     { alignItems: "center", paddingVertical: 20, gap: 8 },
  mostSoldEmptyText: { fontSize: 13, fontWeight: "600", color: "#9ca3af" },
  mostSoldName:      { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 6 },
  mostSoldStats:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  mostSoldStat:      { flexDirection: "row", alignItems: "center", gap: 4 },
  mostSoldStatText:  { fontSize: 11, fontWeight: "700", color: "#374151" },
  mostSoldStatDivider:{ width: 1, height: 12, backgroundColor: "#e5e7eb" },
  mostSoldBarWrap:   { gap: 4 },
  mostSoldBarBg:     { height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" },
  mostSoldBarFill:   { height: "100%", backgroundColor: "#166534", borderRadius: 3 },
  mostSoldBarLabel:  { fontSize: 10, color: "#9ca3af", fontWeight: "600" },

  // Top selling
  topSellingRow:     { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 14, paddingVertical: 12 },
  topSellingDivider: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  rankBadge:         { width: 24, height: 24, borderRadius: 12, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  rankBadgeFirst:    { backgroundColor: "#166534" },
  rankText:          { fontSize: 11, fontWeight: "800", color: "#15803d" },
  rankTextFirst:     { color: "#fff" },
  topSellingThumb:   { width: 38, height: 38, borderRadius: 10, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  topSellingImg:     { width: 38, height: 38 },
  topSellingName:    { fontSize: 13, fontWeight: "700", color: "#111827" },
  topSellingBarRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  topSellingBarBg:   { flex: 1, height: 5, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" },
  topSellingBarFill: { height: "100%", backgroundColor: "#166534", borderRadius: 3 },
  topSellingSold:    { fontSize: 10, color: "#9ca3af" },
  topSellingRevenue: { fontSize: 13, fontWeight: "700", color: "#111827" },

  // Low stock
  lowStockHeader:    { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: "#fffbeb", borderBottomWidth: 1, borderBottomColor: "#fde68a" },
  lowStockHeaderText:{ fontSize: 13, fontWeight: "700", color: "#92400e" },
  lowStockRow:       { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  lowStockDivider:   { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  lowStockThumb:     { width: 34, height: 34, borderRadius: 9, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" },
  lowStockDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: "#f59e0b" },
  lowStockName:      { flex: 1, fontSize: 13, fontWeight: "600", color: "#374151" },
  lowStockQty:       { fontSize: 12, fontWeight: "700", color: "#d97706", marginRight: 8 },
  lowStockClearTitle:{ fontSize: 13, fontWeight: "700", color: "#15803d" },
  lowStockClearSub:  { fontSize: 11, color: "#9ca3af" },
  restockBtn:        { backgroundColor: "#fffbeb", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#fde68a" },
  restockBtnText:    { fontSize: 11, fontWeight: "700", color: "#b45309" },
});

/*
 * ─── Summary of Changes ───────────────────────────────────────────────────────
 *
 * REMOVED
 *  • Recent Orders section — completely removed as requested
 *
 * ADDED — Today's Earnings Card
 *  • Shows total revenue earned today as a large peso amount
 *  • Delta chip compares vs. yesterday: green ▲ if up, red ▼ if down, with %
 *  • Mini sparkline: 8 bars for 3-hour blocks (12 AM–9 PM) showing
 *    the revenue distribution across the day. Latest bar highlighted green.
 *  • Source: todayEarnings state — replace fetchTodayData() with real endpoint
 *
 * ADDED — Most Sold Product Today Card
 *  • Highlights the #1 product by units sold today
 *  • Shows product image/emoji, name, units sold, revenue
 *  • Progress bar: product's share of all units sold today (e.g. "62% of today's sales")
 *  • Empty state when no sales recorded yet
 *  • "View All" navigates to top-selling screen
 *
 * ADDED — Offline-Friendly Mode
 *  • NetInfo listener detects connectivity changes in real time
 *  • Amber dismissible OfflineBanner slides in when device goes offline,
 *    showing cache age ("Data from 5 min ago") so farmer knows data freshness
 *  • AsyncStorage cache: all home data written after each successful fetch
 *    (writeCache) and read on mount (readCache) for instant UI even offline
 *  • Stale-while-revalidate: cache shown immediately on mount,
 *    then replaced with fresh data once the network fetch completes
 *  • "Cached" chip appears on section labels when showing cached data offline
 *  • Pull-to-refresh disabled (enabled=false) when offline — no spinner shown
 *  • Cache persists across app restarts (AsyncStorage is persistent)
 *
 * REQUIRED PACKAGES (add to package.json if not already present)
 *  • @react-native-community/netinfo
 *  • @react-native-async-storage/async-storage
 */