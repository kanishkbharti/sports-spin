"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Disc3,
  MousePointerClick,
  Trophy,
  Users,
  Shield,
  Globe,
  Gauge,
  Share2,
  ChevronDown,
} from "lucide-react";
import { SPORTS } from "@/lib/data";
import { Logo } from "@/components/layout/Logo";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const MARQUEE = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "World Cup 26",
  "National Teams",
];

type WheelSegment = {
  name: string;
  ab: string;
  color: string;
  crest: string;
};

const CREST = (id: number) => `https://crests.football-data.org/${id}.png`;

const WHEEL_SEGMENTS: WheelSegment[] = [
  { name: "Man City", ab: "MCI", color: "#6cabdd", crest: CREST(65) },
  { name: "Barcelona", ab: "BAR", color: "#a50044", crest: CREST(81) },
  { name: "Bayern", ab: "BAY", color: "#dc052d", crest: CREST(5) },
  { name: "Chelsea", ab: "CHE", color: "#034694", crest: CREST(61) },
  { name: "Liverpool", ab: "LIV", color: "#c8102e", crest: CREST(64) },
  { name: "Napoli", ab: "NAP", color: "#12a0d7", crest: CREST(113) },
  { name: "Arsenal", ab: "ARS", color: "#ef0107", crest: CREST(57) },
  { name: "PSG", ab: "PSG", color: "#004170", crest: CREST(524) },
  { name: "Man United", ab: "MUN", color: "#da291c", crest: CREST(66) },
  { name: "Real Madrid", ab: "RMA", color: "#00529f", crest: CREST(86) },
  { name: "Inter", ab: "INT", color: "#0068a8", crest: CREST(108) },
  { name: "Newcastle", ab: "NEW", color: "#241f20", crest: CREST(67) },
];

function WheelBadge({ seg }: { seg: WheelSegment }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className="font-heavy text-[10px] text-white"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,.8)" }}
      >
        {seg.ab}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={seg.crest}
      alt={seg.name}
      width={32}
      height={32}
      onError={() => setFailed(true)}
      className="w-8 h-8 object-contain"
      style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.55))" }}
    />
  );
}

const WHEEL_PLAYERS = [
  { n: "V. Júnior", pos: "LW", ovr: 90, nat: "🇧🇷", avatar: "🧑🏾", s: [95, 86, 80, 92, 29, 68] },
  { n: "E. Haaland", pos: "ST", ovr: 91, nat: "🇳🇴", avatar: "🧑", s: [89, 93, 71, 80, 45, 88] },
  { n: "J. Bellingham", pos: "CM", ovr: 90, nat: "🏴", avatar: "🧑🏻", s: [80, 86, 86, 88, 78, 84] },
  { n: "L. Messi", pos: "RW", ovr: 90, nat: "🇦🇷", avatar: "🧔🏻", s: [80, 87, 90, 94, 33, 64] },
  { n: "K. Mbappé", pos: "ST", ovr: 91, nat: "🇫🇷", avatar: "🧑🏽", s: [97, 90, 80, 92, 36, 78] },
  { n: "M. Salah", pos: "RW", ovr: 89, nat: "🇪🇬", avatar: "🧔🏽", s: [89, 87, 81, 88, 45, 75] },
  { n: "Rodri", pos: "CDM", ovr: 91, nat: "🇪🇸", avatar: "🧑🏻", s: [66, 80, 85, 84, 86, 85] },
  { n: "H. Kane", pos: "ST", ovr: 90, nat: "🏴", avatar: "🧑", s: [68, 93, 84, 82, 47, 83] },
];

const STAT_LABELS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];

