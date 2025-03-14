import React, { useState, useEffect, useRef } from "react";
import EasySpeech from "easy-speech";

const TextToSpeech = () => {
  const [text, setText] = useState(
    "हे एक उदाहरण आहे जे हिंदी आणि मराठीत टेक्स्ट टू स्पीच डेमो करते. आपण इंग्रजी किंवा इतर भाषांमध्ये देखील हे ऐकू शकता."
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  const speechRef = useRef(null);

  // Initialize EasySpeech and fetch voices
  useEffect(() => {
    EasySpeech.init({ maxTimeout: 5000 })
      .then(() => {
        console.log("EasySpeech initialized");
        const availableVoices = EasySpeech.voices();
        setVoices(availableVoices);

g        const defaultVoice =
          availableVoices.find((voice) => voice.lang === "mr-IN") ||
          availableVoices.find((voice) => voice.lang === "hi-IN") ||
          availableVoices.find((voice) => voice.lang === "en-US");
        setSelectedVoice(defaultVoice || null);
      })
      .catch((err) => console.error("EasySpeech failed to initialize:", err));
      // Log all available voices to see if Marathi (mr-IN) is listed
const voices = window.speechSynthesis.getVoices();
console.log(voices);

  }, []);

  const speakText = () => {
    if (!text.trim()) {
      alert("Please enter text to speak!");
      return;
    }

    if (!selectedVoice) {
      alert("Please select a voice!");
      return;
    }

    setIsSpeaking(true);
    setHighlightedText("");
    setIsPaused(false);

    // Split text into chunks to handle longer inputs
    const textChunks = splitTextIntoChunks(text, 200); // Chunk size is 200 characters

    let currentChunkIndex = 0;

    const speakNextChunk = () => {
      if (currentChunkIndex >= textChunks.length) {
        setIsSpeaking(false);
        return;
      }

      const chunk = textChunks[currentChunkIndex];
      const speech = new SpeechSynthesisUtterance(chunk);
      speech.voice = selectedVoice;
      speech.lang = selectedVoice.lang;

      // Highlight words as they are spoken
      speech.onboundary = (event) => {
        if (event.name === "word") {
          const word = chunk.slice(event.charIndex, event.charIndex + event.charLength);
          setHighlightedText(word);
        }
      };

      speech.onend = () => {
        currentChunkIndex++;
        speakNextChunk();
      };

      speech.onerror = (err) => {
        console.error("Speech error:", err);
        setIsSpeaking(false);
      };

      setCurrentUtterance(speech); // Store current utterance for pause/resume/stop
      window.speechSynthesis.speak(speech);
    };

    speakNextChunk();
  };

  const stopSpeaking = () => {
    try {
      if (currentUtterance) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setHighlightedText("");
      }
    } catch (err) {
      console.error("Error stopping speech: ", err);
    }
  };

  const pauseSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (window.speechSynthesis.paused && !isSpeaking) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const splitTextIntoChunks = (text, maxLength) => {
    const words = text.split(" ");
    const chunks = [];
    let currentChunk = "";

    words.forEach((word) => {
      if ((currentChunk + word).length <= maxLength) {
        currentChunk += ` ${word}`;
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      }
    });

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Text to Speech with Multi-Language Support</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="5"
        cols="50"
        placeholder="Enter text to read..."
        style={{
          width: "100%",
          marginBottom: "10px",
          padding: "10px",
          fontSize: "16px",
        }}
      />

      {/* Language/Voice Selection Dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="voice-select">Choose a language/voice: </label>
        <select
          id="voice-select"
          onChange={(e) =>
            setSelectedVoice(voices.find((voice) => voice.name === e.target.value))
          }
          value={selectedVoice?.name || ""}
          style={{ padding: "5px", fontSize: "14px" }}
        >
          <option value="" disabled>
            Select a voice
          </option>
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          onClick={speakText}
          disabled={isSpeaking || !selectedVoice}
          style={{ marginRight: "10px" }}
        >
          {isSpeaking ? "Speaking..." : "Speak"}
        </button>
        <button onClick={pauseSpeaking} disabled={!isSpeaking || isPaused}>
          Pause
        </button>
        <button onClick={resumeSpeaking} disabled={isSpeaking || !isPaused}>
          Resume
        </button>
        <button onClick={stopSpeaking} disabled={!isSpeaking}>
          Stop
        </button>
      </div>

      {/* Display highlighted text */}
      <div style={{ marginTop: "20px", fontSize: "18px" }}>
        <strong>Currently Speaking:</strong>{" "}
        <span style={{ color: "blue" }}>{highlightedText}</span>
      </div>
    </div>
  );
};

export default TextToSpeech;
