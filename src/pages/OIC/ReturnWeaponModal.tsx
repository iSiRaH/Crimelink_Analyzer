import React, { useState, useEffect } from "react";
import { returnWeapon, getAllOfficers } from "../../api/weaponApi";
import type { OfficerDTO } from "../../types/weapon";

type Weapon = {
  type: string;
  serial: string;
  issuedDate: string;
  dueBack: string;
  assignedTo: string;      // officer name (display fallback)
  assignedToId?: number;   // officer id — used to look up real data from backend
  issuedBulletType?: string;
  issuedMagazines?: number;
};

type Props = {
  weapon: Weapon;
  onClose: () => void;
};

export default function ReturnWeaponModal({ weapon, onClose }: Props) {
  const [officers, setOfficers] = useState<OfficerDTO[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [selectedReceivedById, setSelectedReceivedById] = useState<number | null>(null);
  const [returnNote, setReturnNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [returnedMagazines, setReturnedMagazines] = useState("");
  const [usedBullets, setUsedBullets] = useState("");
  const [bulletCondition, setBulletCondition] = useState("good");
  const [bulletUsageReason, setBulletUsageReason] = useState("");

  const issuedBulletType = weapon.issuedBulletType || "";
  const issuedMagazinesCount = weapon.issuedMagazines || 0;

  useEffect(() => {
    loadOfficers();
    setReturnedMagazines(issuedMagazinesCount.toString());
  }, []);

  const loadOfficers = async () => {
    try {
      const response = await getAllOfficers();
      setOfficers(response.data);
    } catch (err) {
      console.error("Failed to load officers:", err);
      alert("Failed to load officers. Please try again.");
    } finally {
      setLoadingOfficers(false);
    }
  };

  // Receiving officer — selected by user from dropdown
  const selectedReceivedBy = officers.find((o) => o.id === selectedReceivedById);

  // Issued-to officer — found from the same officers list by assignedToId
  const issuedToOfficer: OfficerDTO | undefined = weapon.assignedToId
    ? officers.find((o) => o.id === weapon.assignedToId)
    : undefined;

  // Displayed fields: prefer backend data, fall back gracefully
  const issuedToName      = issuedToOfficer?.name                       ?? weapon.assignedTo;
  const issuedToServiceNo = issuedToOfficer?.serviceId                  ?? "—";
  // OfficerDTO uses `role` for the rank/role field; some mappings also expose `rank`
  const issuedToRank      = issuedToOfficer?.rank ?? issuedToOfficer?.role ?? "—";

  const now = new Date();
  const returnDate = now.toISOString().split("T")[0];
  const returnTime = now.toTimeString().slice(0, 5);

  const overdueDays = Math.max(
    Math.floor(
      (new Date(returnDate).getTime() - new Date(weapon.dueBack).getTime()) / (1000 * 60 * 60 * 24)
    ),
    0
  );

  const returnedCount = returnedMagazines ? Number(returnedMagazines) : 0;
  const missingMagazines = issuedMagazinesCount - returnedCount;
  const bulletsUsed = usedBullets && Number(usedBullets) > 0;

  const handleReturn = async () => {
    if (!selectedReceivedById) { alert("Please select receiving officer"); return; }
    if (bulletsUsed && !bulletUsageReason.trim()) { alert("Please provide a reason for bullet usage"); return; }
    if (!confirmed) { alert("Please confirm the details"); return; }

    setLoading(true);
    try {
      const payload = {
        weaponSerial: weapon.serial,
        receivedByUserId: selectedReceivedById,
        returnNote: returnNote || "Returned",
        returnedMagazines: returnedMagazines ? Number(returnedMagazines) : undefined,
        usedBullets: usedBullets ? Number(usedBullets) : undefined,
        bulletCondition: bulletCondition || undefined,
        bulletRemarks: bulletUsageReason || undefined,
      };
      await returnWeapon(payload);
      alert("Weapon and bullets returned successfully");
      onClose();
    } catch (err: any) {
      console.error("Failed to return weapon:", err);
      alert(err?.response?.data?.error || err?.message || "Failed to return weapon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,8,20,0.85)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 50, padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "900px", maxHeight: "95vh",
        overflowY: "auto", overflowX: "hidden",
        /* hide scrollbar cross-browser */
        scrollbarWidth: "none" as any,
        msOverflowStyle: "none" as any,
        background: "#050d1a", borderRadius: "4px",
        border: "1px solid #0f2744",
        boxShadow: "0 0 0 1px #0a1f3d, 0 32px 64px rgba(0,0,0,0.8)",
      }}>

        {/* HEADER */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "#060f1e", borderBottom: "2px solid #0e3a6e",
          padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ width: "8px", height: "28px", background: "#1d6fe8", flexShrink: 0 }} />
              <h2 style={{
                color: "#e8f0fe", fontSize: "20px", fontWeight: 700,
                letterSpacing: "0.08em", margin: 0, textTransform: "uppercase",
              }}>
                Return Weapon & Ammunition
              </h2>
            </div>
            <p style={{
              color: "#4a6fa5", fontSize: "13px", margin: 0,
              marginLeft: "18px", letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              Tactical Equipment Return Protocol
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid #0e3a6e", color: "#4a6fa5",
              width: "32px", height: "32px", cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "2px", transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#0e3a6e";
              (e.currentTarget as HTMLButtonElement).style.color = "#e8f0fe";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#4a6fa5";
            }}
          >✕</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* OVERDUE BANNER */}
          {overdueDays > 0 && (
            <div style={{
              background: "rgba(120,53,15,0.15)", border: "1px solid #78350f",
              borderLeft: "4px solid #f59e0b",
              padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px",
            }}>
              <span style={{ fontSize: "16px" }}>⚠</span>
              <div>
                <p style={{
                  color: "#fbbf24", fontSize: "14px", fontWeight: 700,
                  margin: 0, letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  Overdue Return
                </p>
                <p style={{ color: "#d97706", fontSize: "13px", margin: "2px 0 0 0" }}>
                  This weapon is overdue by <strong>{overdueDays}</strong> day(s)
                </p>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* WEAPON INFO */}
              <Section label="Weapon Information">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Field label="Weapon Type" value={weapon.type} />
                  <Field label="Serial Number" value={weapon.serial} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                  <Field label="Issued Date" value={weapon.issuedDate} />
                  <Field label="Due Back" value={weapon.dueBack} highlight={overdueDays > 0} />
                </div>
                <div style={{ marginTop: "12px" }}>
                  <SectionLabel>Return Timestamp</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                    <ReadonlyInput label="Date" value={returnDate} />
                    <ReadonlyInput label="Time" value={returnTime} />
                  </div>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <label style={labelStyle}>Return Notes</label>
                  <textarea
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    placeholder="Weapon condition, damage, observations..."
                    rows={3}
                    style={{ ...inputStyle, marginTop: "6px", resize: "vertical", minHeight: "72px" }}
                  />
                </div>
              </Section>

              {/* PERSONNEL */}
              <Section label="Personnel Information">
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>Receiving Officer *</label>
                  <select
                    value={selectedReceivedById || ""}
                    onChange={(e) => setSelectedReceivedById(Number(e.target.value))}
                    disabled={loadingOfficers}
                    style={{ ...inputStyle, marginTop: "6px" }}
                  >
                    <option value="">{loadingOfficers ? "Loading..." : "— Select Officer —"}</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.serviceId} — {o.name} ({o.rank ?? o.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* Issued To — resolved from backend */}
                  <PersonnelCard
                    label="Issued To"
                    name={issuedToName}
                    role={issuedToRank}
                    serviceId={issuedToServiceNo}
                    loading={loadingOfficers && Boolean(weapon.assignedToId)}
                  />
                  {/* Received By — selected from dropdown */}
                  <PersonnelCard
                    label="Received By"
                    name={selectedReceivedBy?.name ?? "—"}
                    role={selectedReceivedBy?.rank ?? selectedReceivedBy?.role ?? "—"}
                    serviceId={selectedReceivedBy?.serviceId ?? "—"}
                    placeholder={!selectedReceivedById}
                  />
                </div>
              </Section>
            </div>

            {/* RIGHT COLUMN — AMMUNITION */}
            <div>
              <Section label="Ammunition Return">

                {/* ISSUED AMMO INFO */}
                <div style={{
                  background: "#0a1f3d", border: "1px solid #0e3a6e",
                  borderLeft: "3px solid #1d6fe8", padding: "12px 14px", marginBottom: "16px",
                }}>
                  <p style={{
                    color: "#4a6fa5", fontSize: "10px", letterSpacing: "0.14em",
                    textTransform: "uppercase", margin: "0 0 10px 0", fontWeight: 600,
                  }}>
                    Originally Issued
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <p style={{ color: "#2d5a8e", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px 0" }}>
                        Bullet Type
                      </p>
                      <p style={{ color: "#c8d8ee", fontSize: "15px", fontWeight: 600, margin: 0 }}>{issuedBulletType}</p>
                    </div>
                    <div>
                      <p style={{ color: "#2d5a8e", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px 0" }}>
                        Magazines
                      </p>
                      <p style={{ color: "#1d6fe8", fontSize: "20px", fontWeight: 700, margin: 0 }}>{issuedMagazinesCount}</p>
                    </div>
                  </div>
                </div>

                {/* RETURN INPUTS */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Magazines Returned *</label>
                    <input
                      type="number"
                      value={returnedMagazines}
                      onChange={(e) => setReturnedMagazines(e.target.value)}
                      placeholder="0"
                      min="0"
                      max={issuedMagazinesCount}
                      style={{
                        ...inputStyle,
                        marginTop: "6px",
                        borderColor: missingMagazines > 0 ? "#dc2626" : "#0e3a6e",
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Bullets Fired</label>
                    <input
                      type="number"
                      value={usedBullets}
                      onChange={(e) => setUsedBullets(e.target.value)}
                      placeholder="0"
                      min="0"
                      style={{ ...inputStyle, marginTop: "6px" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={labelStyle}>Magazine Condition</label>
                  <select
                    value={bulletCondition}
                    onChange={(e) => setBulletCondition(e.target.value)}
                    style={{ ...inputStyle, marginTop: "6px" }}
                  >
                    <option value="good">Good Condition</option>
                    <option value="fair">Fair Condition</option>
                    <option value="damaged">Damaged</option>
                    <option value="lost">Lost / Missing</option>
                  </select>
                </div>

                {/* STATUS INDICATORS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                  {missingMagazines > 0 && (
                    <StatusBadge
                      type="error"
                      title="Missing Magazines"
                      message={`${missingMagazines} of ${issuedMagazinesCount} magazine(s) not returned`}
                    />
                  )}
                  {bulletsUsed && (
                    <StatusBadge
                      type="info"
                      title="Rounds Discharged"
                      message={`${usedBullets} round(s) reported fired`}
                    />
                  )}
                  {!missingMagazines && returnedMagazines && (
                    <StatusBadge
                      type="success"
                      title="All Magazines Accounted"
                      message={`${issuedMagazinesCount} of ${issuedMagazinesCount} returned`}
                    />
                  )}
                </div>

                {/* DISCHARGE JUSTIFICATION */}
                {bulletsUsed && (
                  <div style={{
                    marginTop: "14px", border: "1px solid #1d3a6e",
                    borderLeft: "3px solid #1d6fe8", background: "#070f1c",
                  }}>
                    <div style={{
                      padding: "8px 14px", borderBottom: "1px solid #0e3a6e",
                      background: "#0a1e38",
                    }}>
                      <p style={{
                        margin: 0, color: "#4a8fe8", fontSize: "12px",
                        letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700,
                      }}>
                        ⚠ Discharge Justification Required *
                      </p>
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <textarea
                        value={bulletUsageReason}
                        onChange={(e) => setBulletUsageReason(e.target.value)}
                        placeholder="Explain reason for bullet discharge (training, duty, incident...)..."
                        rows={4}
                        style={{ ...inputStyle, resize: "vertical", minHeight: "88px" }}
                      />
                      <p style={{ color: "#2d5a8e", fontSize: "12px", margin: "6px 0 0 0", letterSpacing: "0.06em" }}>
                        * Required when rounds have been discharged
                      </p>
                    </div>
                  </div>
                )}
              </Section>
            </div>
          </div>

          {/* CONFIRMATION */}
          <div style={{ background: "#060f1e", border: "1px solid #0e3a6e", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
              <div
                onClick={() => setConfirmed(!confirmed)}
                style={{
                  width: "18px", height: "18px",
                  border: `2px solid ${confirmed ? "#1d6fe8" : "#1a3a5c"}`,
                  background: confirmed ? "#1d6fe8" : "transparent",
                  cursor: "pointer", flexShrink: 0, marginTop: "1px",
                  display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px",
                }}
              >
                {confirmed && <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>✓</span>}
              </div>
              <label
                onClick={() => setConfirmed(!confirmed)}
                style={{ color: "#7a9cc8", fontSize: "14px", cursor: "pointer", lineHeight: "1.6", letterSpacing: "0.04em" }}
              >
                I confirm all information is accurate. I verify the weapon condition, ammunition count, and return details are correct to the best of my knowledge.
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "12px 24px", background: "transparent",
                  border: "1px solid #0e3a6e", color: "#4a6fa5", cursor: "pointer",
                  fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", borderRadius: "2px", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0a1f3d"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={loading || !confirmed}
                style={{
                  flex: 1, padding: "12px 24px",
                  background: loading || !confirmed ? "#0a1f3d" : "#0d3d8c",
                  border: `1px solid ${loading || !confirmed ? "#0e3a6e" : "#1d6fe8"}`,
                  color: loading || !confirmed ? "#253d5c" : "#e8f0fe",
                  cursor: loading || !confirmed ? "not-allowed" : "pointer",
                  fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", borderRadius: "2px", transition: "all 0.15s",
                }}
              >
                {loading ? "Processing..." : "Confirm Return"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar for webkit browsers via inline style injection */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* ─── Shared styles ──────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  color: "#4a6fa5", fontSize: "12px", letterSpacing: "0.14em",
  textTransform: "uppercase", display: "block", fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#070f1c", border: "1px solid #0e3a6e",
  color: "#c8d8ee", padding: "9px 12px", fontSize: "15px",
  borderRadius: "2px", outline: "none", boxSizing: "border-box",
};

/* ─── Sub-components ─────────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #0e3a6e", background: "#060f1e" }}>
      <div style={{
        padding: "10px 16px", background: "#0a1e38",
        borderBottom: "1px solid #0e3a6e",
      }}>
        <span style={{ color: "#c8d8ee", fontSize: "13px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      color: "#2d5a8e", fontSize: "12px", letterSpacing: "0.14em",
      textTransform: "uppercase", fontWeight: 600,
      borderBottom: "1px solid #0a1e38", paddingBottom: "4px",
    }}>{children}</div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ background: "#070f1c", border: "1px solid #0a1e38", padding: "10px 12px" }}>
      <p style={{ color: "#2d5a8e", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0, marginBottom: "4px" }}>
        {label}
      </p>
      <p style={{ color: highlight ? "#f59e0b" : "#c8d8ee", fontSize: "15px", fontWeight: 600, margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

function ReadonlyInput({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: "#2d5a8e", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0, marginBottom: "4px" }}>
        {label}
      </p>
      <input
        value={value}
        readOnly
        style={{ ...inputStyle, background: "#040a14", color: "#3d6899" }}
      />
    </div>
  );
}

function PersonnelCard({
  label, name, role, serviceId, placeholder, loading,
}: {
  label: string;
  name: string;
  role: string;
  serviceId: string;
  placeholder?: boolean;
  loading?: boolean;
}) {
  return (
    <div style={{
      background: "#070f1c",
      border: `1px solid ${placeholder ? "#0a1e38" : "#0e3a6e"}`,
      borderLeft: `3px solid ${placeholder ? "#0a1e38" : "#0d3d8c"}`,
      padding: "10px 12px",
    }}>
      <p style={{
        color: "#2d5a8e", fontSize: "12px", letterSpacing: "0.1em",
        textTransform: "uppercase", margin: "0 0 6px 0",
      }}>
        {label}
      </p>
      {loading ? (
        <p style={{ color: "#1a3a5c", fontSize: "14px", margin: 0 }}>Loading...</p>
      ) : (
        <>
          <p style={{
            color: placeholder ? "#1a3a5c" : "#c8d8ee",
            fontSize: "15px", fontWeight: 600, margin: 0,
          }}>
            {name}
          </p>
          <p style={{ color: "#4a6fa5", fontSize: "13px", margin: "4px 0 0 0" }}>
            {role}
          </p>
          <p style={{ color: "#2d5a8e", fontSize: "13px", margin: "2px 0 0 0", letterSpacing: "0.06em" }}>
            {serviceId}
          </p>
        </>
      )}
    </div>
  );
}

function StatusBadge({ type, title, message }: { type: "error" | "info" | "success"; title: string; message: string }) {
  const configs = {
    error:   { bg: "rgba(127,29,29,0.15)", border: "#7f1d1d", accent: "#dc2626", titleColor: "#f87171", msgColor: "#fca5a5" },
    info:    { bg: "rgba(30,58,138,0.2)",  border: "#1e3a8a", accent: "#1d6fe8", titleColor: "#60a5fa", msgColor: "#93c5fd" },
    success: { bg: "rgba(20,83,45,0.15)",  border: "#14532d", accent: "#16a34a", titleColor: "#4ade80", msgColor: "#86efac" },
  };
  const c = configs[type];
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.accent}`, padding: "10px 14px",
    }}>
      <p style={{ color: c.titleColor, fontSize: "13px", fontWeight: 700, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {title}
      </p>
      <p style={{ color: c.msgColor, fontSize: "13px", margin: "3px 0 0 0" }}>{message}</p>
    </div>
  );
}