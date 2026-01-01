"use client";

import { Button } from "@/components/ui/button";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface pt-16 pb-32 md:pt-24 lg:pt-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-600">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
              New: AI Shadowing Analysis
            </div>

            <h1 className="text-display-large font-bold text-neutral-900 tracking-tight leading-[1.1]">
              English Mastery <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-500">
                Personalized to You
              </span>
            </h1>

            <p className="text-headline-small text-neutral-500 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stop passively watching. Start actively speaking. Shadowing Ninja
              turns your favorite YouTube videos into interactive speaking
              lessons.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="scale-110 origin-left">
                <AuthSidePanel
                  triggerText="Start Learning for Free"
                  defaultMode="signup"
                />
              </div>
              {/* We override the button style in AuthSidePanel via props if needed, 
                                but since AuthSidePanel returns a specific button, we might need to adjust it.
                                Actually AuthSidePanel renders a trigger button. 
                                Let's wrap it or update AuthSidePanel to accept 'asChild' or custom button styling?
                                The current AuthSidePanel takes 'triggerText' and renders a Button variant='ghost'.
                                We might want a primary button here.
                             */}
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-neutral-400">
              {/* Social Proof / Trust Badges (Placeholders) */}
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-xs overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                      alt="User"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                Trusted by 10,000+ Learners
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary-100/50 to-orange-100/50 blur-[100px] rounded-full -z-10" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
              <img
                src="/landing_hero_3d.png"
                alt="Shadowing App Dashboard"
                className="w-full h-auto rounded-2xl bg-neutral-100 object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