function HeroWheel() {
  const seg = 360 / WHEEL_SEGMENTS.length;
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [player, setPlayer] = useState(WHEEL_PLAYERS[0]);

  const gradient = `conic-gradient(${WHEEL_SEGMENTS.map(
    (s, i) => `${s.color} ${i * seg}deg ${(i + 1) * seg}deg`
  ).join(",")})`;

  function spin() {
    if (spinning) return;
    setSpinning(true);
    const pick = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const turns = 4 + Math.floor(Math.random() * 3);
    const targetCenter = pick * seg + seg / 2;
    setRot((r) => r + turns * 360 + (360 - (r % 360)) - targetCenter);
    window.setTimeout(() => {
      setPlayer(WHEEL_PLAYERS[Math.floor(Math.random() * WHEEL_PLAYERS.length)]);
      setSpinning(false);
    }, 4700);
  }

  return (
    <div className="relative grid place-items-center min-h-[380px] sm:min-h-[480px]">
      {/* sizing wrapper keeps the scaled stage from overflowing on mobile */}
      <div className="relative w-[279px] h-[279px] sm:w-[340px] sm:h-[340px]">
      {/* wheel stage — faithful to the 340px reference, scaled down on small screens */}
      <div className="absolute top-0 left-0 w-[340px] h-[340px] origin-top-left scale-[0.82] sm:scale-100">
        {/* glow */}
        <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.22),transparent_68%)] blur-[6px] pointer-events-none" />

        {/* pointer */}
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-[7] w-0 h-0 pointer-events-none"
          style={{
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderTop: "26px solid var(--color-accent)",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,.5))",
          }}
        />

        {/* wheel */}
        <div
          onClick={spin}
          className={`relative w-full h-full rounded-full border-[6px] border-[#06120a] ${
            spinning ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{
            background: gradient,
            transform: `rotate(${rot}deg)`,
            transition: "transform 4.6s cubic-bezier(.15,.9,.2,1)",
            boxShadow:
              "0 30px 70px -20px rgba(0,0,0,.7), inset 0 0 0 2px rgba(255,255,255,.06)",
          }}
        >
          <div className="absolute inset-0 z-[5]">
            {WHEEL_SEGMENTS.map((s, i) => {
              const ang = i * seg + seg / 2;
              return (
                <span
                  key={s.name}
                  title={s.name}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%,-50%) rotate(${ang}deg) translateY(-116px) rotate(${-ang}deg)`,
                  }}
                >
                  <WheelBadge seg={s} />
                </span>
              );
            })}
          </div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[74px] h-[74px] rounded-full grid place-items-center z-[6] border-[3px] border-accent"
            style={{
              background: "radial-gradient(circle at 35% 30%, #123, #06120a)",
              boxShadow: "0 8px 20px -6px rgba(0,0,0,.8)",
            }}
          >
            <Logo size={34} />
          </div>
        </div>

        {/* spin button — straddles the wheel's bottom edge, like the reference */}
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-[8] cursor-pointer whitespace-nowrap font-display font-extrabold text-[14px] tracking-[0.06em] uppercase bg-accent text-[#06120a] px-[26px] py-[13px] rounded-full transition-transform hover:-translate-y-[3px] hover:-translate-x-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 12px 30px -8px rgba(74,222,128,.6)" }}
        >
          {spinning ? "Spinning…" : "Spin the wheel"}
        </button>

        {/* player card — lower-right, overlapping the wheel (reference layout) */}
        <div className="absolute -right-2 bottom-3.5 z-[9] pointer-events-none animate-card-float">
        <div
          onClick={spin}
          data-spinning={spinning}
          className="player-card-fut pointer-events-auto cursor-pointer w-[172px] rounded-2xl px-3.5 pt-4 pb-3.5 text-[#2a1e00] border border-white/50"
          style={{
            background: "linear-gradient(160deg,#ffe9a8,#f5c451 45%,#e8a92b)",
            boxShadow: "0 24px 50px -16px rgba(0,0,0,.7)",
          }}
        >
          <span
            className="absolute -left-2.5 top-2 z-10 font-display font-extrabold text-[11px] tracking-wider uppercase bg-pink text-white px-2.5 py-1.5 rounded-lg -rotate-6"
            style={{ boxShadow: "0 8px 18px -6px rgba(255,92,138,.6)" }}
          >
            Your pick
          </span>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-heavy text-[34px] leading-[0.9]">{player.ovr}</div>
              <div className="font-display font-extrabold text-[13px] mt-0.5">{player.pos}</div>
              <div className="flex flex-col gap-1.5 items-center mt-1">
                <span className="text-sm">{player.nat}</span>
                <span className="text-sm">⚽</span>
              </div>
            </div>
            <div className="text-[52px] leading-none">{player.avatar}</div>
          </div>
          <div className="font-heavy text-[17px] text-center uppercase border-t-[1.5px] border-[rgba(42,30,0,.25)] pt-2 mt-1">
            {player.n}
          </div>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5 mt-2 font-display font-extrabold text-[11px]">
            {player.s.map((v, i) => (
              <span key={STAT_LABELS[i]} className="flex justify-between">
                {STAT_LABELS[i]}
                <i className="not-italic opacity-70">{v}</i>
              </span>
            ))}
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    icon: Disc3,
    title: "Spin the wheel",
    body: "Give it a flick and land on a random side: a top club, a nation, or a World Cup 26 squad. You never know who you'll get.",
  },
  {
    icon: MousePointerClick,
    title: "Draft one player",
    body: "Pick a single real player from that team to fill an open slot. Chase the superstar or shore up a gap. The formation decides.",
  },
  {
    icon: Trophy,
    title: "Reveal your XI",
    body: "Fill all eleven positions and watch your line-up come to life in a full-screen, FIFA-style formation view.",
  },
];

