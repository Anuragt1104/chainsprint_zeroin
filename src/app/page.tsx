import { CallToAction } from "@/components/CallToAction";
import { Credibility } from "@/components/Credibility";
import { Hero } from "@/components/Hero";
import { SocialProof } from "@/components/SocialProof";
import { SprintDashboard } from "@/components/SprintDashboard";
import { ValuePillars } from "@/components/ValuePillars";
import { Roadmap } from "@/components/Roadmap";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10">
      <Hero />
      <ValuePillars />
      <SprintDashboard />
      <Credibility />
      <SocialProof />
      <Roadmap />
      <CallToAction />
      <footer className="pb-6 text-center text-xs text-slate-500">
        Crafted by Alenka Media for the Zerion Cypherpunk Hackathon · Built with Next.js 15, Turbopack, and Tailwind
      </footer>
    </main>
  );
}
