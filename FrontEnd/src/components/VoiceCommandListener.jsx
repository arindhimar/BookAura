"use client"

import { useEffect, useState } from "react"
import { useVoiceCommand } from "../contexts/VoiceCommandContext"
import { AnimatePresence, motion } from "framer-motion"
import { Mic } from "lucide-react"

export default function VoiceCommandListener() {
  const { isListening, lastCommand } = useVoiceCommand()
  const [showFeedback, setShowFeedback] = useState(false)
  const [listenTimeout, setListenTimeout] = useState(null)

  useEffect(() => {
    if (lastCommand) {
      setShowFeedback(true)
      const timer = setTimeout(() => {
        setShowFeedback(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [lastCommand])

  useEffect(() => {
    if (isListening) {
      // Clear any existing timeout
      if (listenTimeout) {
        clearTimeout(listenTimeout)
      }

      // Set a new timeout to turn off listening after 5 seconds of inactivity
      const timeout = setTimeout(() => {
        // We need to call the stopListening function from the context
        if (typeof window !== "undefined") {
          const voiceCommandEvent = new CustomEvent("stopVoiceCommand")
          window.dispatchEvent(voiceCommandEvent)
        }
      }, 5000)

      setListenTimeout(timeout)
    }

    return () => {
      if (listenTimeout) {
        clearTimeout(listenTimeout)
      }
    }
  }, [isListening])

  if (!isListening && !showFeedback) return null

  return (
    <AnimatePresence>
      {(isListening || showFeedback) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-background border border-border shadow-lg rounded-full px-4 py-2 flex items-center space-x-3">
            {isListening && (
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <Mic className="h-5 w-5 text-primary" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
              </div>
            )}
            <span className="text-sm font-medium">
              {isListening ? "Listening..." : lastCommand ? `Command: "${lastCommand}"` : ""}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
