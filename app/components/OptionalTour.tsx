'use client';

import { useState, useEffect } from 'react';

export default function OptionalTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = [
    {
      title: "Welcome to iPurpose",
      description: "Let's help you find clarity and turn it into action.",
      cta: "Start Tour"
    },
    {
      title: "Discover",
      description: "Explore the iPurpose approach: how Soul, Systems, and AI work together to help you build what truly matters.",
      link: "/discover",
      linkText: "Explore Discover"
    },
    {
      title: "Clarity Check",
      description: "Take a 2-minute assessment to understand where you are right now. It's the foundation for everything.",
      link: "/clarity-check",
      linkText: "Take Clarity Check"
    },
    {
      title: "Starter Pack",
      description: "Get foundational tools and exercises to begin your clarity journey with practical structure.",
      link: "/starter-pack",
      linkText: "Explore Starter Pack"
    },
    {
      title: "AI Blueprint",
      description: "Let AI help you build a personalized action plan based on your unique situation.",
      link: "/ai-blueprint",
      linkText: "Create Your Blueprint"
    },
    {
      title: "Ready to Begin?",
      description: "The best place to start is the Clarity Check. It takes just 2 minutes and sets the foundation for everything else.",
      link: "/clarity-check",
      linkText: "Start Now"
    }
  ];

  if (!mounted) return null;

  if (!isOpen) {
    return (
      <div className="w-full bg-gradient-to-r from-lavenderViolet/10 to-salmonPeach/10 border-b border-lavenderViolet/20 px-4 sm:px-6 lg:px-12 py-4 sm:py-5" style={{ position: 'relative', zIndex: 20 }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-xs sm:text-sm font-marcellus" style={{ color: '#FFFFFF' }}>
            New here? Most people start with the <a href="/clarity-check" className="text-lavenderViolet hover:text-salmonPeach transition-colors underline font-semibold">Clarity Check</a>
          </p>
          <button
            onClick={() => {
              setIsOpen(true);
              setCurrentStep(0);
            }}
            className="ml-4 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.7))', color: '#FFFFFF' }}
          >
            Take Tour
          </button>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 md:p-12">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-warmCharcoal/50 hover:text-warmCharcoal transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className="h-1.5 rounded-full transition-all"
              style={{
                background: index <= currentStep ? '#9C88FF' : '#E5E7EB',
                flex: index === currentStep ? 2 : 1
              }}
            />
          ))}
        </div>

        {/* Content */}
        <h2 className="text-2xl md:text-3xl font-italiana mb-4" style={{ color: '#5B4BA6' }}>
          {step.title}
        </h2>
        <p className="text-base md:text-lg text-warmCharcoal/70 mb-8 leading-relaxed font-marcellus">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="flex-1 px-4 py-3 rounded-full font-marcellus text-sm transition-all hover:opacity-80 border border-lavenderViolet/30"
              style={{ color: '#9C88FF' }}
            >
              Back
            </button>
          )}

          {step.link ? (
            <a
              href={step.link}
              className="flex-1 px-4 py-3 rounded-full font-marcellus text-sm text-center transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.7))', color: '#FFFFFF' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {step.linkText}
            </a>
          ) : (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="flex-1 px-4 py-3 rounded-full font-marcellus text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.7))', color: '#FFFFFF' }}
            >
              {step.cta || 'Next'}
            </button>
          )}

          {!isLastStep && !step.link && (
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-full font-marcellus text-sm transition-all hover:opacity-80 border border-warmCharcoal/20"
              style={{ color: '#5B4BA6' }}
            >
              Skip
            </button>
          )}
        </div>

        {/* Step Counter */}
        <p className="text-xs text-warmCharcoal/50 text-center mt-6">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
