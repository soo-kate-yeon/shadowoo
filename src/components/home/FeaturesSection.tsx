"use client";

export function FeaturesSection() {
  const features = [
    {
      title: "Curated Content",
      description:
        "Learn from the best YouTube videos, hand-picked for learning English.",
      icon: (
        <svg
          className="w-6 h-6 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Sentence Loop",
      description:
        "Master difficult phrases by looping specific sentences until you get them right.",
      icon: (
        <svg
          className="w-6 h-6 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      title: "Voice Recording",
      description:
        "Record your voice and compare it with the original audio to perfect your accent.",
      icon: (
        <svg
          className="w-6 h-6 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-display-small font-bold text-neutral-900 mb-4">
            Why Shadowing Ninja?
          </h2>
          <p className="text-body-large text-neutral-500 max-w-2xl mx-auto">
            We provide the most effective tools to help you speak like a native.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-surface border border-neutral-100/50 hover:border-primary-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-headline-small font-semibold text-neutral-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-body-large text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
