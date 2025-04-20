"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../hooks/use-toast"

const VoiceCommandContext = createContext()

export const useVoiceCommand = () => useContext(VoiceCommandContext)

export const VoiceCommandProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [inactivityTimer, setInactivityTimer] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setSupportsSpeechRecognition(true)
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = false
        recognitionInstance.lang = "en-US"

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase()
          setLastCommand(transcript)
          handleCommand(transcript)

          // Reset inactivity timer when speech is detected
          resetInactivityTimer()
        }

        recognitionInstance.onend = () => {
          if (isListening) {
            recognitionInstance.start()
          }
        }

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error", event.error)
          if (event.error === "no-speech") {
            // Don't show error for no speech, just let the inactivity timer handle it
          } else {
            toast({
              title: "Voice Command Error",
              description: `Error: ${event.error}`,
              variant: "destructive",
            })
            stopListening()
          }
        }

        setRecognition(recognitionInstance)
      }
    }

    // Listen for manual stop events
    window.addEventListener("stopVoiceCommand", handleStopVoiceCommand)

    return () => {
      window.removeEventListener("stopVoiceCommand", handleStopVoiceCommand)
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [])

  // Handle the stop voice command event
  const handleStopVoiceCommand = () => {
    stopListening()
  }

  // Reset the inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    const timer = setTimeout(() => {
      stopListening()
      toast({
        title: "Voice Command Inactive",
        description: "Stopped listening due to inactivity",
      })
    }, 5000) // 5 seconds of inactivity

    setInactivityTimer(timer)
  }

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start()
      setIsListening(true)
      resetInactivityTimer()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
        setInactivityTimer(null)
      }
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleCommand = (command) => {
    // Navigation commands
    if (command.includes("go to home") || command === "home") {
      navigate("/home")
    } else if (command.includes("go to browse") || command === "browse") {
      navigate("/browse")
    } else if (command.includes("go to categories") || command === "categories") {
      navigate("/categories")
    } else if (command.includes("go to library") || command === "my library") {
      navigate("/my-library")
    } else if (command.includes("log out") || command === "logout") {
      localStorage.removeItem("token")
      window.location.reload()
    }
    // Search commands
    else if (command.includes("search for")) {
      const searchTerm = command.replace("search for", "").trim()
      if (searchTerm) {
        // Dispatch a custom event with the search term
        const searchEvent = new CustomEvent("voiceSearch", {
          detail: { searchTerm },
        })
        window.dispatchEvent(searchEvent)
      }
    }
    // Toggle theme
    else if (command.includes("dark mode") || command === "dark theme") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else if (command.includes("light mode") || command === "light theme") {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
    // Stop listening command
    else if (command.includes("stop listening") || command === "stop") {
      stopListening()
    }
  }

  return (
    <VoiceCommandContext.Provider
      value={{
        isListening,
        lastCommand,
        toggleListening,
        startListening,
        stopListening,
        supportsSpeechRecognition,
      }}
    >
      {children}
    </VoiceCommandContext.Provider>
  )
}

export default VoiceCommandProvider
