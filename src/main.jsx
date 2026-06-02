import React, { useEffect, useMemo, useRef, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import "./styles.css"

const MOVIES = [
  { year: "2026", title: "错过了，遗憾吗？", subtitle: "Film · Coming soon", tag: "FARTHER" },
  { year: "2026", title: "飞驰人生3", subtitle: "Film · Speed / Youth", tag: "FORWARD" },
  { year: "2025", title: "毕正明的证明", subtitle: "Film · Proof / Identity", tag: "PROOF" },
  { year: "2025", title: "疯狂动物城2", subtitle: "Voice · Animated feature", tag: "VOICE" },
]

const DRAMAS = [
  { year: "2025", title: "陷入我们的热恋", subtitle: "Chen Luzhou", tag: "BLUE" },
  { year: "2025", title: "值得爱", subtitle: "Zhou Shui", tag: "LOVE" },
  { year: "2025", title: "漫影寻踪", subtitle: "A Lai", tag: "TRACE" },
  { year: "2024", title: "小巷人家", subtitle: "Lin Dongzhe", tag: "MEMORY" },
  { year: "2023", title: "神隐", subtitle: "Gu Jin / Yuan Qi", tag: "MYTH" },
  { year: "2022", title: "炽道", subtitle: "Duan Yucheng", tag: "TRACK" },
  { year: "2021", title: "陪你逐风飞翔", subtitle: "Shao Beisheng", tag: "WIND" },
  { year: "2020", title: "百岁之好，一言为定", subtitle: "Jiang Zhenghan", tag: "PROMISE" },
]

const GALLERY = Array.from({ length: 10 }, (_, i) => ({
  label: `PHOTO ${String(i + 1).padStart(2, "0")}`,
  caption: ["sea", "blue", "light", "future", "wind", "youth", "memory", "role", "star", "archive"][i],
  src: "",
}))

function App() {
  const { scrollYProgress } = useScroll()
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <main className="site">
      <GalaxyCanvas />
      <CursorGlow />
      <Noise />
      <motion.div className="topProgress" style={{ scaleX: progressScale }} />
      <SideIndex />
      <Hero />
      <OceanChapter />
      <Timeline label="MOVIE" number="02" intro="电影作品 · 按时间由近及远" items={MOVIES} posterSide="right" />
      <Timeline label="DRAMA" number="03" intro="电视剧作品 · 角色时间线" items={DRAMAS} posterSide="left" />
      <Gallery />
      <Final />
    </main>
  )
}

function CursorGlow() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 120, damping: 22 })
  const sy = useSpring(y, { stiffness: 120, damping: 22 })

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [x, y])

  return <motion.div className="cursorGlow" style={{ x: sx, y: sy }} />
}

function GalaxyCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let width = 0
    let height = 0
    let raf = 0
    let mouse = { x: 0.5, y: 0.5 }
    const particles = Array.from({ length: 130 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.00045,
      vy: (Math.random() - 0.5) * 0.00045,
      a: Math.random() * 0.65 + 0.16,
      phase: Math.random() * Math.PI * 2,
      hue: i % 3,
    }))

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onPointer = (e) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height)
      const cx = width * (0.45 + (mouse.x - 0.5) * 0.08)
      const cy = height * (0.45 + (mouse.y - 0.5) * 0.08)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.72)
      g.addColorStop(0, "rgba(99,210,255,.18)")
      g.addColorStop(0.36, "rgba(22,94,138,.08)")
      g.addColorStop(1, "rgba(2,8,20,0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)

      particles.forEach((p, i) => {
        p.x += p.vx + (mouse.x - 0.5) * 0.00005
        p.y += p.vy + (mouse.y - 0.5) * 0.00005
        if (p.x < -0.05) p.x = 1.05
        if (p.x > 1.05) p.x = -0.05
        if (p.y < -0.05) p.y = 1.05
        if (p.y > 1.05) p.y = -0.05

        const tw = 0.45 + Math.sin(t * 0.0014 + p.phase) * 0.35
        ctx.beginPath()
        ctx.arc(p.x * width, p.y * height, p.r * (1 + tw * 0.65), 0, Math.PI * 2)
        ctx.fillStyle = p.hue === 0 ? `rgba(244,251,255,${p.a * tw})` : p.hue === 1 ? `rgba(143,228,255,${p.a * tw})` : `rgba(120,170,255,${p.a * tw})`
        ctx.shadowColor = "rgba(143,228,255,.75)"
        ctx.shadowBlur = 14
        ctx.fill()
        ctx.shadowBlur = 0

        if (i % 7 === 0) {
          const q = particles[(i + 17) % particles.length]
          const dx = (p.x - q.x) * width
          const dy = (p.y - q.y) * height
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 190) {
            ctx.beginPath()
            ctx.moveTo(p.x * width, p.y * height)
            ctx.lineTo(q.x * width, q.y * height)
            ctx.strokeStyle = `rgba(143,228,255,${(1 - d / 190) * 0.12})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      })
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw(0)
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onPointer)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointer)
    }
  }, [])

  return <canvas className="galaxyCanvas" ref={canvasRef} />
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const bg = useMotionTemplate`radial-gradient(900px circle at ${mouseX}% ${mouseY}%, rgba(118,217,255,.45), rgba(54,150,205,.12) 36%, rgba(2,8,20,0) 72%)`
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -150])
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.78])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.68], [1, 0])
  const lineClip = useTransform(scrollYProgress, [0, 0.6], ["0%", "100%"])

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <section className="hero" ref={ref} onMouseMove={onMove}>
      <motion.div className="heroGlow" style={{ background: bg }} />
      <nav className="nav">
        <motion.div className="logo" whileHover={{ letterSpacing: ".08em", color: "#8fe4ff" }}>WA</motion.div>
        <div className="navLinks">
          {["MOVIE", "DRAMA", "GALLERY", "FUTURE"].map((n) => <MagneticLink key={n} href={`#${n.toLowerCase()}`}>{n}</MagneticLink>)}
        </div>
      </nav>
      <motion.div className="heroCenter" style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}>
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>A DIGITAL ARCHIVE FOR</motion.p>
        <h1 className="heroName" aria-label="WANG ANYU">
          <RevealLetters text="WANG" delay={0.04} />
          <span className="nameGap"><motion.i style={{ width: lineClip }} /></span>
          <RevealLetters text="ANYU" delay={0.12} />
        </h1>
        <motion.p className="heroText" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9 }}>从宁波出发，被海浪托起，被星光记住。一起去更远的未来吧。</motion.p>
      </motion.div>
      <div className="scrollHint"><span>SCROLL</span><i /></div>
      <div className="orbitMark"><span /><span /><span /></div>
    </section>
  )
}

function RevealLetters({ text, delay = 0 }) {
  return (
    <span className="letterLine">
      {text.split("").map((l, i) => (
        <motion.span key={i} initial={{ y: "110%", rotateX: -80, opacity: 0 }} animate={{ y: 0, rotateX: 0, opacity: 1 }} transition={{ delay: delay + i * 0.055, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>{l}</motion.span>
      ))}
    </span>
  )
}

function MagneticLink({ href, children }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18 })
  const sy = useSpring(y, { stiffness: 220, damping: 18 })
  return (
    <motion.a
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.18)
        y.set((e.clientY - r.top - r.height / 2) * 0.18)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      <span>{children}</span><em>{children}</em>
    </motion.a>
  )
}

function OceanChapter() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const scale = useTransform(scrollYProgress, [0.02, 0.42, 0.66], [0.055, 1.05, 1.46])
  const height = useTransform(scrollYProgress, [0.02, 0.42, 0.66], [8, 500, 760])
  const radius = useTransform(scrollYProgress, [0.08, 0.52], [64, 18])
  const opacity = useTransform(scrollYProgress, [0.02, 0.1, 0.77], [0, 1, 0.06])
  const gray = useTransform(scrollYProgress, [0.08, 0.42], [1, 0])
  const sat = useTransform(scrollYProgress, [0.08, 0.42], [0.1, 1.85])
  const blue = useTransform(scrollYProgress, [0.16, 0.5], [0, 0.94])
  const splashOpacity = useTransform(scrollYProgress, [0.47, 0.58, 0.72], [0, 1, 0])
  const starOpacity = useTransform(scrollYProgress, [0.55, 0.72], [0, 1])
  const phraseOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1])
  const phraseY = useTransform(scrollYProgress, [0.62, 0.78], [50, 0])
  const topY = useTransform(scrollYProgress, [0.08, 0.55], [0, -96])
  const bottomY = useTransform(scrollYProgress, [0.08, 0.55], [0, 96])
  const filter = useMotionTemplate`grayscale(${gray}) saturate(${sat}) contrast(1.28)`
  const drops = useMemo(() => makeParticles(170, 13), [])
  const stars = useMemo(() => makeParticles(210, 31), [])

  return (
    <section className="oceanChapter" ref={ref}>
      <div className="oceanSticky">
        <motion.div className="ghostName ghostTop" style={{ y: topY }}>WANG</motion.div>
        <motion.div className="ghostName ghostBottom" style={{ y: bottomY }}>ANYU</motion.div>
        <motion.div className="waveFrame" style={{ scale, height, opacity, filter, borderRadius: radius }}>
          <RealisticCodeWave />
          <motion.div className="blueWash" style={{ opacity: blue }} />
        </motion.div>
        <ParticleBurst className="splashLayer" particles={drops} opacity={splashOpacity} mode="splash" />
        <ParticleBurst className="starLayer" particles={stars} opacity={starOpacity} mode="star" />
        <motion.h2 className="futurePhrase" style={{ opacity: phraseOpacity, y: phraseY }}>一起去更远的未来吧</motion.h2>
      </div>
    </section>
  )
}

