import { LandingHeader } from "@/components/home/LandingHeader";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface font-sans selection:bg-primary-100 selection:text-primary-900">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>

      {/* Simple Footer */}
      <footer className="py-8 bg-neutral-900 text-neutral-400 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Shadowing Ninja. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
