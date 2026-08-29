import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ---------- Design tokens ---------- */
const C = {
  bg: "#0D0D0D",
  panel: "#161616",
  card: "#1A1A1A",
  line: "#2A2A2A",
  gold: "#FFC107",
  blue: "#0A84FF",
  white: "#FFFFFF",
  mute: "#9A9A9A",
  faint: "#6B6B6B",
};

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";

const COMMISSION_RATE = 0.1;

function ugx(n) {
  return "UGX " + Math.round(n).toLocaleString("en-US");
}

/* ---------- Small building blocks ---------- */
function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 16px" }}>
      <div style={{ width: 32 }}>
        {onBack && (
          <button onClick={onBack} style={iconBtnStyle}>
            â†
          </button>
        )}
      </div>
      <div style={{ color: C.white, fontWeight: 600, fontSize: 16 }}>{title}</div>
      <div style={{ width: 32, textAlign: "right" }}>{right}</div>
    </div>
  );
}

const iconBtnStyle = { background: "none", border: "none", color: C.white, fontSize: 18, cursor: "pointer", padding: 4 };

function Star({ filled }) {
  return <span style={{ color: filled ? C.gold : C.line, fontSize: 12 }}>â˜…</span>;
}

function Rating({ value = 5, count = 0 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= Math.round(value)} />
      ))}
      <span style={{ color: C.mute }}>
        {value} {count ? `(${count})` : ""}
      </span>
    </span>
  );
}

function PrimaryButton({ children, onClick, style, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#5a4a10" : C.gold,
        color: "#141414",
        border: "none",
        borderRadius: 12,
        padding: "14px 18px",
        fontWeight: 700,
        fontSize: 14.5,
        cursor: disabled ? "default" : "pointer",
        width: "100%",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "transparent", color: C.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 18px", fontWeight: 600, fontSize: 14.5, cursor: "pointer", width: "100%", ...style }}
    >
      {children}
    </button>
  );
}

function BottomNav({ active, onNav, role }) {
  const items = [
    { key: "home", label: "Home", icon: "ðŸ " },
    { key: "bookings", label: "Bookings", icon: "ðŸ“…" },
    { key: "post", label: role === "producer" ? "Post a Gig" : "Browse", icon: "âž•", center: true },
    { key: "messages", label: "Messages", icon: "ðŸ’¬" },
    { key: "profile", label: "Profile", icon: "ðŸ‘¤" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${C.line}`, background: "#0A0A0A", padding: "10px 14px calc(10px + env(safe-area-inset-bottom, 0px))" }}>
      {items.map((it) =>
        it.center ? (
          <button key={it.key} onClick={() => onNav(it.key)} style={{ background: C.gold, border: "none", width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginTop: -22, boxShadow: "0 4px 14px rgba(255,193,7,0.4)", cursor: "pointer", flex: "0 0 auto" }}>
            {it.icon}
          </button>
        ) : (
          <button key={it.key} onClick={() => onNav(it.key)} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active === it.key ? C.gold : C.faint, fontSize: 10, fontWeight: 600, cursor: "pointer", flex: 1 }}>
            <span style={{ fontSize: 17 }}>{it.icon}</span>
            {it.label}
          </button>
        )
      )}
    </div>
  );
}

function Avatar({ emoji = "ðŸŽ§", size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.card}, #262626)`, border: `1.5px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, flexShrink: 0 }}>
      {emoji}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: C.mute, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", color: C.white, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }}
      />
    </div>
  );
}

function ErrorText({ children }) {
  if (!children) return null;
  return <div style={{ color: "#FF6B6B", fontSize: 12, marginBottom: 12 }}>{children}</div>;
}

/* ---------- Auth screens ---------- */

function Splash({ go }) {
  return (
    <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: 96, height: 96, borderRadius: 24, background: `linear-gradient(135deg, ${C.gold}, #e0a800)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800, color: "#141414", marginBottom: 22 }}>
          AV
        </div>
        <div style={{ color: C.white, fontWeight: 800, fontSize: 24, letterSpacing: 1 }}>A.V GIGZ</div>
        <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginTop: 6 }}>BOOK. CREATE. GET PAID.</div>
        <div style={{ color: C.mute, fontSize: 14, marginTop: 26, lineHeight: 1.6, maxWidth: 260 }}>
          The marketplace connecting Uganda's music producers and artists.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <PrimaryButton onClick={() => go("roleSelect")}>Get Started</PrimaryButton>
        <GhostButton onClick={() => go("login")}>Log in</GhostButton>
        <div style={{ textAlign: "center", color: C.faint, fontSize: 11, marginTop: 4 }}>ðŸ”’ Secure. Safe. Trusted.</div>
      </div>
    </div>
  );
}