function ParticleBurst({ className, particles, opacity, mode }) {
  return (
    <motion.div className={className} style={{ opacity }}>
      {particles.map((p) => (
        <motion.span
          className={mode === "star" ? "star" : "splashDrop"}
          key={p.id}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          whileInView={{ opacity: mode === "star" ? [0, 1, 0.84] : [0, 1, 0], scale: mode === "star" ? [0, 2.2, 1] : [0.2, 1.8, 0.72], x: `${p.x}vw`, y: `${mode === "splash" ? -Math.abs(p.y) : p.y}vh`, rotate: p.x * 12 }}
          transition={{ duration: mode === "star" ? 1.8 : 1.05, delay: p.delay, ease: "easeOut" }}
          style={{ width: p.size, height: p.size }}
        />
      ))}
    </motion.div>
  )
}

function makeParticles(count, seed) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.sin((i + seed) * 14.17) * (18 + (i % 11) * 4.6),
    y: Math.cos((i + seed) * 9.31) * (14 + (i % 13) * 3.95),
    size: 1.5 + ((i * 7) % 8),
    delay: (i % 22) * 0.018,
  }))
}

function RealisticCodeWave() {
  return (
    <div className="waveScene">
      <svg className="waveSvg" viewBox="0 0 1200 620" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="liquid">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.032" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="34" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id="waterGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8fdff" stopOpacity=".9" />
            <stop offset="44%" stopColor="#72d9ff" stopOpacity=".78" />
            <stop offset="100%" stopColor="#07243d" stopOpacity=".96" />
          </linearGradient>
        </defs>
        <motion.path className="liquidPath p1" filter="url(#liquid)" fill="url(#waterGrad)" d="M-40 360 C130 260 255 420 410 320 C580 210 720 420 900 300 C1050 210 1140 330 1240 250 L1240 680 L-40 680 Z" />
        <motion.path className="liquidPath p2" filter="url(#liquid)" fill="rgba(255,255,255,.55)" d="M-60 372 C160 280 275 386 430 342 C585 298 700 382 850 328 C1010 270 1110 340 1260 286 L1260 370 C1030 470 842 406 700 430 C520 460 390 386 190 434 C80 460 10 432 -60 470 Z" />
      </svg>
      <div className="waveBackGlow" />
      <div className="waveSurface waveOne" />
      <div className="waveSurface waveTwo" />
      <div className="foam foamOne" />
      <div className="foam foamTwo" />
      <div className="mist" />
      <div className="shimmer" />
      <div className="waterDots">{Array.from({ length: 32 }).map((_, i) => <i key={i} style={{ left: `${(i * 13) % 100}%`, top: `${36 + (i * 19) % 44}%`, animationDelay: `${i * 0.07}s` }} />)}</div>
    </div>
  )
}

