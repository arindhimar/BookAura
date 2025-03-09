"use client"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Bookmark, BookmarkCheck, Headphones, Volume2, VolumeX, Play, Pause, Rewind, FastForward } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Slider } from "./ui/slider"
import { Card, CardContent } from "./ui/card"

export default function BookDetailsComponent({ book }) {
  const [isBookmarked, setIsBookmarked] = useState(undefined)
  const [selectedLanguage, setSelectedLanguage] = useState("english") // Default language
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioVolume, setAudioVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showAudioControls, setShowAudioControls] = useState(false)
  const audioRef = useRef(null)

  const handleBookmarks = async () => {
    try {
      const method = isBookmarked ? "DELETE" : "POST"
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${book?.book_id}/user`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) throw new Error("Bookmark update failed")

      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error("Error updating bookmark:", error)
    }
  }

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${book?.book_id}/user`, {
          headers: { Authorization: `${localStorage.getItem("token")}` },
          method: "GET",
        })

        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.is_bookmarked)
        }
      } catch (error) {
        console.error("Error fetching bookmark status:", error)
      }
    }

    if (book) fetchBookmarkStatus()
  }, [book])

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current

    if (audio) {
      const updateProgress = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100)
          setCurrentTime(audio.currentTime)
        }
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setAudioProgress(0)
        setCurrentTime(0)
      }

      const handleLoadedMetadata = () => {
        setDuration(audio.duration)
      }

      audio.addEventListener("timeupdate", updateProgress)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)

      return () => {
        audio.removeEventListener("timeupdate", updateProgress)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }
  }, [])

  // Update audio volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : audioVolume
    }
  }, [audioVolume, isMuted])

  // Update playback rate when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const addView = () => {
    // Implementation for addView function
    console.log("addView function called")
  }

  const addReadingHistory = () => {
    // Implementation for addReadingHistory function
    console.log("addReadingHistory function called")
  }

  const handleReadNow = async () => {
    try {
      const filePath = book.fileUrl.replace("uploads/", "")

      // Append the selected language as a query parameter
      const language = selectedLanguage
      const url = `${import.meta.env.VITE_BASE_API_URL}/books/${filePath}?language=${language}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      window.open(url, "_blank", "noopener, noreferrer")
      addView()
      addReadingHistory()
    } catch (err) {
      console.error("Error fetching PDF:", err)
    }
  }

  const getAudioUrl = () => {
    if (!book.audioUrl) return null

    const baseUrl = book.audioUrl.replace("audio_uploads/", "")

    if (selectedLanguage === "english") {
      return `${import.meta.env.VITE_BASE_API_URL}/books/audio/${baseUrl}`
    }

    const langCode = selectedLanguage === "hindi" ? "hi" : "mr"
    const lastDotIndex = baseUrl.lastIndexOf(".")
    const urlWithoutExt = baseUrl.substring(0, lastDotIndex)
    const extension = baseUrl.substring(lastDotIndex)

    return `${import.meta.env.VITE_BASE_API_URL}/books/audio/${urlWithoutExt}_${langCode}${extension}`
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      try {
        const audioUrl = getAudioUrl()
        if (audio.src !== audioUrl) {
          audio.src = audioUrl
          setAudioProgress(0)
          setCurrentTime(0)
        }

        await audio.play()
        setIsPlaying(true)
      } catch (err) {
        console.error("Error playing audio:", err)
        console.error("Audio source:", audio.src)
      }
    }
  }

  const handleListenNow = () => {
    setShowAudioControls(true)
    togglePlayPause()
  }

  const handleProgressChange = (value) => {
    if (!audioRef.current || !duration) return

    const newTime = (value[0] / 100) * duration
    audioRef.current.currentTime = newTime
    setAudioProgress(value[0])
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value) => {
    const newVolume = value[0]
    setAudioVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const skipBackward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
  }

  const skipForward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
  }

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate)
  }

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return "0:00"

    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const hasAudio = book && book.audioUrl

  if (!book) {
    return <p className="text-center text-red-500">Book not found.</p>
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Book Cover */}
        <motion.div className="md:col-span-1 flex flex-col items-center">
          <img
            src={
              book.cover ||
              "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg" ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt={book.title}
            className="w-full max-w-xs rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </motion.div>

        {/* Book Details */}
        <motion.div className="md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <p className="text-xl text-muted-foreground mt-2">{book.author_name || "Unknown Author"}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleBookmarks} className="ml-4">
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {book.categories ? (
              book.categories.split(",").map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category.trim()}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No Category</Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-8">{book.description}</p>

          {/* Action Buttons - Moved below description */}
          <div className="space-y-4 mb-8">
            {/* Language Selection Dropdown */}
            <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value)}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="marathi">Marathi</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-4">
              <Button className="hover:bg-primary/90 transition-colors duration-300" onClick={handleReadNow}>
                Continue Reading
              </Button>

              {/* Audio player */}
              <audio ref={audioRef} className="hidden" />

              {hasAudio && (
                <Button
                  variant={isPlaying ? "secondary" : "outline"}
                  className="transition-colors duration-300 flex items-center justify-center gap-2"
                  onClick={handleListenNow}
                >
                  <Headphones className="h-4 w-4" />
                  {isPlaying ? "Pause Audio" : "Listen Now"}
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Audio Player - Only shown after Listen Now is clicked */}
          {hasAudio && showAudioControls && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Audio Player</h3>

                  {/* Time and Progress */}
                  <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  {/* Progress Slider */}
                  <Slider
                    value={[audioProgress]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={handleProgressChange}
                    className="mb-6"
                  />

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      {/* Volume Control */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={toggleMute}>
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isMuted ? "Unmute" : "Mute"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Slider
                        value={[isMuted ? 0 : audioVolume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-24"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={skipBackward}>
                              <Rewind className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rewind 10s</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={skipForward}>
                              <FastForward className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Forward 10s</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Playback Speed */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Speed:</span>
                      <Select
                        value={playbackRate.toString()}
                        onValueChange={(value) => changePlaybackRate(Number.parseFloat(value))}
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue placeholder="1x" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