function RoleSelect({ go, setRole }) {
  return (
    <div style={{ padding: "50px 24px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ color: C.white, fontWeight: 800, fontSize: 20, marginBottom: 6 }}>How will you use AV Gigz?</div>
      <div style={{ color: C.mute, fontSize: 13, marginBottom: 28 }}>Each role gets its own platform and tools.</div>
      {[
        { key: "producer", icon: "ðŸŽšï¸", title: "I'm a Producer", desc: "List your services & links, receive bookings, get paid." },
        { key: "artist", icon: "ðŸŽ¤", title: "I'm an Artist", desc: "Browse producers, request services, chat & book sessions." },
      ].map((r) => (
        <button
          key={r.key}
          onClick={() => {
            setRole(r.key);
            go("signup");
          }}
          style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 14, cursor: "pointer", textAlign: "left" }}
        >
          <div style={{ fontSize: 30 }}>{r.icon}</div>
          <div>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>{r.title}</div>
            <div style={{ color: C.mute, fontSize: 12, marginTop: 3 }}>{r.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function SignUp({ go, role, onSignedUp }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        role,
        name,
      });
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    onSignedUp({ id: userId, role, name, bio: "", city: "Kampala, Uganda", portfolio_link: "" });
  };

  return (
    <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
        {role === "producer" ? "PRODUCER SIGN UP" : "ARTIST SIGN UP"}
      </div>
      <div style={{ color: C.white, fontWeight: 800, fontSize: 20, marginTop: 6, marginBottom: 24 }}>Create your account</div>
      <Field label="Full name / stage name" placeholder="e.g. Ayo Vala" value={name} onChange={setName} />
      <Field label="Email" placeholder="you@example.com" value={email} onChange={setEmail} type="email" />
      <Field label="Password" placeholder="At least 6 characters" value={password} onChange={setPassword} type="password" />
      <ErrorText>{error}</ErrorText>
      <div style={{ flex: 1 }} />
      <PrimaryButton onClick={submit} disabled={!name || !email || password.length < 6 || loading}>
        {loading ? "Creating account..." : "Continue"}
      </PrimaryButton>
    </div>
  );
}

function Login({ go, onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setLoading(true);
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    setLoading(false);
    if (profileError) {
      setError("Logged in, but couldn't load your profile.");
      return;
    }
    onLoggedIn(profile);
  };

  return (
    <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="" onBack={() => go(-1)} />
      <div style={{ color: C.white, fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Welcome back</div>
      <Field label="Email" placeholder="you@example.com" value={email} onChange={setEmail} type="email" />
      <Field label="Password" placeholder="Your password" value={password} onChange={setPassword} type="password" />
      <ErrorText>{error}</ErrorText>
      <div style={{ flex: 1 }} />
      <PrimaryButton onClick={submit} disabled={!email || !password || loading}>
        {loading ? "Logging in..." : "Log In"}
      </PrimaryButton>
    </div>
  );
}

/* ---------- Home / Browse ---------- */

function Home({ go, role, producers, loading }) {
  const [search, setSearch] = useState("");
  const filtered = producers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>ðŸ“ Kampala, Uganda â–¾</div>
          <div style={{ fontSize: 18 }}>ðŸ””</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ color: C.mute }}>ðŸ”</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={role === "producer" ? "Search artists..." : "Search producers, services..."}
            style={{ background: "none", border: "none", outline: "none", color: C.white, fontSize: 13, flex: 1, fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 10px" }}>
        <div style={{ background: `linear-gradient(135deg, #1c1c1c, #101010)`, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, marginBottom: 22 }}>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 17, lineHeight: 1.35 }}>
            {role === "producer" ? <>Find artists looking for your sound</> : <>Find the perfect<br />producer for your next hit</>}
          </div>
          <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginTop: 10, letterSpacing: 1 }}>BOOK. CREATE. GET PAID.</div>
        </div>

        <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Producers on AV Gigz</div>

        {loading && <div style={{ color: C.mute, fontSize: 13 }}>Loading producers...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ color: C.mute, fontSize: 13 }}>No producers have signed up yet â€” be the first!</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p) => (
            <ProducerRow key={p.id} p={p} onClick={() => go("profile", p)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProducerRow({ p, onClick }) {
  const services = p.services || [];
  const from = services.length ? Math.min(...services.map((s) => s.price)) : null;
  return (
    <button onClick={onClick} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, display: "flex", gap: 12, alignItems: "center", cursor: "pointer", textAlign: "left", width: "100%" }}>
      <Avatar size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.white, fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
        <div style={{ color: C.mute, fontSize: 11, marginTop: 2 }}>{p.city}</div>
      </div>
      {from !== null && (
        <div style={{ textAlign: "right" }}>
          <div style={{ color: C.faint, fontSize: 9.5 }}>From</div>
          <div style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{ugx(from)}</div>
        </div>
      )}
    </button>
  );
}