const FEATURES = [
  {
    icon: Gauge,
    title: "EA FC 26-accurate ratings",
    body: "Every player carries a real overall, baked in ahead of time, so a Messi feels like a Messi and a pick actually means something.",
    accent: true,
  },
  {
    icon: Users,
    title: "Solo or head-to-head",
    body: "Draft on your own, or go 2-player with squads forming side by side in real time.",
  },
  {
    icon: Shield,
    title: "Real formations & rules",
    body: "Choose 4-3-3, 3-5-2, 4-2-3-1 and more, then cap how many players you take from one club.",
  },
  {
    icon: Globe,
    title: "Clubs & nations",
    body: "Europe's top leagues, international sides, and the full World Cup 26 field, all with live rosters.",
  },
  {
    icon: Sparkles,
    title: "Fixed GK logic",
    body: "Keepers snap to the right slot and outfield players get a smart position picker. No fiddling.",
  },
  {
    icon: Share2,
    title: "Shareable results",
    body: "End on a results page with club/country breakdowns and ratings by line to settle the debate.",
  },
];

const FAQS = [
  {
    q: "What is Squadr?",
    a: "Squadr is the home of Sports Squad Forge, a spin-and-draft game for football fans. Instead of scrolling a database, you spin a wheel to draw a team, then pick one real player at a time until you've built a complete starting XI. It turns squad knowledge into a fast, replayable challenge.",
  },
  {
    q: "How does a draft actually work?",
    a: "Every turn, you spin the wheel to land on a club or nation. You then choose one player from that squad to fill an open position in your formation. Repeat until all eleven slots are filled, then your team is revealed and scored line by line.",
  },
  {
    q: "Can I play with a friend?",
    a: "Yes. Pick 2-player mode when you create a draft, name both teams, and take turns from the same wheel. Both XIs build up side by side so you can compare picks as you go.",
  },
  {
    q: "Where do the player ratings come from?",
    a: "Ratings are EA FC 26-accurate and baked in ahead of time, so a Messi feels like a Messi. We match live rosters to the ratings so the numbers you see are the ones you'd expect.",
  },
  {
    q: "Which teams can I draft from?",
    a: "Pick your pool when setting up: curated squads from Europe's top leagues, international national teams, or the full FIFA World Cup 2026 field. Placeholder brackets like \"Winner SF 1\" are filtered out so you only draft real sides.",
  },
  {
    q: "Is it free? Are more sports coming?",
    a: "Football is live and free to play right now. Basketball, cricket, NFL, F1 and hockey drafts are on the roadmap, with the same spin-and-build loop and new rosters.",
  },
];

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-display font-bold text-[12px] tracking-[0.18em] uppercase text-accent ${
        center ? "justify-center" : ""
      }`}
    >
      <span className="w-5 h-0.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className={`rounded-[14px] glass border overflow-hidden transition-colors ${
              isOpen ? "border-border-strong" : "border-border"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display font-bold text-base sm:text-[17px] text-text-primary">
                {faq.q}
              </span>
              <span
                className={`shrink-0 w-7 h-7 rounded-full border grid place-items-center transition-all duration-300 ${
                  isOpen
                    ? "rotate-180 bg-accent border-accent text-[#06120a]"
                    : "border-border-strong text-accent"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-5 text-[15px] text-text-secondary leading-relaxed max-w-[64ch]">
                {faq.a}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const activeSport = SPORTS.find((s) => s.status === "active");
  const comingSoon = SPORTS.filter((s) => s.status === "coming_soon");

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* HERO */}
        <section className="pt-10 pb-6 sm:pt-16 sm:pb-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-accent/[0.08] border border-border-strong text-[13px] font-medium text-text-secondary mb-6">
                <b className="inline-flex items-center gap-1.5 font-display text-[11px] tracking-widest uppercase text-[#06120a] bg-accent px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06120a] animate-pulse" />
                  Now Live
                </b>
                Football drafts &amp; World Cup 26 squads
              </span>
              <h1 className="font-heavy uppercase leading-[0.94] tracking-tight text-[clamp(44px,6.6vw,80px)]">
                Spin it. Draft it.
                <br />
                <span className="text-gradient-accent">Forge your XI.</span>
              </h1>
              <p className="mt-6 text-[clamp(16px,1.5vw,19px)] text-text-secondary max-w-[52ch] leading-relaxed">
                Squadr is the home of <b className="text-text-primary font-semibold">Sports Squad Forge</b> — spin a random
                team, draft one real player at a time, and build your ultimate
                starting eleven. <b className="text-text-primary font-semibold">Easy to learn, brutal to master.</b> Every
                rejected name stings a little.
              </p>
              <div className="flex flex-wrap gap-3.5 mt-8">
                <Link
                  href={activeSport?.href ?? "/football/create"}
                  className="btn-glow inline-flex items-center gap-2.5 font-display font-extrabold text-[15px] px-6 py-3.5 rounded-full bg-accent text-[#06120a] transition-transform hover:-translate-y-[3px]"
                >
                  Start your draft
                  <ArrowRight className="w-[18px] h-[18px]" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2.5 font-display font-extrabold text-[15px] px-6 py-3.5 rounded-full bg-white/5 text-text-primary border border-border transition-transform hover:-translate-y-[3px] hover:bg-white/10"
                >
                  See how it works
                </a>
              </div>
              <div className="flex flex-wrap gap-6 mt-9">
                {[
                  { n: "1", l: "Sport live" },
                  { n: "5", l: "Top leagues" },
                  { n: "50+", l: "Nations" },
                ].map((m, idx) => (
                  <div key={m.l} className="flex items-center gap-6">
                    {idx > 0 && <span className="w-px self-stretch bg-border" />}
                    <div className="flex flex-col">
                      <span className="font-heavy text-[28px] leading-none text-text-primary">
                        {m.n}
                      </span>
                      <span className="text-[12.5px] text-text-muted font-semibold mt-1.5">
                        {m.l}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item}>
              <HeroWheel />
            </motion.div>
          </motion.div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-mask overflow-hidden border-y border-border py-4 my-6">
          <div className="flex gap-11 w-max animate-marquee">
            {[...MARQUEE, ...MARQUEE].map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="inline-flex items-center gap-11 font-display font-extrabold text-base tracking-wide uppercase text-text-muted whitespace-nowrap"
              >
                {label}
                <span className="text-accent text-[9px]">●</span>
              </span>
            ))}
          </div>
        </div>

        {/* SPORTS */}
        <section id="sports" className="py-20 sm:py-24">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-[640px] mb-12"
          >
            <Eyebrow>Multi-sport platform</Eyebrow>
            <h2 className="font-heavy uppercase leading-[1.02] tracking-tight text-[clamp(30px,4vw,50px)] mt-4">
              One draft engine. Every sport you love.
            </h2>
            <p className="mt-4 text-[17px] text-text-secondary leading-relaxed">
              Football is live and free to play right now. The same spin-and-build
              loop is coming to five more sports.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* featured */}
            {activeSport && (
              <motion.div
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="sm:col-span-2 lg:col-span-3 relative overflow-hidden rounded-card border border-border-strong p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8"
                style={{
                  background: "linear-gradient(120deg, var(--color-surface-elevated), var(--color-surface))",
                }}
              >
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.16),transparent_70%)]" />
                <div className="text-[56px] relative z-[2]">{activeSport.icon}</div>
                <div className="flex-1 relative z-[2]">
                  <span className="inline-block font-display font-bold text-[11px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-accent text-[#06120a] mb-3">
                    Active
                  </span>
                  <h3 className="font-display font-extrabold text-[26px] text-text-primary">
                    {activeSport.name}
                  </h3>
                  <p className="mt-1.5 text-[15.5px] text-text-secondary max-w-[46ch]">
                    Spin clubs, nations, or the full World Cup 2026 field. Pick real
                    players against EA FC 26-accurate ratings and forge a complete XI.
                  </p>
                </div>
                <Link
                  href={activeSport.href!}
                  className="relative z-[2] shrink-0 inline-flex items-center gap-2.5 font-display font-extrabold text-[15px] px-6 py-3.5 rounded-full bg-accent text-[#06120a] transition-transform hover:-translate-y-[3px]"
                  style={{ boxShadow: "0 10px 30px -8px rgba(74,222,128,.55)" }}
                >
                  Start Draft
                  <ArrowRight className="w-[18px] h-[18px]" />
                </Link>
              </motion.div>
            )}

            {/* soon */}
            {comingSoon.map((sport, i) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.05, duration: 0.4 }}
                className="relative cursor-pointer rounded-card p-6 bg-surface border border-border min-h-[172px] flex flex-col transition-transform hover:-translate-y-1 hover:border-border-strong"
              >
                <span className="absolute top-5 right-5 font-display font-bold text-[11px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-white/[0.06] text-text-muted border border-border">
                  Soon
                </span>
                <div className="text-[40px] mb-3.5 grayscale opacity-85">{sport.icon}</div>
                <h3 className="font-display font-extrabold text-[21px] text-text-primary">
                  {sport.name}
                </h3>
                <p className="mt-1.5 text-sm text-text-secondary flex-1">
                  {sport.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* STATS BAND */}
        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="pb-20 sm:pb-24"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-card border border-border-strong overflow-hidden bg-border">
            {[
              { n: "1", l: "Sport live" },
              { n: "5", l: "Top leagues" },
              { n: "50+", l: "Nations" },
              { n: "11", l: "Slots per XI" },
            ].map((s) => (
              <div
                key={s.l}
                className="px-6 py-8 text-center"
                style={{ background: "linear-gradient(120deg, var(--color-surface), var(--color-bg-2))" }}
              >
                <div
                  className="font-heavy text-[clamp(36px,5vw,54px)] leading-none"
                  style={{
                    background: "linear-gradient(180deg,#4ade80,#10b981)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {s.n}
                </div>
                <div className="mt-2.5 text-[13px] font-semibold tracking-wider uppercase text-text-secondary">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-20 sm:py-24 scroll-mt-20">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-[640px] mx-auto text-center mb-12"
          >
            <Eyebrow center>How it works</Eyebrow>
            <h2 className="font-heavy uppercase leading-[1.02] tracking-tight text-[clamp(30px,4vw,50px)] mt-4">
              Three clicks to a complete XI
            </h2>
            <p className="mt-4 text-[17px] text-text-secondary leading-relaxed">
              One draw, one squad, one decision at a time. A minute to learn, a
              lifetime to master.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="relative cursor-pointer overflow-hidden rounded-card p-7 bg-surface border border-border transition-transform hover:-translate-y-1 hover:border-border-strong"
              >
                <div className="font-heavy text-[15px] w-10 h-10 rounded-xl grid place-items-center bg-accent/[0.12] text-accent border border-border-strong">
                  0{i + 1}
                </div>
                <div className="my-5 text-accent">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display font-extrabold text-xl text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] text-text-secondary leading-relaxed">
                  {step.body}
                </p>
                <span className="absolute right-3.5 -bottom-6 font-heavy text-[130px] leading-none text-white/[0.03] pointer-events-none">
                  {i + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20 sm:py-24">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-[640px] mb-12"
          >
            <Eyebrow>Built for football fans</Eyebrow>
            <h2 className="font-heavy uppercase leading-[1.02] tracking-tight text-[clamp(30px,4vw,50px)] mt-4">
              Everything you need to settle the debate
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.06, duration: 0.4 }}
                className={`group cursor-pointer rounded-card p-6 border transition-all hover:-translate-y-1 flex flex-col ${
                  f.accent
                    ? "sm:col-span-2 border-border-strong"
                    : "bg-surface border-border hover:border-border-strong hover:bg-surface-elevated"
                }`}
                style={
                  f.accent
                    ? {
                        background:
                          "linear-gradient(140deg, rgba(74,222,128,0.14), var(--color-surface))",
                      }
                    : undefined
                }
              >
                <div
                  className={`w-[46px] h-[46px] rounded-[13px] grid place-items-center mb-4 border border-border-strong ${
                    f.accent ? "bg-accent text-[#06120a]" : "bg-accent/10 text-accent"
                  }`}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-[19px] text-text-primary">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14.5px] text-text-secondary leading-relaxed">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 sm:py-24">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-[640px] mx-auto text-center mb-12"
          >
            <Eyebrow center>FAQ</Eyebrow>
            <h2 className="font-heavy uppercase leading-[1.02] tracking-tight text-[clamp(30px,4vw,50px)] mt-4">
              Common questions
            </h2>
          </motion.div>
          <div className="max-w-[820px] mx-auto">
            <FaqAccordion />
          </div>
        </section>

        {/* CTA */}
        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="pb-24"
        >
          <div className="relative overflow-hidden rounded-[26px] border border-border-strong px-8 sm:px-12 py-16 text-center"
            style={{ background: "linear-gradient(130deg, var(--color-surface-elevated), var(--color-bg-2))" }}
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(600px_300px_at_20%_0%,rgba(74,222,128,0.18),transparent_60%),radial-gradient(500px_300px_at_90%_100%,rgba(16,185,129,0.16),transparent_60%)]" />
            <div className="relative z-[2]">
              <Eyebrow center>Ready?</Eyebrow>
              <h2 className="font-heavy uppercase leading-none tracking-tight text-[clamp(32px,4.6vw,58px)] mt-4">
                Forge your ultimate XI
              </h2>
              <p className="mt-5 mx-auto max-w-[52ch] text-[17px] text-text-secondary">
                Pick a formation, spin the wheel, and see whether your squad
                knowledge can build a team that actually holds up.
              </p>
              <Link
                href={activeSport?.href ?? "/football/create"}
                className="btn-glow inline-flex items-center gap-2.5 font-display font-extrabold text-[15px] px-7 py-3.5 rounded-full bg-accent text-[#06120a] mt-8 transition-transform hover:-translate-y-[3px]"
              >
                Start your draft
                <ArrowRight className="w-[18px] h-[18px]" />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
