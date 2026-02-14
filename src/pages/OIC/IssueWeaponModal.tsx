import React, { useEffect, useMemo, useState } from "react";
import { issueWeapon } from "../../api/weaponApi";
import api from "../../services/api";
import { getAllBulletsWithDetails } from "../../api/BulletApi";
import type { OfficerDTO } from "../../types/weapon";

/** Must match backend BulletResponseDTO fields */
type BulletStock = {
  bulletId: number;
  bulletType: string;
  numberOfMagazines: number;
  remarks?: string;
};

interface Props {
  weapon: {
    type: string;
    serial: string;
  };
  onClose: () => void;
}

const IssueWeaponModal: React.FC<Props> = ({ weapon, onClose }) => {
  const [officers, setOfficers] = useState<OfficerDTO[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);

  const [bullets, setBullets] = useState<BulletStock[]>([]);
  const [loadingBullets, setLoadingBullets] = useState(true);

  const [selectedIssuedToId, setSelectedIssuedToId] = useState<number | "">("");
  const [selectedHandedOverById, setSelectedHandedOverById] = useState<number | "">("");

  const [dueDate, setDueDate] = useState("");
  const [issueNote, setIssueNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [bulletType, setBulletType] = useState<string>("");
  const [numberOfMagazines, setNumberOfMagazines] = useState<string>("");
  const [bulletRemarks, setBulletRemarks] = useState<string>("");

  const selectedIssuedTo = useMemo(
    () => officers.find((o) => o.id === (typeof selectedIssuedToId === "number" ? selectedIssuedToId : -1)),
    [officers, selectedIssuedToId]
  );

  const selectedHandedOverBy = useMemo(
    () => officers.find((o) => o.id === (typeof selectedHandedOverById === "number" ? selectedHandedOverById : -1)),
    [officers, selectedHandedOverById]
  );

  const selectedBullet = useMemo(
    () => bullets.find((b) => b.bulletType === bulletType),
    [bullets, bulletType]
  );

  const bulletsWereSelected = Boolean(bulletType);
  const enteredQty = numberOfMagazines ? Number(numberOfMagazines) : 0;
  const availableStock = selectedBullet?.numberOfMagazines ?? 0;
  const exceedsStock = bulletsWereSelected && Number.isFinite(enteredQty) && enteredQty > availableStock;
  const invalidQty = bulletsWereSelected && (!numberOfMagazines || Number.isNaN(enteredQty) || enteredQty <= 0);

  const now = new Date();
  const issuedDate = now.toISOString().split("T")[0];
  const issuedTime = now.toTimeString().slice(0, 5);

  useEffect(() => {
    loadOfficers();
    loadBullets();
  }, []);

  const loadOfficers = async () => {
    try {
      const res = await api.get("/users/all-officers");
      const mappedOfficers: OfficerDTO[] = res.data.map((u: any) => ({
        id: u.userId,
        name: u.name,
        serviceId: u.badgeNo,
        rank: u.role,
        role: u.role,
        status: u.status,
      }));
      setOfficers(mappedOfficers);
    } catch (e) {
      console.error(e);
      alert("Failed to load officers");
    } finally {
      setLoadingOfficers(false);
    }
  };

  const loadBullets = async () => {
    try {
      const res = await getAllBulletsWithDetails();
      setBullets(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load bullets inventory");
    } finally {
      setLoadingBullets(false);
    }
  };

  const handleReset = () => {
    setSelectedIssuedToId("");
    setSelectedHandedOverById("");
    setDueDate("");
    setIssueNote("");
    setBulletType("");
    setNumberOfMagazines("");
    setBulletRemarks("");
    setConfirmed(false);
  };

  const handleIssue = async () => {
    if (selectedIssuedToId === "" || selectedHandedOverById === "") {
      alert("Please select both officers");
      return;
    }
    if (!dueDate) {
      alert("Please select due date");
      return;
    }
    if (!confirmed) {
      alert("Please confirm the details");
      return;
    }
    if (bulletsWereSelected) {
      if (!selectedBullet) { alert("Selected bullet type not found"); return; }
      if (invalidQty) { alert("Enter a valid number of magazines (must be > 0)"); return; }
      if (exceedsStock) { alert(`Cannot issue ${enteredQty}. Only ${availableStock} magazines available.`); return; }
    }

    setLoading(true);
    try {
      await issueWeapon({
        weaponSerial: weapon.serial,
        issuedToId: selectedIssuedToId,
        handedOverById: selectedHandedOverById,
        dueDate,
        issueNote,
        bulletType: bulletsWereSelected ? bulletType : undefined,
        numberOfMagazines: bulletsWereSelected ? enteredQty : undefined,
        bulletRemarks: bulletsWereSelected ? (bulletRemarks.trim() || undefined) : undefined,
      });
      await loadBullets();
      alert("Weapon issued successfully");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || "Failed to issue weapon");
    } finally {
      setLoading(false);
    }
  };

  const disableIssueButton =
    loading || !confirmed || selectedIssuedToId === "" || selectedHandedOverById === "" || !dueDate ||
    (bulletsWereSelected && (invalidQty || exceedsStock));

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
                Issue Weapon & Ammunition
              </h2>
            </div>
            <p style={{
              color: "#4a6fa5", fontSize: "13px", margin: 0,
              marginLeft: "18px", letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              Tactical Equipment Issuance Protocol
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid #0e3a6e", color: "#4a6fa5",
              width: "32px", height: "32px", cursor: "pointer", fontSize: "16px",
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* WEAPON INFO */}
              <Section label="Weapon Information">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Field label="Weapon Type" value={weapon.type} />
                  <Field label="Serial Number" value={weapon.serial} />
                </div>

                <div style={{ marginTop: "12px" }}>
                  <SectionLabel>Issue Timestamp</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                    <ReadonlyInput label="Date" value={issuedDate} />
                    <ReadonlyInput label="Time" value={issuedTime} />
                  </div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={labelStyle}>Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ ...inputStyle, marginTop: "6px", colorScheme: "dark" } as React.CSSProperties}
                  />
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={labelStyle}>Issue Note</label>
                  <textarea
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="Enter issue note..."
                    rows={3}
                    style={{ ...inputStyle, marginTop: "6px", resize: "vertical", minHeight: "72px" }}
                  />
                </div>
              </Section>

              {/* PERSONNEL */}
              <Section label="Personnel Assignment">
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>Issued To *</label>
                  <select
                    value={selectedIssuedToId}
                    onChange={(e) => setSelectedIssuedToId(Number(e.target.value))}
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
                  {selectedIssuedTo && (
                    <OfficerCard
                      name={selectedIssuedTo.name}
                      role={selectedIssuedTo.rank ?? selectedIssuedTo.role ?? "—"}
                      serviceId={selectedIssuedTo.serviceId ?? "—"}
                    />
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Handed Over By *</label>
                  <select
                    value={selectedHandedOverById}
                    onChange={(e) => setSelectedHandedOverById(Number(e.target.value))}
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
                  {selectedHandedOverBy && (
                    <OfficerCard
                      name={selectedHandedOverBy.name}
                      role={selectedHandedOverBy.rank ?? selectedHandedOverBy.role ?? "—"}
                      serviceId={selectedHandedOverBy.serviceId ?? "—"}
                    />
                  )}
                </div>
              </Section>
            </div>

            {/* RIGHT COLUMN — AMMUNITION */}
            <div>
              <Section label="Ammunition Issuance">
                <div>
                  <label style={labelStyle}>Bullet Type</label>
                  <select
                    value={bulletType}
                    onChange={(e) => {
                      setBulletType(e.target.value);
                      setNumberOfMagazines("");
                      setBulletRemarks("");
                    }}
                    disabled={loadingBullets}
                    style={{ ...inputStyle, marginTop: "6px" }}
                  >
                    <option value="">{loadingBullets ? "Loading..." : "— No Bullets —"}</option>
                    {bullets.map((b) => (
                      <option key={b.bulletId} value={b.bulletType}>
                        {b.bulletType}  [Stock: {b.numberOfMagazines}]
                      </option>
                    ))}
                  </select>
                </div>

                {bulletType && (
                  <>
                    <div style={{
                      marginTop: "12px", padding: "10px 14px",
                      background: "#0a1f3d", border: "1px solid #0e3a6e",
                      borderLeft: "3px solid #1d6fe8",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <span style={{ color: "#4a6fa5", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        Available Stock
                      </span>
                      <span style={{ color: "#1d6fe8", fontSize: "20px", fontWeight: 700 }}>{availableStock}</span>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <label style={labelStyle}>Magazines to Issue</label>
                      <input
                        type="number"
                        value={numberOfMagazines}
                        onChange={(e) => setNumberOfMagazines(e.target.value)}
                        min={1}
                        placeholder="0"
                        style={{
                          ...inputStyle,
                          marginTop: "6px",
                          borderColor: exceedsStock ? "#dc2626" : "#0e3a6e",
                          background: exceedsStock ? "rgba(220,38,38,0.08)" : "#070f1c",
                        }}
                      />
                      {invalidQty && <p style={errorStyle}>Must be greater than 0</p>}
                      {exceedsStock && <p style={errorStyle}>Exceeds stock — only {availableStock} available</p>}
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <label style={labelStyle}>Bullet Note</label>
                      <textarea
                        value={bulletRemarks}
                        onChange={(e) => setBulletRemarks(e.target.value)}
                        rows={4}
                        placeholder="Training / duty / batch info..."
                        style={{ ...inputStyle, marginTop: "6px", resize: "vertical", minHeight: "88px" }}
                      />
                    </div>
                  </>
                )}

                {!bulletType && (
                  <div style={{
                    marginTop: "12px", padding: "32px 16px", textAlign: "center",
                    border: "1px dashed #0e3a6e", borderRadius: "2px",
                  }}>
                    <p style={{ color: "#253d5c", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                      No ammunition selected
                    </p>
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
                I confirm all information is accurate. I authorize the issuance of this weapon and ammunition in accordance with departmental protocols.
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: "12px 24px", background: "transparent",
                  border: "1px solid #0e3a6e", color: "#4a6fa5", cursor: "pointer",
                  fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", borderRadius: "2px", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0a1f3d"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                Reset
              </button>
              <button
                onClick={handleIssue}
                disabled={disableIssueButton}
                style={{
                  flex: 1, padding: "12px 24px",
                  background: disableIssueButton ? "#0a1f3d" : "#0d3d8c",
                  border: `1px solid ${disableIssueButton ? "#0e3a6e" : "#1d6fe8"}`,
                  color: disableIssueButton ? "#253d5c" : "#e8f0fe",
                  cursor: disableIssueButton ? "not-allowed" : "pointer",
                  fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", borderRadius: "2px", transition: "all 0.15s",
                }}
              >
                {loading ? "Processing..." : "Authorize Issue"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar for webkit browsers */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

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

const errorStyle: React.CSSProperties = {
  color: "#f87171", fontSize: "13px", marginTop: "4px", letterSpacing: "0.04em",
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#070f1c", border: "1px solid #0a1e38", padding: "10px 12px" }}>
      <p style={{ color: "#2d5a8e", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0, marginBottom: "4px" }}>
        {label}
      </p>
      <p style={{ color: "#c8d8ee", fontSize: "15px", fontWeight: 600, margin: 0 }}>{value}</p>
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

function OfficerCard({ name, role, serviceId }: { name: string; role: string; serviceId: string }) {
  return (
    <div style={{
      marginTop: "8px", padding: "10px 14px",
      background: "#070f1c", border: "1px solid #0e3a6e",
      borderLeft: "3px solid #0d3d8c",
    }}>
      <p style={{ color: "#c8d8ee", fontSize: "15px", fontWeight: 600, margin: 0 }}>{name}</p>
      <p style={{ color: "#4a6fa5", fontSize: "13px", margin: "4px 0 0 0" }}>{role}</p>
      <p style={{ color: "#2d5a8e", fontSize: "13px", margin: "2px 0 0 0", letterSpacing: "0.06em" }}>{serviceId}</p>
    </div>
  );
}

export default IssueWeaponModal;