function Profile({ go, producer, startChat, role }) {
  if (!producer) return null;
  const services = producer.services || [];
  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <TopBar title="" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 20px", textAlign: "center" }}>
        <Avatar size={84} />
        <div style={{ color: C.white, fontWeight: 800, fontSize: 18, marginTop: 12 }}>{producer.name}</div>
        <div style={{ color: C.mute, fontSize: 12.5, marginTop: 2 }}>{producer.city}</div>

        <div style={{ textAlign: "left", marginTop: 24 }}>
          <SectionTitle>About</SectionTitle>
          <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.6 }}>{producer.bio || "No bio yet."}</div>
        </div>

        {producer.portfolio_link && (
          <div style={{ textAlign: "left", marginTop: 22 }}>
            <SectionTitle>Links</SectionTitle>
            <div style={{ color: C.blue, fontSize: 12.5 }}>ðŸ”— {producer.portfolio_link}</div>
          </div>
        )}

        <div style={{ textAlign: "left", marginTop: 22 }}>
          <SectionTitle>Services & Pricing</SectionTitle>
          {services.length === 0 ? (
            <div style={{ color: C.mute, fontSize: 13 }}>No services posted yet.</div>
          ) : (
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
              {services.map((s, i) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < services.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  <span style={{ color: C.white, fontSize: 13 }}>{s.name}</span>
                  <span style={{ color: C.mute, fontSize: 12 }}>From {ugx(s.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "sticky", bottom: 0, background: C.bg, padding: "12px 20px 20px", display: "flex", gap: 10, borderTop: `1px solid ${C.line}` }}>
        <GhostButton onClick={() => startChat(producer)} style={{ flex: 1 }}>Message</GhostButton>
        {role === "artist" && services.length > 0 && (
          <PrimaryButton onClick={() => go("book", producer)} style={{ flex: 1 }}>Book Now</PrimaryButton>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ color: C.white, fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>{children}</div>;
}

/* ---------- Post a Gig (writes to Supabase) ---------- */

function PostGig({ go, myGigs, refreshGigs }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Post a Gig" onBack={() => go(-1)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, marginBottom: 22 }}>
          ðŸŽµ
        </div>
        <div style={{ color: C.white, fontWeight: 800, fontSize: 19, marginBottom: 8 }}>Offer your services to the world</div>
        <div style={{ color: C.mute, fontSize: 13, marginBottom: 30, lineHeight: 1.6 }}>Create a gig, add your price, and start getting booked.</div>
        <PrimaryButton onClick={() => go("createGig")}>Create New Gig</PrimaryButton>
        <div style={{ height: 12 }} />
        <GhostButton onClick={() => go("myGigs")}>View My Gigs ({myGigs.length})</GhostButton>
      </div>
    </div>
  );
}

function CreateGig({ go, userId, onCreated }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    const { error: insertError } = await supabase.from("services").insert({
      producer_id: userId,
      name,
      price: Number(price),
      portfolio_link: link,
      description: desc,
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onCreated();
    go("myGigs");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Create New Gig" onBack={() => go(-1)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <Field label="Service name" placeholder="e.g. Afrobeats Beat Production" value={name} onChange={setName} />
        <Field label="Starting price (UGX)" placeholder="e.g. 100000" value={price} onChange={setPrice} type="number" />
        <Field label="Portfolio link" placeholder="soundcloud.com/yourname" value={link} onChange={setLink} />
        <div style={{ marginBottom: 1
