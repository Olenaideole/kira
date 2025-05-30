import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function ExampleReport() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">See how KIRA reveals your life map</h2>
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-purple-300">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-xl font-semibold">Your Life Energy Today</h3>
              </div>

              <div className="space-y-4 text-gray-200">
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Health Focus</h4>
                  <p className="text-sm">Strong vitality indicated by your life line</p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-300 mb-1">Business Potential</h4>
                  <p className="text-sm">Career line shows promising developments</p>
                </div>

                <div>
                  <h4 className="font-semibold text-pink-300 mb-1">Relationships Insight</h4>
                  <p className="text-sm">Heart line suggests emotional openness</p>
                </div>

                <div>
                  <h4 className="font-semibold text-yellow-300 mb-1">Family Advice</h4>
                  <p className="text-sm">Family harmony is strongly favored</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Sample Daily Insight</h4>
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "Today's Energy: Strong and focused. Expect clarity in business matters. Pay attention to your heart
                space in personal connections. Stretch and rest your hands — minor muscle tension possible."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
