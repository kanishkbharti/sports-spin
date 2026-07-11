"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
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
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

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
    title: "Accurate ratings",
    body: "Every player carries an EA FC 26-accurate overall, so a pick actually means something.",
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

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className="rounded-[16px] glass border border-border overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-hover/40 transition-colors"
            >
              <span className="font-display font-semibold text-sm sm:text-base text-text-primary">
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-accent" : ""
                }`}
              />
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
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
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden noise-overlay">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/4 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/4 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="mb-12 max-w-2xl">
            <Logo size={56} className="block mb-6" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">
                Multi-Sport Draft Platform
              </span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] mb-4">
              <span className="text-gradient-accent">Squadr</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Home of Sports Squad Forge. Spin a random team, draft one real
              player at a time, and forge your ultimate starting XI. A fast,
              replayable draft game for people who actually know their squads.
            </p>
          </motion.div>

          {/* Active sport — featured */}
          {activeSport && (
            <motion.div variants={item} className="mb-10">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Now Live
              </p>
              <Link href={activeSport.href!}>
                <motion.div
                  whileHover={{ y: -3 }}
                  className="group relative p-6 sm:p-8 rounded-[20px] glass-strong border border-accent/20 overflow-hidden cursor-pointer"
                  style={{ borderLeftWidth: 4, borderLeftColor: activeSport.accent }}
                >
                  <div
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
                    style={{ background: activeSport.accent }}
                  />
                  <div className="relative flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <span className="text-4xl">{activeSport.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary">
                            {activeSport.name}
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">{activeSport.description}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-accent text-bg font-semibold text-sm group-hover:brightness-110 transition-all">
                      Start Draft
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* Coming soon grid */}
          <motion.div variants={item}>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
              Coming Soon
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {comingSoon.map((sport, i) => (
                <motion.div
                  key={sport.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="relative p-5 rounded-[18px] glass border border-border opacity-60"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl grayscale">{sport.icon}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-surface-elevated text-text-muted">
                      <Lock className="w-2.5 h-2.5" />
                      Soon
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-text-primary mb-1">
                    {sport.name}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">{sport.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-16 grid grid-cols-3 gap-8 sm:gap-16 border-t border-border pt-10"
          >
            {[
              { value: "1", label: "Sport Live" },
              { value: "5", label: "Top Leagues" },
              { value: "50+", label: "Nations" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="font-display font-bold text-2xl text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
            How it works
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary mb-3">
            Three clicks to a complete XI
          </h2>
          <p className="text-text-secondary max-w-2xl mb-8 leading-relaxed">
            One draw, one squad, one decision at a time. Easy to learn in a minute,
            hard to master. Every rejected name stings a little.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="relative p-6 rounded-[18px] glass border border-border"
              >
                <span className="absolute top-5 right-5 font-display font-bold text-4xl text-white/5">
                  {i + 1}
                </span>
                <div className="w-11 h-11 rounded-[12px] bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
            Built for football fans
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary mb-8">
            Everything you need to settle the debate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.06, duration: 0.4 }}
                className="group p-5 rounded-[16px] glass border border-border hover:border-accent/20 transition-colors"
              >
                <div className="w-9 h-9 rounded-[10px] bg-surface-elevated flex items-center justify-center mb-3 group-hover:bg-accent/10 transition-colors">
                  <f.icon className="w-[18px] h-[18px] text-text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-base text-text-primary mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
            FAQ
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary mb-8">
            Common questions
          </h2>
          <div className="max-w-3xl">
            <FaqAccordion />
          </div>
        </motion.section>

        {/* Final CTA */}
        {activeSport && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-24"
          >
            <div className="relative p-8 sm:p-12 rounded-[24px] glass-strong border border-accent/20 overflow-hidden text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
              <div className="relative">
                <h2 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight mb-3">
                  <span className="text-gradient">Ready to </span>
                  <span className="text-gradient-accent">forge your XI?</span>
                </h2>
                <p className="text-text-secondary max-w-xl mx-auto mb-7 leading-relaxed">
                  Pick a formation, spin the wheel, and see whether your squad
                  knowledge can build a team that actually holds up.
                </p>
                <Link href={activeSport.href!}>
                  <motion.span
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-glow inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] bg-accent text-bg font-semibold text-sm"
                  >
                    Start your draft
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
