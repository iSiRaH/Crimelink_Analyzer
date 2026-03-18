import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FaChartBar,
  FaExclamationTriangle,
  FaMapMarkedAlt,
  FaNetworkWired,
  FaRegClock,
  FaSearch,
  FaShieldAlt,
  FaUserShield,
  FaUsers,
  FaUserCheck,
  FaSyncAlt,
} from "react-icons/fa";
import { MdWifiCalling3 } from "react-icons/md";
import { ScanSearch } from "lucide-react";
import { getCrimeLocations } from "../../api/crimeReportService";
import { fetchFieldOfficers } from "../../services/officerLocation";
import type { crimeLocationType } from "../../types/crime";
import type { OfficerInfo } from "../../types/officers";

type DashboardModule = {
  title: string;
  description: string;
  route: string;
  icon: ReactNode;
  footNote: string;
};

const PRIORITY_CRIME_TYPES = new Set(["HOMICIDE", "ASSAULT", "ROBBERY"]);

const WIDTH_CLASSES = [
  "w-0",
  "w-[5%]",
  "w-[10%]",
  "w-[15%]",
  "w-[20%]",
  "w-[25%]",
  "w-[30%]",
  "w-[35%]",
  "w-[40%]",
  "w-[45%]",
  "w-[50%]",
  "w-[55%]",
  "w-[60%]",
  "w-[65%]",
  "w-[70%]",
  "w-[75%]",
  "w-[80%]",
  "w-[85%]",
  "w-[90%]",
  "w-[95%]",
  "w-full",
];

const toWidthClass = (percent: number): string => {
  const safePercent = Math.max(0, Math.min(100, percent));
  const index = Math.round(safePercent / 5);
  return WIDTH_CLASSES[index] ?? "w-0";
};

const moduleCards: DashboardModule[] = [
  {
    title: "Call Analysis",
    description:
      "Upload call-record PDFs, inspect network graphs, detect shared contacts, and review risk scores.",
    route: "/investigator/call-analysis",
    icon: <MdWifiCalling3 className="text-xl" />,
    footNote: "Includes incoming/outgoing graph intelligence",
  },
  {
    title: "Facial Recognition",
    description:
      "Analyze suspect images against the criminal database with confidence and risk-level indicators.",
    route: "/investigator/facial-recognition",
    icon: <ScanSearch className="h-5 w-5" />,
    footNote: "Configurable similarity threshold per investigation",
  },
  {
    title: "Safety Zone",
    description:
      "Monitor mapped crime hotspots and discover nearby police, hospitals, shelters, and security points.",
    route: "/investigator/safety-zone",
    icon: <FaMapMarkedAlt className="text-xl" />,
    footNote: "Crime overlays by type on Google Maps",
  },
  {
    title: "Officer Locations",
    description:
      "Track field officers, filter by duty status, and open detailed location timelines per officer.",
    route: "/investigator/officer-locations",
    icon: <FaUserShield className="text-xl" />,
    footNote: "Searchable list with quick status filtering",
  },
];

const formatCrimeType = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getRiskTone = (score: number) => {
  if (score >= 70) {
    return {
      label: "High",
      textClass: "text-red-300",
      barClass: "bg-red-500",
      panelClass: "border-red-500/40 bg-red-500/10",
    };
  }
  if (score >= 40) {
    return {
      label: "Moderate",
      textClass: "text-amber-300",
      barClass: "bg-amber-500",
      panelClass: "border-amber-500/40 bg-amber-500/10",
    };
  }
  return {
    label: "Low",
    textClass: "text-emerald-300",
    barClass: "bg-emerald-500",
    panelClass: "border-emerald-500/40 bg-emerald-500/10",
  };
};

