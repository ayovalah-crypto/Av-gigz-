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
            ←
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
  return <span style={{ color: filled ? C.gold : C.line, fontSize: 12 }}>★</span>;
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
    { key: "home", label: "Home", icon: "🏠" },
    { key: "bookings", label: "Bookings", icon: "📅" },
    { key: "post", label: role === "producer" ? "Post a Gig" : "Browse", icon: "➕", center: true },
    { key: "messages", label: "Messages", icon: "💬" },
    { key: "profile", label: "Profile", icon: "👤" },
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

function Avatar({ emoji = "🎧", size = 44, src }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `1.5px solid ${C.gold}`, flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.card}, #262626)`, border: `1.5px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, flexShrink: 0 }}>
      {emoji}
    </div>
  );
}

/* ---------- Portfolio link helpers ---------- */
function getLinkMeta(url) {
  if (!url) return { icon: "🔗", thumb: null, platform: "Link" };
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([\w-]{6,})/);
  if (yt) {
    return { icon: "▶️", thumb: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`, platform: "YouTube" };
  }
  if (url.includes("soundcloud.com")) return { icon: "🎵", thumb: null, platform: "SoundCloud" };
  if (url.includes("instagram.com")) return { icon: "📷", thumb: null, platform: "Instagram" };
  if (url.includes("spotify.com")) return { icon: "🎧", thumb: null, platform: "Spotify" };
  return { icon: "🔗", thumb: null, platform: "Link" };
}

function PortfolioLinkCard({ link }) {
  const meta = getLinkMeta(link.url);
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 10, marginBottom: 8, textDecoration: "none" }}
    >
      {meta.thumb ? (
        <img src={meta.thumb} alt="" style={{ width: 56, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 56, height: 40, borderRadius: 8, background: C.panel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          {meta.icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ color: C.white, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {link.label || meta.platform}
        </div>
        <div style={{ color: C.mute, fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.url}</div>
      </div>
    </a>
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
        <div style={{ textAlign: "center", color: C.faint, fontSize: 11, marginTop: 4 }}>🔒 Secure. Safe. Trusted.</div>
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
        { key: "producer", icon: "🎚️", title: "I'm a Producer", desc: "List your services & links, receive bookings, get paid." },
        { key: "artist", icon: "🎤", title: "I'm an Artist", desc: "Browse producers, request services, chat & book sessions." },
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
    onSignedUp({ id: userId, role, name, bio: "", city: "Kampala, Uganda", avatar_url: "", portfolio_links: [] });
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

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, flex: 1 }}>
      <div style={{ color: C.mute, fontSize: 11 }}>{label}</div>
      <div style={{ color: accent ? C.gold : C.white, fontWeight: 800, fontSize: 18, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Dashboard({ go, profile, myGigs }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("producer_id", profile.id)
        .order("created_at", { ascending: false });
      setBookings(data || []);
      setLoading(false);
    };
    if (profile?.id) load();
  }, [profile?.id]);

  const totalEarned = bookings
    .filter((b) => b.status === "completed" || b.status === "confirmed")
    .reduce((sum, b) => sum + (b.total_paid - b.commission_fee), 0);
  const pendingCount = bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar size={40} emoji="🎚️" src={profile.avatar_url} />
            <div>
              <div style={{ color: C.mute, fontSize: 12 }}>Welcome back,</div>
              <div style={{ color: C.white, fontWeight: 800, fontSize: 17 }}>{profile.name}</div>
            </div>
          </div>
          <div style={{ fontSize: 18 }}>🔔</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 10px" }}>
        <div style={{ background: `linear-gradient(135deg, #1c1c1c, #101010)`, border: `1px solid ${C.gold}55`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
          <div style={{ color: C.mute, fontSize: 12 }}>Total Earned</div>
          <div style={{ color: C.gold, fontWeight: 800, fontSize: 26, marginTop: 6 }}>{ugx(totalEarned)}</div>
          <div style={{ color: C.faint, fontSize: 11, marginTop: 4 }}>After 10% service fee</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <StatCard label="Active Gigs" value={myGigs.length} />
          <StatCard label="Pending Orders" value={pendingCount} accent />
          <StatCard label="Completed" value={completedCount} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>Recent Orders</div>
          <button onClick={() => go("bookings")} style={{ background: "none", border: "none", color: C.gold, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            See All
          </button>
        </div>

        {loading && <div style={{ color: C.mute, fontSize: 13 }}>Loading...</div>}
        {!loading && bookings.length === 0 && (
          <div style={{ color: C.mute, fontSize: 13 }}>No orders yet — share your gigs to start getting booked.</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bookings.slice(0, 5).map((b) => (
            <div key={b.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{b.service_name}</div>
                <div style={{ color: C.faint, fontSize: 10.5, marginTop: 2 }}>{b.session_date || "No date set"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.gold, fontSize: 12.5, fontWeight: 700 }}>{ugx(b.total_paid)}</div>
                <div style={{ color: C.faint, fontSize: 10, textTransform: "capitalize" }}>{b.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Home({ go, role, producers, loading, profile }) {
  const [search, setSearch] = useState("");
  const filtered = producers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size={30} emoji="🎤" src={profile?.avatar_url} />
            <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>📍 Kampala, Uganda ▾</div>
          </div>
          <div style={{ fontSize: 18 }}>🔔</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ color: C.mute }}>🔍</span>
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
          <div style={{ color: C.mute, fontSize: 13 }}>No producers have signed up yet — be the first!</div>
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
      <Avatar size={48} src={p.avatar_url} />
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
        <Avatar size={84} src={producer.avatar_url} />
        <div style={{ color: C.white, fontWeight: 800, fontSize: 18, marginTop: 12 }}>{producer.name}</div>
        <div style={{ color: C.mute, fontSize: 12.5, marginTop: 2 }}>{producer.city}</div>

        <div style={{ textAlign: "left", marginTop: 24 }}>
          <SectionTitle>About</SectionTitle>
          <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.6 }}>{producer.bio || "No bio yet."}</div>
        </div>

        {producer.portfolio_links && producer.portfolio_links.length > 0 && (
          <div style={{ textAlign: "left", marginTop: 22 }}>
            <SectionTitle>Portfolio</SectionTitle>
            {producer.portfolio_links.map((link, i) => (
              <PortfolioLinkCard key={i} link={link} />
            ))}
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
          🎵
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
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: C.mute, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Description</div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Describe what you offer..." style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", color: C.white, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit", resize: "none" }} />
        </div>
        <ErrorText>{error}</ErrorText>
      </div>
      <div style={{ padding: "10px 20px 20px" }}>
        <PrimaryButton disabled={!name || !price || loading} onClick={submit}>
          {loading ? "Publishing..." : "Publish Gig"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function MyGigs({ go, myGigs }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="My Gigs" onBack={() => go(-1)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {myGigs.length === 0 && <div style={{ color: C.mute, fontSize: 13, textAlign: "center", marginTop: 40 }}>You haven't posted any gigs yet.</div>}
        {myGigs.map((g) => (
          <div key={g.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>{g.name}</span>
              <span style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>{ugx(g.price)}</span>
            </div>
            {g.description && <div style={{ color: C.mute, fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{g.description}</div>}
            {g.portfolio_link && <div style={{ color: C.blue, fontSize: 11.5, marginTop: 6 }}>🔗 {g.portfolio_link}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Simplified placeholders for next phase ---------- */
/* Booking, chat, and wallet are still local-only in this first
   connected version — real tables already exist in Supabase
   (bookings, messages, transactions) and are ready to wire up next. */

function ComingSoon({ go, title, note }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title={title} onBack={() => go(-1)} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
        <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.6 }}>{note}</div>
      </div>
    </div>
  );
}

function Row({ label, value, muted, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
      <span style={{ color: muted ? C.mute : C.white, fontSize: bold ? 14 : 13, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ color: muted ? C.mute : bold ? C.gold : C.white, fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 600 }}>{value}</span>
    </div>
  );
}

/* ---------- Payment ---------- */
function PaymentModal({ amount, onClose, onSuccess }) {
  const [method, setMethod] = useState("momo");
  const [processing, setProcessing] = useState(false);
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState("");

  const canPay = method === "momo" ? phone.length >= 9 : card.length >= 12;

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess(method);
    }, 1100);
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", zIndex: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: C.panel, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "20px 20px 28px", border: `1px solid ${C.line}` }}>
        <div style={{ width: 40, height: 4, background: C.line, borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Choose payment method</div>
        <div style={{ color: C.mute, fontSize: 12, marginBottom: 18 }}>
          Amount to pay: <span style={{ color: C.gold, fontWeight: 700 }}>{ugx(amount)}</span>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[
            { key: "momo", label: "Mobile Money", icon: "📱" },
            { key: "card", label: "Credit Card", icon: "💳" },
          ].map((m) => (
            <button key={m.key} onClick={() => setMethod(m.key)} style={{ flex: 1, background: method === m.key ? "#2a2205" : C.card, border: `1.5px solid ${method === m.key ? C.gold : C.line}`, borderRadius: 12, padding: "14px 10px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 20 }}>{m.icon}</div>
              <div style={{ color: method === m.key ? C.gold : C.mute, fontSize: 11.5, fontWeight: 600, marginTop: 6 }}>{m.label}</div>
            </button>
          ))}
        </div>
        {method === "momo" ? (
          <Field label="Mobile Money number" placeholder="+256 7XX XXX XXX" value={phone} onChange={setPhone} />
        ) : (
          <Field label="Card number" placeholder="•••• •••• •••• ••••" value={card} onChange={setCard} />
        )}
        <PrimaryButton onClick={pay} disabled={!canPay || processing} style={{ marginTop: 8 }}>
          {processing ? "Processing..." : `Pay ${ugx(amount)}`}
        </PrimaryButton>
      </div>
    </div>
  );
}

/* ---------- Booking ---------- */
function BookSession({ go, producer, artistProfile, onBooked }) {
  const services = producer?.services || [];
  const [serviceId, setServiceId] = useState(services[0]?.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState("");

  if (!producer || services.length === 0) return null;
  const service = services.find((s) => s.id === serviceId) || services[0];
  const fee = service.price * COMMISSION_RATE;
  const total = service.price + fee;

  const confirmBooking = async (method) => {
    const { error: bookingError } = await supabase.from("bookings").insert({
      artist_id: artistProfile.id,
      producer_id: producer.id,
      service_id: service.id,
      service_name: service.name,
      price: service.price,
      commission_fee: fee,
      total_paid: total,
      session_date: date,
      session_time: time,
      project_details: details,
      status: "confirmed",
    });
    if (bookingError) {
      setError(bookingError.message);
      setPayOpen(false);
      return;
    }
    await supabase.from("transactions").insert([
      { user_id: producer.id, label: `Booking from ${artistProfile.name}`, amount: service.price, method },
      { user_id: artistProfile.id, label: `Paid ${producer.name} — ${service.name}`, amount: -total, method },
    ]);
    setPayOpen(false);
    onBooked && onBooked();
    go("bookingSuccess", { producer, service, date, time, total });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Book Session" onBack={() => go(-1)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <Avatar src={producer.avatar_url} size={44} />
          <div>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>{producer.name}</div>
            <div style={{ color: C.mute, fontSize: 11.5 }}>Producer</div>
          </div>
        </div>

        <SectionTitle>Select Service</SectionTitle>
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, color: C.white, borderRadius: 10, padding: "12px 14px", fontSize: 13, marginBottom: 18, fontFamily: "inherit" }}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {ugx(s.price)}
            </option>
          ))}
        </select>

        <SectionTitle>Date & Time</SectionTitle>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, color: C.white, borderRadius: 10, padding: "12px 14px", fontSize: 12.5, fontFamily: "inherit" }} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, color: C.white, borderRadius: 10, padding: "12px 14px", fontSize: 12.5, fontFamily: "inherit" }} />
        </div>

        <SectionTitle>Project Details</SectionTitle>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Tell the producer about your project..." rows={3} style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, color: C.white, borderRadius: 10, padding: "12px 14px", fontSize: 13, marginBottom: 18, fontFamily: "inherit", resize: "none", boxSizing: "border-box" }} />

        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <Row label={service.name} value={ugx(service.price)} />
          <Row label="Service Fee (10%)" value={"+" + ugx(fee)} muted />
          <div style={{ borderTop: `1px solid ${C.line}`, margin: "8px 0" }} />
          <Row label="You Pay" value={ugx(total)} bold />
        </div>
        <ErrorText>{error}</ErrorText>
      </div>
      <div style={{ padding: "0 20px 20px" }}>
        <PrimaryButton onClick={() => setPayOpen(true)}>Continue to Payment</PrimaryButton>
      </div>
      {payOpen && <PaymentModal amount={total} onClose={() => setPayOpen(false)} onSuccess={confirmBooking} />}
    </div>
  );
}

function BookingSuccess({ go, data }) {
  if (!data) return null;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#123", border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 20 }}>✓</div>
      <div style={{ color: C.white, fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Booking Confirmed!</div>
      <div style={{ color: C.mute, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Your {data.service.name.toLowerCase()} session with {data.producer.name} is booked{data.date ? ` for ${data.date}` : ""}{data.time ? ` at ${data.time}` : ""}.
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, width: "100%", marginBottom: 24 }}>
        <Row label="Total Paid" value={ugx(data.total)} bold />
      </div>
      <PrimaryButton onClick={() => go("home")}>Back to Home</PrimaryButton>
    </div>
  );
}

function Bookings({ go, profile, role }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const column = role === "artist" ? "artist_id" : "producer_id";
      const { data } = await supabase.from("bookings").select("*").eq(column, profile.id).order("created_at", { ascending: false });
      setBookings(data || []);
      setLoading(false);
    };
    if (profile?.id) load();
  }, [profile?.id, role]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 20px 12px", color: C.white, fontWeight: 700, fontSize: 17 }}>Bookings</div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {loading && <div style={{ color: C.mute, fontSize: 13 }}>Loading...</div>}
        {!loading && bookings.length === 0 && (
          <div style={{ color: C.mute, fontSize: 13, textAlign: "center", marginTop: 40 }}>
            {role === "artist" ? "No bookings yet — browse producers to book a session." : "No bookings yet — share your gigs to get booked."}
          </div>
        )}
        {bookings.map((b) => (
          <div key={b.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.white, fontWeight: 700, fontSize: 13.5 }}>{b.service_name}</span>
              <span style={{ color: C.gold, fontWeight: 700, fontSize: 12.5 }}>{ugx(b.total_paid)}</span>
            </div>
            <div style={{ color: C.faint, fontSize: 11, marginTop: 4 }}>
              {b.session_date || "No date set"} {b.session_time ? `· ${b.session_time}` : ""}
            </div>
            <div style={{ color: C.mute, fontSize: 10.5, marginTop: 4, textTransform: "capitalize" }}>{b.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Wallet ---------- */
function Wallet({ go, profile }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("transactions").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });
      setTransactions(data || []);
      setLoading(false);
    };
    if (profile?.id) load();
  }, [profile?.id]);

  const balance = transactions.reduce((a, t) => a + Number(t.amount), 0);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Wallet" onBack={() => go(-1)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        <div style={{ background: `linear-gradient(135deg, #1c1c1c, #101010)`, border: `1px solid ${C.gold}55`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ color: C.mute, fontSize: 12 }}>Balance</div>
          <div style={{ color: C.gold, fontWeight: 800, fontSize: 26, marginTop: 6 }}>{ugx(balance)}</div>
        </div>

        <SectionTitle>Transactions</SectionTitle>
        {loading && <div style={{ color: C.mute, fontSize: 13 }}>Loading...</div>}
        {!loading && transactions.length === 0 && <div style={{ color: C.mute, fontSize: 13 }}>No transactions yet.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {transactions.map((t) => (
            <div key={t.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.panel, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.amount > 0 ? "⬇️" : "⬆️"}
                </div>
                <div>
                  <div style={{ color: C.white, fontSize: 12.5, fontWeight: 600 }}>{t.label}</div>
                  <div style={{ color: C.faint, fontSize: 10.5 }}>{new Date(t.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <span style={{ color: t.amount > 0 ? "#4CD964" : "#FF5C5C", fontSize: 12.5, fontWeight: 700 }}>
                {t.amount > 0 ? "+" : ""}
                {ugx(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 20px 20px" }}>
        <GhostButton onClick={() => alert("Withdrawals to bank/Mobile Money are coming in a future update.")}>Withdraw Funds</GhostButton>
      </div>
    </div>
  );
}

/* ---------- Chat ---------- */
function Messages({ go, profile }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .order("created_at", { ascending: false });

      const byPartner = {};
      (msgs || []).forEach((m) => {
        const partnerId = m.sender_id === profile.id ? m.recipient_id : m.sender_id;
        if (!byPartner[partnerId]) byPartner[partnerId] = m;
      });
      const partnerIds = Object.keys(byPartner);
      if (partnerIds.length === 0) {
        setThreads([]);
        setLoading(false);
        return;
      }
      const { data: partners } = await supabase.from("profiles").select("id, name, avatar_url").in("id", partnerIds);
      const list = (partners || []).map((p) => ({ partner: p, lastMessage: byPartner[p.id] }));
      list.sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
      setThreads(list);
      setLoading(false);
    };
    if (profile?.id) load();
  }, [profile?.id]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 20px 12px", color: C.white, fontWeight: 700, fontSize: 17 }}>Messages</div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {loading && <div style={{ color: C.mute, fontSize: 13 }}>Loading...</div>}
        {!loading && threads.length === 0 && (
          <div style={{ color: C.mute, fontSize: 13, textAlign: "center", marginTop: 40 }}>
            No conversations yet — message someone from their profile.
          </div>
        )}
        {threads.map((t) => (
          <button key={t.partner.id} onClick={() => go("chat", t.partner)} style={{ width: "100%", background: "none", border: "none", borderBottom: `1px solid ${C.line}`, padding: "12px 0", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
            <Avatar src={t.partner.avatar_url} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 13.5, fontWeight: 700 }}>{t.partner.name}</div>
              <div style={{ color: C.mute, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.lastMessage.content}</div>
            </div>
            <div style={{ color: C.faint, fontSize: 10.5 }}>{new Date(t.lastMessage.created_at).toLocaleDateString()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AttachmentBubble({ m, mine }) {
  const type = m.attachment_type;
  const url = m.attachment_url;
  if (!url) return null;
  const captionColor = mine ? "rgba(20,20,20,0.65)" : C.faint;

  if (type === "image") {
    return (
      <a href={url} download={m.attachment_name || "photo"} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
        <img src={url} alt={m.attachment_name || ""} style={{ maxWidth: 200, borderRadius: 12, display: "block" }} />
        <div style={{ fontSize: 10.5, color: captionColor, marginTop: 4 }}>⬇️ Tap to save</div>
      </a>
    );
  }
  if (type === "video") {
    return (
      <div>
        <video src={url} controls style={{ maxWidth: 220, borderRadius: 12, display: "block" }} />
        <a href={url} download={m.attachment_name || "video"} target="_blank" rel="noreferrer" style={{ fontSize: 10.5, color: captionColor, marginTop: 4, textDecoration: "none", display: "inline-block" }}>
          ⬇️ Save video
        </a>
      </div>
    );
  }
  if (type === "audio") {
    return (
      <div>
        <audio src={url} controls style={{ width: 220 }} />
        <a href={url} download={m.attachment_name || "audio"} target="_blank" rel="noreferrer" style={{ fontSize: 10.5, color: captionColor, marginTop: 4, textDecoration: "none", display: "inline-block" }}>
          ⬇️ Save audio
        </a>
      </div>
    );
  }
  return (
    <a
      href={url}
      download={m.attachment_name || "file"}
      target="_blank"
      rel="noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 8, color: mine ? "#141414" : C.white, textDecoration: "none" }}
    >
      <span style={{ fontSize: 18 }}>📄</span>
      <span style={{ fontSize: 12.5, textDecoration: "underline", wordBreak: "break-all" }}>{m.attachment_name || "Download file"}</span>
    </a>
  );
}

function attachmentTypeFor(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/") || /\.(mp3|wav)$/i.test(file.name)) return "audio";
  return "file";
}

function Chat({ go, profile, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);
  const pickTypeRef = useRef("*/*");

  const load = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},recipient_id.eq.${profile.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  const addMessageIfNew = (m) => {
    setMessages((prev) => (prev.find((x) => x.id === m.id) ? prev : [...prev, m]));
  };

  useEffect(() => {
    if (!otherUser?.id) return;
    load();
    const channel = supabase
      .channel(`chat-${profile.id}-${otherUser.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new;
        const belongs =
          (m.sender_id === profile.id && m.recipient_id === otherUser.id) ||
          (m.sender_id === otherUser.id && m.recipient_id === profile.id);
        if (belongs) addMessageIfNew(m);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUser?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!otherUser) return null;

  const send = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    // The realtime subscription above will add this message once it comes back —
    // no local echo here, so it only ever appears once.
    const { error } = await supabase.from("messages").insert({ sender_id: profile.id, recipient_id: otherUser.id, content });
    if (error) console.error(error.message);
  };

  const openPicker = (accept) => {
    pickTypeRef.current = accept;
    setShowAttachMenu(false);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const path = `${profile.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("chat-files").upload(path, file);
    if (uploadError) {
      setUploading(false);
      alert("Couldn't send file: " + uploadError.message);
      return;
    }
    const { data } = supabase.storage.from("chat-files").getPublicUrl(path);
    const { error: insertError } = await supabase.from("messages").insert({
      sender_id: profile.id,
      recipient_id: otherUser.id,
      content: "",
      attachment_url: data.publicUrl,
      attachment_type: attachmentTypeFor(file),
      attachment_name: file.name,
    });
    if (insertError) alert("Couldn't send file: " + insertError.message);
    setUploading(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px 12px", borderBottom: `1px solid ${C.line}` }}>
        <button onClick={() => go(-1)} style={iconBtnStyle}>←</button>
        <Avatar src={otherUser.avatar_url} size={36} />
        <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>{otherUser.name}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <div style={{ color: C.mute, fontSize: 13 }}>Loading...</div>}
        {messages.map((m) => {
          const mine = m.sender_id === profile.id;
          return (
            <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", background: mine ? C.gold : C.card, color: mine ? "#141414" : C.white, border: mine ? "none" : `1px solid ${C.line}`, borderRadius: 14, borderBottomRightRadius: mine ? 4 : 14, borderBottomLeftRadius: mine ? 14 : 4, padding: m.attachment_url && !m.content ? 8 : "9px 13px", maxWidth: "78%", fontSize: 13, lineHeight: 1.4 }}>
              {m.attachment_url && <AttachmentBubble m={m} mine={mine} />}
              {m.content && <div style={{ marginTop: m.attachment_url ? 6 : 0 }}>{m.content}</div>}
            </div>
          );
        })}
        {uploading && <div style={{ alignSelf: "flex-end", color: C.mute, fontSize: 11.5 }}>Sending file...</div>}
        <div ref={endRef} />
      </div>

      {showAttachMenu && (
        <div style={{ position: "absolute", bottom: 64, left: 14, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 8, display: "flex", flexDirection: "column", gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", zIndex: 10 }}>
          {[
            { label: "Photo", icon: "🖼️", accept: "image/*" },
            { label: "Video", icon: "🎬", accept: "video/*" },
            { label: "Audio (MP3/WAV)", icon: "🎵", accept: "audio/mpeg,audio/wav,.mp3,.wav" },
            { label: "File", icon: "📄", accept: "*/*" },
          ].map((opt) => (
            <button key={opt.label} onClick={() => openPicker(opt.accept)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: C.white, fontSize: 13, padding: "9px 12px", cursor: "pointer", borderRadius: 8, textAlign: "left" }}>
              <span>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={pickTypeRef.current}
        style={{ display: "none" }}
        onChange={(e) => {
          handleFile(e.target.files[0]);
          e.target.value = "";
        }}
      />

      <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: `1px solid ${C.line}`, alignItems: "center" }}>
        <button onClick={() => setShowAttachMenu((v) => !v)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", flexShrink: 0, color: C.mute }}>
          📎
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message..." style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: "10px 16px", color: C.white, fontSize: 13, fontFamily: "inherit" }} />
        <button onClick={send} style={{ background: C.gold, border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>➤</button>
      </div>
    </div>
  );
}

function MyProfile({ go, profile, setProfile, role, userId }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const links = draft.portfolio_links || [];

  const setLink = (i, field, value) => {
    const next = [...links];
    next[i] = { ...next[i], [field]: value };
    setDraft({ ...draft, portfolio_links: next });
  };
  const addLink = () => setDraft({ ...draft, portfolio_links: [...links, { label: "", url: "" }] });
  const removeLink = (i) => setDraft({ ...draft, portfolio_links: links.filter((_, idx) => idx !== i) });

  const uploadAvatar = async (file) => {
    setError("");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setDraft((d) => ({ ...d, avatar_url: data.publicUrl + "?t=" + Date.now() }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const cleanLinks = links.filter((l) => l.url && l.url.trim());
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name: draft.name, city: draft.city, bio: draft.bio, avatar_url: draft.avatar_url, portfolio_links: cleanLinks })
      .eq("id", userId);
    setSaving(false);
    if (!updateError) {
      setProfile({ ...draft, portfolio_links: cleanLinks });
      setEdit(false);
    } else {
      setError(updateError.message);
    }
  };

  if (edit) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Edit Profile" onBack={() => setEdit(false)} />
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
            <Avatar size={84} emoji={role === "producer" ? "🎚️" : "🎤"} src={draft.avatar_url} />
            <label style={{ marginTop: 10, color: C.gold, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              {uploading ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files[0] && uploadAvatar(e.target.files[0])}
              />
            </label>
          </div>

          <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="City" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: C.mute, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Bio</div>
            <textarea value={draft.bio || ""} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} rows={4} style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", color: C.white, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit", resize: "none" }} />
          </div>

          <div style={{ color: C.mute, fontSize: 12, marginBottom: 8, fontWeight: 600 }}>Portfolio links</div>
          {links.map((link, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: C.faint, fontSize: 11, fontWeight: 600 }}>Link {i + 1}</span>
                <button onClick={() => removeLink(i)} style={{ background: "none", border: "none", color: "#FF6B6B", fontSize: 11, cursor: "pointer" }}>
                  Remove
                </button>
              </div>
              <input
                placeholder="Label — e.g. Latest Beat"
                value={link.label}
                onChange={(e) => setLink(i, "label", e.target.value)}
                style={{ width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 12px", color: C.white, fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "inherit" }}
              />
              <input
                placeholder="https://youtube.com/... or soundcloud.com/..."
                value={link.url}
                onChange={(e) => setLink(i, "url", e.target.value)}
                style={{ width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 12px", color: C.white, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          ))}
          <GhostButton onClick={addLink} style={{ marginBottom: 20 }}>+ Add another link</GhostButton>

          <ErrorText>{error}</ErrorText>
        </div>
        <div style={{ padding: "10px 20px 20px" }}>
          <PrimaryButton onClick={save} disabled={saving || uploading}>{saving ? "Saving..." : "Save Changes"}</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 20px 0", textAlign: "center" }}>
      <Avatar size={84} emoji={role === "producer" ? "🎚️" : "🎤"} src={profile.avatar_url} />
      <div style={{ color: C.white, fontWeight: 800, fontSize: 18, marginTop: 12 }}>{profile.name}</div>
      <div style={{ color: C.gold, fontSize: 11.5, fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>{role === "producer" ? "PRODUCER" : "ARTIST"}</div>
      <div style={{ color: C.mute, fontSize: 12.5, marginTop: 4 }}>{profile.city}</div>

      <div style={{ textAlign: "left", marginTop: 22 }}>
        <SectionTitle>About</SectionTitle>
        <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.6 }}>{profile.bio || "Tell people about yourself..."}</div>
      </div>

      {profile.portfolio_links && profile.portfolio_links.length > 0 && (
        <div style={{ textAlign: "left", marginTop: 18 }}>
          <SectionTitle>Portfolio</SectionTitle>
          {profile.portfolio_links.map((link, i) => (
            <PortfolioLinkCard key={i} link={link} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, marginBottom: 20 }}>
        <GhostButton onClick={() => { setDraft(profile); setEdit(true); }}>Edit Profile</GhostButton>
      </div>

      <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${C.line}`, paddingTop: 4 }}>
        {[
          { label: "Wallet", screen: "wallet" },
          { label: "My Bookings", screen: "bookings" },
          role === "producer" ? { label: "My Gigs", screen: "myGigs" } : null,
          { label: "Log out", screen: "logout" },
        ].filter(Boolean).map((row) => (
          <button key={row.label} onClick={() => go(row.screen)} style={{ background: "none", border: "none", borderBottom: `1px solid ${C.line}`, padding: "14px 4px", display: "flex", justifyContent: "space-between", color: C.white, fontSize: 13.5, cursor: "pointer" }}>
            {row.label} <span style={{ color: C.faint }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- App shell ---------- */
export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [producers, setProducers] = useState([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [myGigs, setMyGigs] = useState([]);
  const [stack, setStack] = useState([{ screen: "splash", data: null }]);
  const [checkingSession, setCheckingSession] = useState(true);

  const current = stack[stack.length - 1];

  const go = (screen, data = null) => {
    if (screen === -1) {
      setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
      return;
    }
    setStack((s) => [...s, { screen, data }]);
  };
  const resetTo = (screen) => setStack([{ screen, data: null }]);

  // Restore session on load
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (p) {
          setProfile(p);
          setRole(p.role);
          resetTo("home");
        }
      }
      setCheckingSession(false);
    });
  }, []);

  const fetchProducers = async () => {
    setLoadingProducers(true);
    const { data } = await supabase.from("profiles").select("*, services(*)").eq("role", "producer");
    setProducers(data || []);
    setLoadingProducers(false);
  };

  const fetchMyGigs = async () => {
    if (!profile) return;
    const { data } = await supabase.from("services").select("*").eq("producer_id", profile.id);
    setMyGigs(data || []);
  };

  useEffect(() => {
    if (profile) {
      fetchProducers();
      if (profile.role === "producer") fetchMyGigs();
    }
  }, [profile]);

  const onNav = (key) => {
    if (key === "post" && role === "artist") {
      resetTo("home");
      return;
    }
    resetTo(key === "post" ? "postGig" : key);
  };

  let body = null;
  switch (current.screen) {
    case "splash":
      body = <Splash go={go} />;
      break;
    case "roleSelect":
      body = <RoleSelect go={go} setRole={setRole} />;
      break;
    case "signup":
      body = (
        <SignUp
          go={go}
          role={role}
          onSignedUp={(p) => {
            setProfile(p);
            resetTo("home");
          }}
        />
      );
      break;
    case "login":
      body = (
        <Login
          go={go}
          onLoggedIn={(p) => {
            setProfile(p);
            setRole(p.role);
            resetTo("home");
          }}
        />
      );
      break;
    case "home":
      body =
        role === "producer" ? (
          <Dashboard go={go} profile={profile} myGigs={myGigs} />
        ) : (
          <Home go={go} role={role} producers={producers} loading={loadingProducers} profile={profile} />
        );
      break;
    case "profile":
      body = <Profile go={go} producer={current.data} startChat={(p) => go("chat", p)} role={role} />;
      break;
    case "book":
      body = <BookSession go={go} producer={current.data} artistProfile={profile} onBooked={() => role === "producer" && fetchMyGigs()} />;
      break;
    case "bookingSuccess":
      body = <BookingSuccess go={resetTo} data={current.data} />;
      break;
    case "postGig":
      body = <PostGig go={go} myGigs={myGigs} />;
      break;
    case "createGig":
      body = <CreateGig go={go} userId={profile?.id} onCreated={fetchMyGigs} />;
      break;
    case "myGigs":
      body = <MyGigs go={go} myGigs={myGigs} />;
      break;
    case "wallet":
      body = <Wallet go={go} profile={profile} />;
      break;
    case "bookings":
      body = <Bookings go={go} profile={profile} role={role} />;
      break;
    case "messages":
      body = <Messages go={go} profile={profile} />;
      break;
    case "chat":
      body = <Chat go={go} profile={profile} otherUser={current.data} />;
      break;
    case "profileTab":
      body = profile ? <MyProfile go={go} profile={profile} setProfile={setProfile} role={role} userId={profile.id} /> : null;
      break;
    case "logout":
      supabase.auth.signOut();
      setProfile(null);
      setRole(null);
      resetTo("splash");
      body = null;
      break;
    default:
      body = <Home go={go} role={role} producers={producers} loading={loadingProducers} profile={profile} />;
  }

  const showNav = ["home", "postGig", "wallet", "messages", "profileTab", "bookings"].includes(current.screen);
  const activeNavKey = current.screen === "profileTab" ? "profile" : current.screen === "postGig" ? "post" : current.screen;

  if (checkingSession) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: C.bg, color: C.mute, fontFamily: "'Poppins', sans-serif" }}>
        Loading AV Gigz...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", background: "#000", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      <style>{`@import url('${FONT_URL}');`}</style>
      <div style={{ width: 390, maxWidth: "100%", height: 844, maxHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.6)" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>{body}</div>
        {showNav && (
          <BottomNav
            active={activeNavKey}
            role={role}
            onNav={(key) => (key === "profile" ? onNav("profileTab") : onNav(key))}
          />
        )}
      </div>
    </div>
  );
}
