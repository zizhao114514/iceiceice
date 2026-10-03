import { useState, useEffect, useCallback, useRef } from 'react'

interface Snowflake {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  wobble: number
  wobbleSpeed: number
}

interface IceCrystal {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  opacity: number
}

function App() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [iceCrystals, setIceCrystals] = useState<IceCrystal[]>([])
  const [clickCount, setClickCount] = useState(0)
  const [frozen, setFrozen] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [temperature, setTemperature] = useState(0)
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Initialize snowflakes
  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 3,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.7 + 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
    }))
    setSnowflakes(flakes)

    const crystals: IceCrystal[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.3,
      opacity: Math.random() * 0.3 + 0.1,
    }))
    setIceCrystals(crystals)
  }, [])

  // Animation loop
  useEffect(() => {
    if (frozen) return

    const animate = (time: number) => {
      if (time - lastTimeRef.current > 16) {
        lastTimeRef.current = time
        setSnowflakes(prev =>
          prev.map(flake => ({
            ...flake,
            y: flake.y > 100 ? -5 : flake.y + flake.speed,
            x: flake.x + Math.sin(flake.wobble) * 0.3,
            wobble: flake.wobble + flake.wobbleSpeed,
          }))
        )
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [frozen])

  const handleClick = useCallback((e: React.MouseEvent) => {
    setClickCount(prev => prev + 1)
    setTemperature(prev => Math.max(prev - 2, -50))

    const rect = (e.target as HTMLElement).closest('.ice-container')?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      const rippleId = Date.now()
      setRipples(prev => [...prev, { id: rippleId, x, y }])
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId))
      }, 1000)
    }
  }, [])

  const handleFreeze = () => {
    setFrozen(prev => !prev)
  }

  const handleReset = () => {
    setTemperature(0)
    setClickCount(0)
    setFrozen(false)
  }

  const getTemperatureColor = () => {
    if (temperature <= -40) return 'from-blue-900 via-indigo-900 to-purple-900'
    if (temperature <= -20) return 'from-blue-800 via-cyan-900 to-indigo-900'
    if (temperature <= -10) return 'from-blue-700 via-cyan-800 to-blue-900'
    return 'from-cyan-600 via-blue-700 to-indigo-800'
  }

  const getIceTitle = () => {
    if (clickCount === 0) return '冰冰冰'
    if (clickCount < 5) return '冰冰冰冰'
    if (clickCount < 10) return '冰冰冰冰冰！'
    if (clickCount < 20) return '🥶 冻冻冻！'
    if (clickCount < 30) return '❄️ 冰封世界！'
    return '🧊 绝对零度！'
  }

  return (
    <div
      className={`ice-container relative w-full h-screen overflow-hidden cursor-pointer bg-gradient-to-br ${getTemperatureColor()} transition-all duration-1000`}
      onClick={handleClick}
    >
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Ice crystals background */}
      {iceCrystals.map(crystal => (
        <div
          key={crystal.id}
          className="absolute pointer-events-none"
          style={{
            left: `${crystal.x}%`,
            top: `${crystal.y}%`,
            transform: `rotate(${crystal.rotation}deg) scale(${crystal.scale})`,
            opacity: crystal.opacity,
          }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-cyan-200/30">
            <path
              d="M30 0 L33 25 L55 15 L35 30 L55 45 L33 35 L30 60 L27 35 L5 45 L25 30 L5 15 L27 25 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}

      {/* Snowflakes */}
      {!frozen &&
        snowflakes.map(flake => (
          <div
            key={flake.id}
            className="absolute pointer-events-none text-white select-none"
            style={{
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              fontSize: `${flake.size}px`,
              opacity: flake.opacity,
              transition: 'none',
            }}
          >
            ❄
          </div>
        ))}

      {/* Frozen overlay */}
      {frozen && (
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
          <div className="text-center animate-pulse">
            <div className="text-8xl mb-4">🧊</div>
            <p className="text-2xl text-cyan-200 font-bold">时间已冻结</p>
            <p className="text-cyan-300/70 mt-2">点击解冻按钮继续</p>
          </div>
        </div>
      )}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none z-10"
          style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
        >
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-cyan-300 animate-ping" />
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400/50 animate-ping" style={{ animationDelay: '0.1s' }} />
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-cyan-500/30 animate-ping" style={{ animationDelay: '0.2s' }} />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-blue-400 mb-4 drop-shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
          {getIceTitle()}
        </h1>

        {/* Temperature display */}
        <div className="mt-6 mb-8 text-center">
          <div className="text-5xl md:text-7xl font-mono font-bold text-cyan-100 drop-shadow-lg">
            {temperature}°C
          </div>
          <div className="text-cyan-300/80 text-sm mt-2 tracking-wider">
            {temperature <= -40 && '⚠️ 极度严寒！'}
            {temperature > -40 && temperature <= -20 && '🌨️ 暴风雪来袭'}
            {temperature > -20 && temperature <= -10 && '🥶 好冷啊！'}
            {temperature > -10 && temperature <= 0 && '❄️ 开始结冰了'}
            {temperature > 0 && '☀️ 还没结冰...'}
          </div>
        </div>

        {/* Click counter */}
        <div className="mb-8 text-cyan-200/90 text-lg">
          <span className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-300/30">
            💎 已点击 <span className="font-bold text-white">{clickCount}</span> 次
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); handleFreeze() }}
            className="group relative px-6 py-3 bg-white/10 backdrop-blur-md border border-cyan-300/40 rounded-xl text-cyan-100 font-semibold hover:bg-white/20 hover:border-cyan-300/60 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">
              {frozen ? '🔓 解冻' : '🔒 冻结时间'}
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleReset() }}
            className="group relative px-6 py-3 bg-white/10 backdrop-blur-md border border-cyan-300/40 rounded-xl text-cyan-100 font-semibold hover:bg-white/20 hover:border-cyan-300/60 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">🔄 重置</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Fun message */}
        <p className="mt-12 text-cyan-300/60 text-sm animate-pulse">
          ✨ 点击屏幕任意位置让温度下降 ✨
        </p>
      </div>

      {/* Bottom frost effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-4xl opacity-50 animate-spin" style={{ animationDuration: '10s' }}>❄️</div>
      <div className="absolute top-4 right-4 text-4xl opacity-50 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>🧊</div>
      <div className="absolute bottom-4 left-4 text-3xl opacity-40 animate-bounce" style={{ animationDuration: '2s' }}>💎</div>
      <div className="absolute bottom-4 right-4 text-3xl opacity-40 animate-bounce" style={{ animationDuration: '2.5s' }}>✨</div>
    </div>
  )
}

export default App
