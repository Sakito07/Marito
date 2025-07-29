import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Upload, Volume2, VolumeX, Settings, Sparkles, Waves, Sun, Moon, Flower2, Coffee, Palette, Heart, Droplets, Briefcase, Star, Zap } from "lucide-react";
import Rain from "../assets/sounds/rain.mp3"

const THEMES = [
  {
    name: "pastel",
    label: "Pastel",
    colors: ["#ffd8d8", "#b7e4c7", "#d8b4fe"],
  },
  {
    name: "retro",
    label: "Retro",
    colors: ["#e2d5bc", "#ef9995", "#a4cbb4"],
  },
  {
    name: "coffee",
    label: "Coffee",
    colors: ["#20161F", "#A67C58", "#807666"],
  },
  {
    name: "forest",
    label: "Forest",
    colors: ["#171212", "#2B4C3F", "#6BAA75"],
  },
  {
    name: "cyberpunk",
    label: "Cyberpunk",
    colors: ["#FF00FF", "#00FFFF", "#FF7598"],
  },
  {
    name: "synthwave",
    label: "Synthwave",
    colors: ["#2D1B69", "#FF1E9E", "#1EDBFF"],
  },
  {
    name: "luxury",
    label: "Luxury",
    colors: ["#171618", "#B6862D", "#E2C697"],
  },
  {
    name: "autumn",
    label: "Autumn",
    colors: ["#D8B4A0", "#D27548", "#BA4A00"],
  },
  {
    name: "valentine",
    label: "Valentine",
    colors: ["#E96D7B", "#FF8FAB", "#FFB3C6"],
  },
  {
    name: "aqua",
    label: "Aqua",
    colors: ["#2DD4BF", "#06B6D4", "#0EA5E9"],
  },
  {
    name: "business",
    label: "Business",
    colors: ["#1C4E80", "#0091D5", "#7DB9DE"],
  },
  {
    name: "night",
    label: "Night",
    colors: ["#0F172A", "#334155", "#64748B"],
  },
  {
    name: "dracula",
    label: "Dracula",
    colors: ["#282A36", "#BD93F9", "#FF79C6"],
  },
];

const breathingPatterns = {
  '4-7-8': { name: '4-7-8 Relaxing', inhale: 4, hold: 7, exhale: 8 },
  '4-4-4': { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4 },
  '6-2-6': { name: 'Calm Focus', inhale: 6, hold: 2, exhale: 6 }
};

