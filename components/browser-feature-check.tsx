"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"

export function BrowserFeatureCheck() {
  const [checkComplete, setCheckComplete] = useState(false)
  const [issues, setIssues] = useState<string[]>([])

  useEffect(() => {
    const featureIssues: string[] = []

    // Check audio support
    if (typeof Audio === "undefined") {
      featureIssues.push("Audio is not supported in your browser")
    }

    // Check localStorage support
    try {
      localStorage.setItem("test", "test")
      localStorage.removeItem("test")
    } catch (e) {
      featureIssues.push("Local storage is disabled or not supported")
    }

    // Only check for very small screens
    if (window.innerWidth < 280 || window.innerHeight < 400) {
      featureIssues.push("Your screen size is very small and may affect gameplay")
    }

    setIssues(featureIssues)
    setCheckComplete(true)
  }, [])

  if (!checkComplete || issues.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-yellow-500/30 p-4 z-40">
      <div className="flex items-start gap-3 max-w-md mx-auto">
        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-yellow-500 mb-1">Warning:</p>
          <ul className="list-disc ml-5 text-sm text-gray-300">
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
