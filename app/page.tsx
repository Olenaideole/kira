"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FormSection } from "@/components/form-section"
import { ExampleReport } from "@/components/example-report"
import { PricingSection } from "@/components/pricing-section"
import { CtaBanner } from "@/components/cta-banner"
import { ReportDisplay } from "@/components/report-display"
import { FreeTrialBanner } from "@/components/free-trial-banner"

export default function LandingPage() {
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleReportGenerated = (report: string) => {
    console.log("handleReportGenerated called with:", report.substring(0, 100) + "...")
    setGeneratedReport(report)
  }

  const handleGeneratingChange = (generating: boolean) => {
    console.log("handleGeneratingChange called with:", generating)
    setIsGenerating(generating)
  }

  console.log("Current state - generatedReport:", !!generatedReport, "isGenerating:", isGenerating)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Starfield effect */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <Header />
        <FreeTrialBanner />
        <HeroSection />
        <FormSection onReportGenerated={handleReportGenerated} onGeneratingChange={handleGeneratingChange} />

        {generatedReport && (
          <div>
            <div className="text-center py-4">
              <p className="text-green-400">✓ Report generated successfully!</p>
            </div>
            <ReportDisplay report={generatedReport} />
          </div>
        )}

        {!generatedReport && !isGenerating && (
          <>
            <ExampleReport />
            <PricingSection />
          </>
        )}

        <CtaBanner />
      </div>
    </div>
  )
}