export default function EnhancedMeditationApp() {
  const [minutes, setMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [instructions, setInstructions] = useState("Ready to begin your mindful journey?");
  const [running, setRunning] = useState(false);
  const [customBackground, setCustomBackground] = useState(null);
  const [customAudio, setCustomAudio] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('night');

 
  const [showSettings, setShowSettings] = useState(false);
  
  const selectRef = useRef(null);
  const songRef = useRef(null);
  const completionSoundRef = useRef(null); 
  const outlineRef = useRef(null);
  const bgContainerRef = useRef(null);

  const getThemeIcon = (themeName) => {
    const iconMap = {
      pastel: <Palette className="w-4 h-4" />,
      retro: <Star className="w-4 h-4" />,
      coffee: <Coffee className="w-4 h-4" />,
      forest: <Flower2 className="w-4 h-4" />,
      cyberpunk: <Zap className="w-4 h-4" />,
      synthwave: <Waves className="w-4 h-4" />,
      luxury: <Sparkles className="w-4 h-4" />,
      autumn: <Sun className="w-4 h-4" />,
      valentine: <Heart className="w-4 h-4" />,
      aqua: <Droplets className="w-4 h-4" />,
      business: <Briefcase className="w-4 h-4" />,
      night: <Moon className="w-4 h-4" />,
      dracula: <Moon className="w-4 h-4" />
    };
    return iconMap[themeName] || <Palette className="w-4 h-4" />;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const createGradientFromColors = (colors) => {
    const gradientStops = colors.map((color, index) => {
      const percentage = (index / (colors.length - 1)) * 100;
      return `${color} ${percentage}%`;
    }).join(', ');
    return `linear-gradient(135deg, ${gradientStops})`;
  };

  const currentTheme = THEMES.find(theme => theme.name === selectedTheme) || THEMES[0];
  const accentColor = currentTheme.colors[currentTheme.colors.length - 1];


  const createCompletionSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.8;
    
   
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
  
    oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); 
    oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime);
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(isMuted ? 0 : volume * 0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + duration);
    oscillator2.stop(audioContext.currentTime + duration);
  };

 
  const getBackgroundStyle = () => {
    if (customBackground) {
      return {
        backgroundImage: `url(${URL.createObjectURL(customBackground)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else {
      return {
        backgroundImage: createGradientFromColors(currentTheme.colors),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
  };

  useEffect(() => {
    const outline = outlineRef.current;
    if (outline) {
      const length = outline.getTotalLength();
      outline.style.strokeDasharray = length;
      outline.style.strokeDashoffset = length;
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  useEffect(() => {
    if (songRef.current) {
      songRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {

  }, [selectedTheme, customBackground]);

  const startSession = (forceRestart = false) => {
    if (running && !forceRestart) return;

    const outline = outlineRef.current;
    const length = outline.getTotalLength();

    const total = minutes === "custom" ? 300 : minutes * 60;
    const remaining = forceRestart || timeLeft === 0 ? total : timeLeft;

    setRunning(true);
    setInstructions("Find your center, breathe deeply...");
    setTimeLeft(remaining);

    if (songRef.current) {
      if (customAudio) {
        songRef.current.src = URL.createObjectURL(customAudio);
      }
      songRef.current.volume = isMuted ? 0 : volume;
      songRef.current.load();
      songRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    let time = remaining;
    const id = setInterval(() => {
      time -= 1;
      setTimeLeft(time);
      const progress = length - (time / total) * length;
      if (outline) {
        outline.style.strokeDashoffset = progress;
      }

      if (time > total * 0.8) {
        setInstructions("Focus on your breath...");
      } else if (time > total * 0.5) {
        setInstructions("Let your thoughts drift away...");
      } else if (time > total * 0.2) {
        setInstructions("Feel the peace within...");
      } else if (time > 10) {
        setInstructions("Preparing to return...");
      }

      if (time <= 0) {
        clearInterval(id);
        setIntervalId(null);
        if (songRef.current) songRef.current.pause();
        

        try {
          createCompletionSound();
        } catch (error) {
          console.log('Could not play completion sound:', error);
        }
        
        setInstructions("Session complete. Well done! 🌟");
        setRunning(false);
        setTimeLeft(0);

        
        setTimeout(() => {
          setInstructions("Ready for another mindful journey?");
        }, 3000);
      }
    }, 1000);

    setIntervalId(id);
  };

  const pauseBreathing = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setInstructions("Paused - Take your time");
      setRunning(false);
      if (songRef.current) songRef.current.pause();
    }
  };

  const replayBreathing = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setInstructions("Restarting your journey...");
    setRunning(false);

    const outline = outlineRef.current;
    if (outline) {
      const length = outline.getTotalLength();
      outline.style.strokeDashoffset = length;
    }

    if (songRef.current) {
      songRef.current.pause();
      songRef.current.currentTime = 0;
    }

    setTimeout(() => startSession(true), 500);
  };

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === "custom") {
      const customMins = prompt("Enter custom minutes (1-60):");
      const numMins = parseInt(customMins);
      if (!isNaN(numMins) && numMins > 0 && numMins <= 60) {
        setMinutes(numMins);
        setTimeLeft(0);
        setInstructions(`Custom ${numMins} minute session ready`);
      } else {
        alert("Please enter a valid number between 1-60");
        e.target.value = minutes;
      }
    } else {
      setMinutes(parseInt(val));
      setTimeLeft(0);
      setInstructions(`${val} minute session ready`);
    }
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomBackground(file);
      setInstructions("Custom background applied");
    }
  };

  const resetToThemeBackground = () => {
    setCustomBackground(null);
    setInstructions("Returned to theme background");
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomAudio(file);
      pauseBreathing();
      if (songRef.current) {
        songRef.current.src = URL.createObjectURL(file);
        songRef.current.load();
      }
      setInstructions("Custom audio loaded");
    }
  };

  const formatTime = () => {
    const totalSeconds = timeLeft || (!running && (minutes === "custom" ? 300 : minutes * 60));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={bgContainerRef}
      className="min-h-screen relative overflow-hidden transition-all duration-1000"
      style={getBackgroundStyle()}
    >
   
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
 
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <div className="text-white/80">
            <h1 className="text-2xl font-light mb-1">Mindful Moments</h1>
            </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

     
        {showSettings && (
          <div className="absolute top-20 right-6 bg-black/20 backdrop-blur-lg rounded-2xl p-6 w-80 border border-white/20 max-h-96 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Settings</h3>
            
         
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">Theme</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setSelectedTheme(theme.name);
                      if (customBackground) {
                        resetToThemeBackground();
                      }
                    }}
                    className={`p-3 rounded-lg flex items-center gap-2 text-sm transition-all ${
                      selectedTheme === theme.name 
                        ? 'bg-white/30 text-white border border-white/40' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    style={{
                      backgroundImage: selectedTheme === theme.name 
                        ? `linear-gradient(45deg, ${theme.colors[0]}40, ${theme.colors[1]}40)` 
                        : undefined
                    }}
                  >
                    {getThemeIcon(theme.name)}
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

        
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">Background</label>
              <div className="flex gap-2">
                <button
                  onClick={resetToThemeBackground}
                  disabled={!customBackground}
                  className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 text-sm"
                >
                  Use Theme
                </button>
                <label
                  htmlFor="bgInputSettings"
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </label>
                <input
                  id="bgInputSettings"
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundChange}
                  className="hidden"
                />
              </div>
            </div>

      
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">Audio Volume</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

    
        <div className="flex flex-col items-center max-w-md w-full">
       
          <div className="mb-8 flex flex-col items-center gap-6">
            <select
              ref={selectRef}
              onChange={handleSelect}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 text-center min-w-48"
              defaultValue={minutes}
            >
              <option value="5" className="bg-gray-800">5 Minutes</option>
              <option value="10" className="bg-gray-800">10 Minutes</option>
              <option value="15" className="bg-gray-800">15 Minutes</option>
              <option value="20" className="bg-gray-800">20 Minutes</option>
              <option value="custom" className="bg-gray-800">Custom</option>
            </select>

         
            <div className="flex gap-3">
              <div>
                <label
                  htmlFor="bgInput"
                  className="cursor-pointer flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 border border-white/30"
                >
                  <Upload className="w-4 h-4" />
                  Background
                </label>
                <input
                  id="bgInput"
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundChange}
                  className="hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="audioInput"
                  className="cursor-pointer flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 border border-white/30"
                >
                  <Volume2 className="w-4 h-4" />
                  Audio
                </label>
                <input
                  id="audioInput"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

 
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <svg width="240" height="240" className="relative z-10 drop-shadow-2xl">
              <circle
                cx="120"
                cy="120"
                r="100"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                ref={outlineRef}
                cx="120"
                cy="120"
                r="100"
                stroke={accentColor}
                strokeWidth="8"
                fill="none"
                transform="rotate(-90 120 120)"
                className="drop-shadow-lg"
                style={{
                  filter: `drop-shadow(0 0 10px ${accentColor})`
                }}
              />
          
              <circle
                cx="120"
                cy="120"
                r="60"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                fill="none"
              />
              <circle
                cx="120"
                cy="120"
                r="30"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                fill="none"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-light text-white mb-2 font-mono tracking-wider drop-shadow-lg">
                {formatTime()}
              </div>
              {running && (
                <div className="flex items-center gap-2 text-white/70">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">In session</span>
                </div>
              )}
            </div>
          </div>

     
          <p className="text-xl text-white/90 text-center mb-8 font-light leading-relaxed max-w-sm">
            {instructions}
          </p>

          <div className="flex gap-4 mb-8">
            <button
              onClick={pauseBreathing}
              disabled={!running}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-300 backdrop-blur-sm border border-white/30"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
            <button
              onClick={replayBreathing}
              disabled={timeLeft === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-300 backdrop-blur-sm border border-white/30"
            >
              <RotateCcw className="w-5 h-5" />
              Replay
            </button>
          </div>

          <button
            onClick={() => startSession()}
            disabled={running}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 backdrop-blur-sm border-2 ${
              running 
                ? 'bg-white/10 border-white/30 text-white/60 cursor-not-allowed' 
                : 'bg-white/30 hover:bg-white/40 border-white/50 text-white shadow-2xl'
            }`}
            style={{
              boxShadow: running ? 'none' : `0 10px 30px ${accentColor}40`
            }}
          >
            <Play className="w-6 h-6" />
            {timeLeft > 0 && !running ? "Resume" : running ? "In Progress..." : "Begin Journey"}
          </button>
        </div>

  
        <audio ref={songRef} className="hidden" loop>
          <source src={Rain} />
        </audio>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(20px) rotate(240deg); }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}