function InvestigatorDashboard() {
  const [officers, setOfficers] = useState<OfficerInfo[]>([]);
  const [crimeLocations, setCrimeLocations] = useState<crimeLocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    const [officersResult, crimeLocationsResult] = await Promise.allSettled([
      fetchFieldOfficers(),
      getCrimeLocations(),
    ]);

    const failures: string[] = [];

    if (officersResult.status === "fulfilled") {
      setOfficers(officersResult.value);
    } else {
      failures.push("officer locations");
      console.error("Failed to load officers", officersResult.reason);
      setOfficers([]);
    }

    if (crimeLocationsResult.status === "fulfilled") {
      setCrimeLocations(crimeLocationsResult.value);
    } else {
      failures.push("crime hotspots");
      console.error(
        "Failed to load crime hotspots",
        crimeLocationsResult.reason,
      );
      setCrimeLocations([]);
    }

    if (failures.length > 0) {
      setError(
        `Some dashboard data could not be loaded: ${failures.join(", ")}.`,
      );
    }

    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const officerStats = useMemo(() => {
    const total = officers.length;
    const active = officers.filter(
      (officer) => officer.status?.toUpperCase() === "ACTIVE",
    ).length;
    const inactive = Math.max(total - active, 0);
    const readiness = total > 0 ? Math.round((active / total) * 100) : 0;

    return { total, active, inactive, readiness };
  }, [officers]);

  const crimeStats = useMemo(() => {
    const byType = crimeLocations.reduce<Record<string, number>>(
      (acc, item) => {
        const type = item.crimeType?.toUpperCase() ?? "UNKNOWN";
        acc[type] = (acc[type] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
    const total = crimeLocations.length;
    const priorityHotspots = crimeLocations.filter((item) =>
      PRIORITY_CRIME_TYPES.has(item.crimeType?.toUpperCase() ?? ""),
    ).length;
    const variety = sortedTypes.length;

    return { sortedTypes, total, priorityHotspots, variety };
  }, [crimeLocations]);

  const riskScore = useMemo(() => {
    if (officerStats.total === 0 && crimeStats.total === 0) {
      return 0;
    }

    const inactiveRatio =
      officerStats.total > 0 ? officerStats.inactive / officerStats.total : 0;
    const priorityRatio =
      crimeStats.total > 0 ? crimeStats.priorityHotspots / crimeStats.total : 0;

    return Math.min(100, Math.round(inactiveRatio * 45 + priorityRatio * 55));
  }, [
    crimeStats.priorityHotspots,
    crimeStats.total,
    officerStats.inactive,
    officerStats.total,
  ]);

  const riskTone = getRiskTone(riskScore);
  const topCrimeType = crimeStats.sortedTypes[0];

  const summaryCards = [
    {
      title: "Field Officers",
      value: officerStats.total,
      subtitle: `${officerStats.active} active right now`,
      icon: <FaUsers className="text-2xl text-blue-300" />,
      panelClass: "bg-blue-500/10 border-blue-500/30",
    },
    {
      title: "Operational Readiness",
      value: `${officerStats.readiness}%`,
      subtitle: `${officerStats.inactive} inactive`,
      icon: <FaUserCheck className="text-2xl text-emerald-300" />,
      panelClass: "bg-emerald-500/10 border-emerald-500/30",
    },
    {
      title: "Crime Hotspots",
      value: crimeStats.total,
      subtitle: `${crimeStats.variety} crime categories`,
      icon: <FaMapMarkedAlt className="text-2xl text-indigo-300" />,
      panelClass: "bg-indigo-500/10 border-indigo-500/30",
    },
    {
      title: "Priority Hotspots",
      value: crimeStats.priorityHotspots,
      subtitle: "Homicide, assault, robbery",
      icon: <FaExclamationTriangle className="text-2xl text-amber-300" />,
      panelClass: "bg-amber-500/10 border-amber-500/30",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-dark-bg p-4 text-white md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-dark-border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <FaChartBar className="text-2xl text-cyan-300" />
                <h1 className="text-2xl font-bold md:text-3xl">
                  Investigator Dashboard
                </h1>
              </div>
              <p className="max-w-2xl text-sm text-gray-300 md:text-base">
                Centralized visibility for call intelligence, facial match
                analysis, field coverage, and crime hotspot pressure.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <FaRegClock className="text-xs" />
                Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "-"}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadDashboardData}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
              >
                <FaSyncAlt /> Refresh Data
              </button>
              <Link
                to="/investigator/call-analysis"
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                <FaNetworkWired /> Start Analysis
              </Link>
            </div>
          </div>

          <div className={`mt-5 rounded-xl border p-4 ${riskTone.panelClass}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-100">Operational Risk Index</p>
              <p className={`text-sm font-semibold ${riskTone.textClass}`}>
                {riskTone.label} Risk
              </p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full rounded-full transition-all ${riskTone.barClass} ${toWidthClass(
                  riskScore,
                )}`}
              />
            </div>
            <p className="mt-2 text-xs text-gray-300">
              Score: {riskScore}/100 based on inactive officers and priority
              hotspot share.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dark-border bg-dark-panel">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-300" />
              Loading investigator metrics...
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.title}
                  className={`rounded-xl border p-4 ${card.panelClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-300">
                        {card.title}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {card.value}
                      </p>
                      <p className="mt-1 text-sm text-gray-300">
                        {card.subtitle}
                      </p>
                    </div>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-dark-border bg-dark-panel p-5 xl:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Crime Signal Breakdown
                  </h2>
                  <p className="text-xs text-gray-400">
                    Top categories by hotspot count
                  </p>
                </div>

                {crimeStats.sortedTypes.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No hotspot data available yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {crimeStats.sortedTypes
                      .slice(0, 6)
                      .map(([crimeType, count]) => {
                        const ratio =
                          crimeStats.total > 0
                            ? Math.round((count / crimeStats.total) * 100)
                            : 0;

                        return (
                          <div key={crimeType}>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <p className="font-medium text-gray-200">
                                {formatCrimeType(crimeType)}
                              </p>
                              <p className="text-gray-300">
                                {count} ({ratio}%)
                              </p>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 ${toWidthClass(
                                  ratio,
                                )}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-dark-border bg-dark-panel p-5">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Priority Brief
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg border border-slate-600/50 bg-slate-800/60 p-3">
                    <p className="text-gray-400">Most frequent hotspot</p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {topCrimeType
                        ? `${formatCrimeType(topCrimeType[0])} (${topCrimeType[1]})`
                        : "No data"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-600/50 bg-slate-800/60 p-3">
                    <p className="text-gray-400">Officer readiness</p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {officerStats.readiness}% active coverage
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-600/50 bg-slate-800/60 p-3">
                    <p className="text-gray-400">Immediate attention</p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {crimeStats.priorityHotspots} high-priority hotspot
                      {crimeStats.priorityHotspots === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-border bg-dark-panel p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Investigation Modules
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {moduleCards.map((module) => (
                  <div
                    key={module.title}
                    className="rounded-xl border border-dark-border-light bg-slate-900/60 p-4 transition hover:border-cyan-400/40"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-300">
                        {module.icon}
                        <h3 className="text-base font-semibold text-white">
                          {module.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                        Ready
                      </span>
                    </div>

                    <p className="text-sm text-gray-300">
                      {module.description}
                    </p>
                    <p className="mt-3 text-xs text-gray-400">
                      {module.footNote}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Open module to continue
                      </span>
                      <Link
                        to={module.route}
                        className="inline-flex items-center gap-2 rounded-md border border-cyan-400/30 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
                      >
                        <FaSearch className="text-[10px]" /> Open
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-dark-border bg-dark-panel p-5">
              <h2 className="mb-3 text-lg font-semibold text-white">
                Important Notes
              </h2>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-300 md:grid-cols-3">
                <div className="rounded-lg border border-dark-border-light bg-slate-900/60 p-3">
                  <p className="font-semibold text-cyan-300">Call Analysis</p>
                  <p className="mt-1">
                    Supports PDF batch analysis with risk scoring, common
                    contacts, and graph-level investigation exports.
                  </p>
                </div>
                <div className="rounded-lg border border-dark-border-light bg-slate-900/60 p-3">
                  <p className="font-semibold text-cyan-300">
                    Facial Recognition
                  </p>
                  <p className="mt-1">
                    Best results are achieved with clear face images under 5MB
                    and threshold tuning based on case urgency.
                  </p>
                </div>
                <div className="rounded-lg border border-dark-border-light bg-slate-900/60 p-3">
                  <p className="font-semibold text-cyan-300">
                    Field Operations
                  </p>
                  <p className="mt-1">
                    Combine officer live status with hotspot intensity before
                    assigning patrol plans or issuing immediate alerts.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InvestigatorDashboard;