function Timeline({ label, number, intro, items, posterSide }) {
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const titleX = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])
  const isLeft = posterSide === "left"
  const poster = <Poster item={items[active]} active={active} isLeft={isLeft} />

  const list = (
    <div className="timelineList">
      <motion.div className="timelineScanner" layoutId={`${label}-scanner`} style={{ top: `${active * 104 + 28}px` }} />
      <div className="timelineConnector">
        {items.map((_, i) => <motion.i key={i} animate={{ opacity: i === active ? 1 : 0.24, scale: i === active ? 1.65 : 1 }} />)}
      </div>
      {items.map((item, i) => {
        const on = i === active
        return (
          <motion.div className="timelineItem" key={item.title} onMouseEnter={() => setActive(i)} whileHover={{ x: isLeft ? -20 : 20 }}>
            <span className={on ? "year active" : "year"}>{item.year}</span>
            <div>
              <WaveHoverText text={item.title} active={on} />
              <p className={on ? "subtitle active" : "subtitle"}>{item.subtitle}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <section className="timeline" id={label.toLowerCase()} ref={ref}>
      <span className="sectionNo">{number}</span>
      <p className="kicker">{intro}</p>
      <motion.h2 className="sectionTitle" style={{ x: titleX }}>{label}</motion.h2>
      <div className={isLeft ? "timelineGrid leftPoster" : "timelineGrid"}>
        {isLeft ? poster : list}
        {isLeft ? list : poster}
      </div>
    </section>
  )
}

function Poster({ item, active, isLeft }) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  return (
    <motion.div
      className="posterStage"
      key={active}
      initial={{ opacity: 0, scale: 0.86, rotateY: isLeft ? 20 : -20 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX, rotateY }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 14)
        rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 10)
      }}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0) }}
    >
      <div className="posterLight" />
      <div className="posterPlaceholder">
        <div className="posterTexture" />
        <div className="posterRing" />
        <span>{item.year}</span>
        <strong>{item.title}</strong>
        <em>{item.subtitle}</em>
        <b>{item.tag}</b>
      </div>
    </motion.div>
  )
}

function WaveHoverText({ text, active }) {
  return (
    <div className="waveTextWrap">
      <motion.div className="waveTextInner" animate={{ y: active ? "-50%" : "0%" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className={active ? "waveText active" : "waveText"}>{text}</div>
        <div className="waveText clone">{text}</div>
      </motion.div>
    </div>
  )
}

function Gallery() {
  const [active, setActive] = useState(4)
  return (
    <section className="gallery" id="gallery">
      <span className="sectionNo">04</span>
      <p className="kicker">摄影作品集 · 3D PHOTO BROWSER</p>
      <h2 className="galleryTitle">GALLERY</h2>
      <div className="photoBrowser">
        {GALLERY.map((item, i) => {
          const offset = i - active
          const abs = Math.abs(offset)
          return (
            <motion.div
              className="photoCard"
              key={item.label}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              animate={{ x: offset * 118, z: -abs * 90, rotateY: offset * -20, rotateZ: offset * 1.4, scale: i === active ? 1.18 : 0.84, opacity: abs > 4 ? 0 : i === active ? 1 : 0.46, zIndex: 30 - abs }}
              transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            >
              {item.src ? <img src={item.src} alt={item.label} /> : <WhitePhoto item={item} index={i} />}
            </motion.div>
          )
        })}
      </div>
      <div className="galleryControl">
        <button onClick={() => setActive(Math.max(0, active - 1))}>←</button>
        <span>{String(active + 1).padStart(2, "0")} / {String(GALLERY.length).padStart(2, "0")}</span>
        <button onClick={() => setActive(Math.min(GALLERY.length - 1, active + 1))}>→</button>
      </div>
    </section>
  )
}

function WhitePhoto({ item, index }) {
  return <div className="whitePhoto"><div className="whitePhotoGlow" /><div className="photoGrid" /> <span>WANG ANYU</span><strong>{item.label}</strong><em>{item.caption}</em><b>{String(index + 1).padStart(2, "0")}</b></div>
}

function Final() {
  return (
    <section className="final" id="future">
      <div className="finalStars">{Array.from({ length: 120 }).map((_, i) => <span key={i} style={{ left: `${(i * 17) % 100}%`, top: `${(i * 29) % 100}%`, width: 2 + ((i * 5) % 5), height: 2 + ((i * 5) % 5), animationDelay: `${(i % 14) * 0.14}s` }} />)}</div>
      <motion.h2 initial={{ opacity: 0, y: 58 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}>一起去更远的未来吧</motion.h2>
      <p>May every wave become a star. May every star become a memory.</p>
      <div className="finalName">WANG ANYU</div>
    </section>
  )
}

function SideIndex() {
  return <div className="sideIndex"><span>01 HERO</span><span>02 WAVE</span><span>03 WORKS</span><span>04 GALLERY</span></div>
}
function Noise() { return <div className="noise" /> }

createRoot(document.getElementById("root")).render(<App />)
