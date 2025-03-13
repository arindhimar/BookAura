"use client"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  Bookmark,
  BookmarkCheck,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  MoreVertical,
  Eye,
  Share,
  Heart,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Slider } from "./ui/slider"
import { Card, CardContent } from "./ui/card"
import { Separator } from "./ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

export default function BookDetailsComponent({ book }) {
  const [isBookmarked, setIsBookmarked] = useState(undefined)
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioVolume, setAudioVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
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
        setIsAudioLoaded(true)
      }

      const handleLoadedData = () => {
        setIsAudioLoaded(true)
      }

      const handleError = (e) => {
        console.error("Audio error:", e)
        setIsAudioLoaded(false)
      }

      audio.addEventListener("timeupdate", updateProgress)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)
      audio.addEventListener("loadeddata", handleLoadedData)
      audio.addEventListener("error", handleError)

      return () => {
        audio.removeEventListener("timeupdate", updateProgress)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
        audio.removeEventListener("loadeddata", handleLoadedData)
        audio.removeEventListener("error", handleError)
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

  const addView = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books_views/book/${book.book_id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to add book view")
    } catch (error) {
      console.error("Error adding book view:", error)
    }
  }

  const addReadingHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/reading_history/book/${book.book_id}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to add book to history")
    } catch (error) {
      console.error("Error adding book to history:", error)
    }
  }

  const handleReadNow = async () => {
    try {
      const filePath = book.fileUrl.replace("uploads/", "")
      const language = selectedLanguage
      const url = `${import.meta.env.VITE_BASE_API_URL}/books/${filePath}?language=${language}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      window.open(url, "_blank", "noopener, noreferrer")
      await addView() // Add book view
      await addReadingHistory() // Add book to reading history
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
        if (!audio.src || audio.src !== audioUrl) {
          setIsAudioLoaded(false)
          audio.src = audioUrl
          audio.load()
          setAudioProgress(0)
          setCurrentTime(0)
        }

        await audio.play()
        setIsPlaying(true)
        await addView() // Add book view
        await addReadingHistory() // Add book to listening history
      } catch (err) {
        console.error("Error playing audio:", err)
      }
    }
  }

  const handleListenNow = () => {
    setShowAudioPlayer(true)
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
    if (isNaN(timeInSeconds) || timeInSeconds === undefined) return "0:00"

    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const shareBook = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out this book: ${book.title} by ${book.author_name}`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const hasAudio = book && book.audioUrl

  if (!book) {
    return <p className="text-center text-red-500">Book not found.</p>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover & Actions */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <div className="flex flex-col items-center">
              <img
                src={book.cover || "/placeholder.svg"}
                alt={book.title}
                className="w-full max-w-xs rounded-lg shadow-lg object-cover aspect-[2/3]"
              />

              <div className="w-full max-w-xs mt-6 space-y-4">
                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="marathi">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <Button onClick={handleReadNow} className="w-full">
                    Read Now
                  </Button>

                  {hasAudio && (
                    <Button variant={isPlaying ? "secondary" : "outline"} className="w-full" onClick={handleListenNow}>
                      <Headphones className="mr-2 h-4 w-4" />
                      {isPlaying ? "Pause" : "Listen"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <div className="flex items-center mt-2 text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span className="text-sm">{book.views || 0} views</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handleBookmarks} className="flex-shrink-0">
                {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleBookmarks}>
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                        <span>Remove Bookmark</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        <span>Add to Bookmarks</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      alert("Link copied to clipboard!")
                    }}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="h-4 w-4 mr-2" />
                    <span>Add to Favorites</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-xl text-muted-foreground mb-4">{book.author_name || "Unknown Author"}</p>

          {book.categories && (
            <div className="flex flex-wrap gap-2 mb-6">
              {book.categories.split(",").map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category.trim()}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="my-6" />

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">About this book</h2>
            <p className="text-muted-foreground">{book.description}</p>
          </div>

          {/* Audio player - hidden element */}
          <audio ref={audioRef} preload="metadata" className="hidden" />

          {/* Audio Player */}
          <AnimatePresence>
            {hasAudio && showAudioPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Audio Player</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (isPlaying) {
                            togglePlayPause()
                          }
                          setShowAudioPlayer(false)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Expanded Controls */}
                      <div className="space-y-2">
                        {/* Time Display */}
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{isAudioLoaded ? formatTime(duration) : "--:--"}</span>
                        </div>

                        {/* Progress Bar */}
                        <Slider
                          value={[audioProgress]}
                          min={0}
                          max={100}
                          step={0.1}
                          onValueChange={handleProgressChange}
                          disabled={!isAudioLoaded}
                        />
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        {/* Playback Speed */}
                        <div className="flex items-center">
                          <span className="text-sm mr-2">Speed:</span>
                          <Select
                            value={playbackRate.toString()}
                            onValueChange={(value) => changePlaybackRate(Number.parseFloat(value))}
                          >
                            <SelectTrigger className="h-8 w-20">
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

                        {/* Play Controls */}
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={skipBackward}>
                                  <SkipBack className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>10 seconds back</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Button
                            onClick={togglePlayPause}
                            disabled={!isAudioLoaded && !isPlaying}
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                          >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={skipForward}>
                                  <SkipForward className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>10 seconds forward</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={toggleMute}>
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <Slider
                            value={[isMuted ? 0 : audioVolume]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

