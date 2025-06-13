"use client"

import Navbar from "@/components/global/navbar"
import Footer from "@/components/global/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Bot, MessageSquare, TrendingUp } from "lucide-react"
// Placeholder for scroll-jacking sections
// import HeroSection from '@/app/landing/hero-section';
// import FeaturesScrollSection from '@/app/landing/features-scroll-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Section 1: Hero */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              Meet <span className="text-primary">clever</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your everyday Financial LLM Assistant. Making smart money decisions, simplified.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/auth/signup">
                  Try clever Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Free to start. No credit card required.</p>
          </div>
        </section>

        {/* Placeholder for Scroll Jacking Section 1 */}
        <section
          id="scroll-section-1"
          className="py-16 md:py-24 min-h-[60vh] flex items-center justify-center text-center bg-background"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Personal Financial Co-pilot</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Navigate your finances with an AI that understands you.
              {/* Add animation placeholder here */}
            </p>
          </div>
        </section>

        {/* Placeholder for Scroll Jacking Section 2: Animated Chat Preview */}
        <section
          id="scroll-section-2"
          className="py-16 md:py-24 min-h-[70vh] flex items-center justify-center bg-muted/30"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">clever's Got You Covered</h2>
            <div className="max-w-md mx-auto bg-background p-6 rounded-lg shadow-xl border">
              <p className="text-left text-sm font-semibold mb-2">Ask clever anything:</p>
              <div className="h-24 border rounded p-2 text-left text-muted-foreground overflow-hidden relative">
                {/* This would be an animated typing effect */}
                <p className="animate-typing1">How do I plan for my retirement?</p>
                {/* <p className="animate-typing2">What's my biggest hidden cost?</p> */}
                {/* <p className="animate-typing3">Is now a good time to invest?</p> */}
                <style jsx>{`
                  /* Basic placeholder for typing animation */
                  @keyframes typing { from { width: 0 } to { width: 100% } }
                  @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: orange; } }
                  .animate-typing1 {
                    overflow: hidden;
                    border-right: .15em solid orange;
                    white-space: nowrap;
                    margin: 0 auto;
                    letter-spacing: .05em;
                    animation: typing 3.5s steps(40, end) 1s 1 normal both,
                               blink-caret .75s step-end infinite;
                  }
                `}</style>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Get instant, personalized financial insights.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why clever?</h2>
              <p className="text-lg text-muted-foreground mt-2">Unlock your financial potential.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <Bot className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Personalized AI Guidance</h3>
                <p className="text-muted-foreground">
                  Tailored advice based on your unique financial situation and goals.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Voice & Chat Assistant</h3>
                <p className="text-muted-foreground">
                  Interact via intuitive voice calls or chat. Your finances, your way.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Actionable Strategies</h3>
                <p className="text-muted-foreground">
                  Clear, actionable steps for savings, investments, and debt management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-muted/30" id="pricing">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground mt-2">Get started for free. Upgrade when you're ready.</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8">
              <div className="flex-1 max-w-md lg:max-w-none bg-background p-8 rounded-lg shadow-lg border flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">Free Tier</h3>
                <p className="text-muted-foreground mb-6">Basic financial insights via chat.</p>
                <ul className="space-y-2 mb-8 text-muted-foreground flex-grow">
                  <li>✓ AI Chat-based Financial Advice</li>
                  <li>✓ Savings Rate Suggestions</li>
                  <li>✓ Basic Investment Allocation</li>
                  <li>✓ Debt Payoff Strategy Overview</li>
                </ul>
                <Button variant="outline" className="w-full" disabled>
                  Currently Active
                </Button>
              </div>
              <div className="flex-1 max-w-md lg:max-w-none bg-primary text-primary-foreground p-8 rounded-lg shadow-lg border border-primary flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">clever Plus</h3>
                <p className="mb-1">
                  <span className="text-4xl font-bold">$4.99</span>/month
                </p>
                <p className="opacity-80 mb-6">Unlock the full power of clever.</p>
                <ul className="space-y-2 mb-8 opacity-90 flex-grow">
                  <li>✓ Everything in Free, plus:</li>
                  <li>✓ **Voice Calls with Financial Assistant**</li>
                  <li>✓ Personalized Spending Challenges</li>
                  <li>✓ Accountability Check-ins</li>
                  <li>✓ Deeper Financial Analysis</li>
                  <li>✓ Priority Support</li>
                </ul>
                <Button
                  variant="secondary"
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Upgrade to Plus (Coming Soon)
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              clever is not a registered investment, legal or tax advisor or a broker/dealer. All investment / financial
              opinions expressed by clever are from the personal research and experience of the AI model and are
              intended as educational material.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
