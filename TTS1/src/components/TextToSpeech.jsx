"use client"

import { useState, useEffect, useCallback } from "react"

function TextToSpeech() {
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [text, setText] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0])
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    // Cleanup
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [selectedVoice])

  // Handle Chrome's speech synthesis behavior
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.speechSynthesis.cancel()
    }
  }, [])

  const handleSpeak = useCallback(() => {
    if (!selectedVoice || !text) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event)
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }, [selectedVoice, text, rate, pitch, volume])

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-card">
      <h2 className="text-xl font-bold mb-2">Text-to-Speech</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 p-2 border rounded bg-background text-foreground"
        placeholder="Enter text to speak"
      />
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <select
            value={selectedVoice?.name || ""}
            onChange={(e) => {
              const voice = voices.find((v) => v.name === e.target.value)
              setSelectedVoice(voice || null)
            }}
            className="p-2 border rounded bg-background text-foreground"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col">
            Rate:
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-muted-foreground">{rate}x</span>
          </label>

          <label className="flex flex-col">
            Pitch:
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-muted-foreground">{pitch}</span>
          </label>

          <label className="flex flex-col">
            Volume:
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={isSpeaking ? handleStop : handleSpeak}
          disabled={!text || !selectedVoice}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {isSpeaking ? "Stop" : "Speak"}
        </button>
      </div>
    </div>
  )
}

export default TextToSpeech

