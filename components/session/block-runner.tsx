"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BeatIndicator } from "@/components/session/beat-indicator"
import { MicPanel } from "@/components/session/mic-panel"
import { TabView } from "@/components/session/tab-view"
import { TimingReport } from "@/components/session/timing-report"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { useCountdown } from "@/hooks/use-countdown"
import { useMetronome } from "@/hooks/use-metronome"
import { useOnsetMic } from "@/hooks/use-onset-mic"
import { analyseTiming, suggestRating, type TimingAnalysis } from "@/lib/audio/timing"
import { RATINGS, TECHNIQUE_LABELS, type Rating, type SessionBlock, type TimingResult } from "@/lib/session/types"
import { MdPause, MdPlayArrow, MdSkipNext } from "react-icons/md"

/**
 * Wie weit die Knöpfe das Tempo von Hand bewegen.
 *
 * Ein rundes Mass statt eines je Drill verschiedenen: die automatische
 * Fortschreibung rechnet in Prozent vom Ziel, aber ein Knopf, der mal 5 und
 * mal 8 sagt, ist ein Rätsel. Fünf passt zur Rundung der Starttempi — ein
 * Metronom auf 74 hilft niemandem.
 */
const HAND_SCHRITT = 5

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${`${seconds % 60}`.padStart(2, "0")}`
}

export interface BlockOutcome {
  bpm: number
  /** null, wenn nur eine Zwischenrunde vorbei ist — bewertet wird am Ende. */
  rating: Rating | null
  seconds: number
  timing?: TimingResult
}

export interface BlockRunnerProps {
  block: SessionBlock
  index: number
  total: number
  onComplete: (outcome: BlockOutcome) => void
}

export function BlockRunner({ block, index, total, onComplete }: BlockRunnerProps) {
  const onDoneRef = useRef(onComplete)
  onDoneRef.current = onComplete
  const onDone = useCallback((outcome: BlockOutcome) => onDoneRef.current(outcome), [])

  const { drill } = block
  const [phase, setPhase] = useState<"play" | "rate">("play")
  const [analysis, setAnalysis] = useState<TimingAnalysis | null>(null)
  const [suggested, setSuggested] = useState<Rating | null>(null)
  const [hitCount, setHitCount] = useState(0)

  const engine = useAudioEngine()
  const mic = useOnsetMic(engine)

  /** Click times the player was asked to hit, on the shared audio clock. */
  const clickTimesRef = useRef<number[]>([])

  const metronome = useMetronome(engine, {
    bpm: block.bpm,
    beatsPerBar: drill.beatsPerBar,
    subdivision: drill.subdivision,
    onTick: (tick) => {
      clickTimesRef.current.push(tick.time)
      // Only meaningful while the mic is on; cheap enough to keep live.
      setHitCount(mic.onsets().length)
    },
  })

  const { stop: stopMetronome } = metronome
  const { onsets, disable: disableMic } = mic

  const isLastRound = block.round >= block.rounds

  const finishPlaying = useCallback(() => {
    stopMetronome()

    const expected = clickTimesRef.current
    const heard = onsets()

    if (expected.length > 0 && heard.length > 0) {
      // Half a click is the widest a note can be off and still be that note;
      // 120 ms caps it so a slow tempo does not accept anything.
      const tolerance = Math.min(0.12, (60 / metronome.bpm / drill.subdivision) * 0.4)
      const result = analyseTiming(heard, expected, { toleranceSeconds: tolerance })
      setAnalysis(result)
      setSuggested(suggestRating(result))
    }

    disableMic()

    if (!isLastRound) {
      onDone({ bpm: metronome.bpm, rating: null, seconds: Math.round(elapsedRef.current) })
      return
    }
    setPhase("rate")
  }, [disableMic, drill.subdivision, isLastRound, metronome.bpm, onDone, onsets, stopMetronome])

  const timer = useCountdown(block.seconds, finishPlaying)
  const { pause: pauseTimer } = timer

  // finishPlaying wird vom Timer aufgerufen und darf sich nicht bei jedem
  // Tick neu bilden — deshalb liest es die Spielzeit über eine Referenz.
  const elapsedRef = useRef(0)
  elapsedRef.current = timer.elapsed

  useEffect(() => {
    return () => {
      stopMetronome()
      pauseTimer()
      disableMic()
    }
  }, [disableMic, pauseTimer, stopMetronome])

  const toggle = async () => {
    if (timer.isRunning) {
      timer.pause()
      metronome.stop()
    } else {
      // Each run measures itself: the clock and the onsets start together.
      clickTimesRef.current = []
      mic.reset()
      setHitCount(0)
      timer.start()
      await metronome.start()
    }
  }

  const toggleMic = async () => {
    if (mic.status === "listening") mic.disable()
    else await mic.enable()
  }

  const rate = (rating: Rating) => {
    onDone({
      bpm: metronome.bpm,
      rating,
      seconds: Math.round(timer.elapsed),
      timing:
        analysis && analysis.hits > 0
          ? {
              hits: analysis.hits,
              expected: analysis.expected,
              spreadMs: analysis.spreadMs,
              offsetMs: analysis.offsetMs,
              score: analysis.score,
              trend: analysis.trend,
            }
          : undefined,
    })
  }

  const progress = block.seconds > 0 ? ((block.seconds - timer.remaining) / block.seconds) * 100 : 0

  if (phase === "rate") {
    return (
      <div className="space-y-5">
        <div>
          <p className="kicker">
            Block {index + 1} von {total}
            {block.rounds > 1 && ` · Runde ${block.round} von ${block.rounds}`}
          </p>
          <h2 className="display mt-1 text-[32px] text-fg">{drill.title}</h2>
          <p className="ziffern mt-1 text-[13px] text-muted">
            {formatClock(Math.round(timer.elapsed))} bei {metronome.bpm} BPM
          </p>
        </div>

        {analysis && <TimingReport analysis={analysis} />}

        <div>
          <h3 className="rule mb-3">Wie lief&apos;s?</h3>
          <div className="grid gap-[9px] sm:grid-cols-2">
            {RATINGS.map((option) => {
              const isSuggested = suggested === option.value
              // Der Vorschlag ist bernsteinfarben, wenn er gute Nachricht ist,
              // und rostfarben, wenn die Messung "das war zäh" sagt. Bernstein
              // markiert, was gerade dran ist — nicht, was schiefging.
              const rau = isSuggested && option.value <= 2
              return (
                <button
                  key={option.value}
                  onClick={() => rate(option.value)}
                  className={`border p-[14px] text-left transition-colors ${
                    rau
                      ? "border-rost bg-[--tint-rost]"
                      : isSuggested
                        ? "border-akzent bg-[--tint-akzent] hover:bg-[--tint-akzent-stark]"
                        : "border-line bg-panel hover:border-stahl"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`display text-[19px] ${
                        rau ? "text-rost" : isSuggested ? "text-akzent" : "text-fg"
                      }`}
                    >
                      {option.label}
                    </span>
                    {isSuggested && (
                      <span className={`kicker ${rau ? "text-rost" : "text-akzent"}`}>gemessen</span>
                    )}
                  </div>
                  <div className="mt-1 text-[13px] text-muted">{option.hint}</div>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-dim">
            {suggested
              ? "Vorgeschlagen aus dem gemessenen Timing — überstimm es, wenn es sich anders angefühlt hat."
              : "Ehrlich antworten — daraus kommt das Tempo für das nächste Mal."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kicker">
            Block {index + 1} von {total}
            {block.rounds > 1 && ` · Runde ${block.round} von ${block.rounds}`}
          </p>
          <h2 className="display mt-1 text-[32px] text-fg">{drill.title}</h2>
          <p className="mt-1 text-[14px] text-muted">{drill.goal}</p>
        </div>
        <span className="kicker flex-none border border-stahl px-2 py-[3px] text-stahl">
          {TECHNIQUE_LABELS[drill.technique]}
        </span>
      </div>

      <div className="zwei-spalten mt-5">
      <div className="spalte space-y-5">
      <div className="card plain winkel">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="kicker">Verbleibend</span>
            <div className="display num text-[56px] leading-none text-fg">
              {formatClock(timer.remaining)}
            </div>
          </div>

          <div className="text-right">
            <span className="kicker block">Tempo</span>
            {/* Die Heldenzahl der App sitzt auf einem eingelassenen Blech mit
                Skalenstrichen — das Zifferblatt am Verstärker. Das Glimmen ist
                absichtlich kaum zu sehen: ein Röhrenamp glüht, er strahlt nicht. */}
            <div className="platte mt-1 inline-block">
              <div className="display num glimmt text-[44px] leading-none text-akzent">
                {metronome.bpm}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                className="btn btn-ghost btn-small"
                onClick={() => metronome.setBpm(metronome.bpm - HAND_SCHRITT)}
              >
                −{HAND_SCHRITT}
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => metronome.setBpm(metronome.bpm + HAND_SCHRITT)}
              >
                +{HAND_SCHRITT}
              </button>
            </div>
          </div>
        </div>

        <div className="bar mt-4 h-[7px]">
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-[9px]">
          <button onClick={toggle} className="btn flex-1">
            {timer.isRunning ? (
              <>
                <MdPause className="h-[18px] w-[18px]" /> Pause
              </>
            ) : (
              <>
                <MdPlayArrow className="h-[18px] w-[18px]" /> {timer.elapsed > 0 ? "Weiter" : "Los"}
              </>
            )}
          </button>
          <button onClick={finishPlaying} className="btn btn-ghost btn-small px-4 py-4">
            <MdSkipNext className="h-[18px] w-[18px]" /> Beenden
          </button>
          <BeatIndicator beatInBar={metronome.beatInBar} beatsPerBar={drill.beatsPerBar} />
        </div>
      </div>

      {block.rounds > 1 && (
        <p className="border-l-2 border-stahl py-1.5 pl-3 text-[13px] leading-relaxed text-muted">
          {block.round === 1
            ? "Dieser Drill kommt später nochmal — dazwischen liegt etwas anderes."
            : "Zweite Runde. Dass dazwischen etwas anderes lag, ist Absicht: mit Abstand behält es sich besser, auch wenn es sich schlechter anfühlt."}
        </p>
      )}

      <MicPanel
        status={mic.status}
        detail={mic.detail}
        level={mic.level}
        hits={hitCount}
        onToggle={toggleMic}
      />

      </div>

      <div className="spalte space-y-5">
      {drill.tab && <TabView tab={drill.tab} />}

      <div>
        <h3 className="rule mb-2">Worauf achten</h3>
        <ul className="border-t border-line">
          {drill.cues.map((cue) => (
            <li key={cue} className="flex gap-3 border-b border-line py-[9px] text-[14px] text-fg">
              <span className="ziffern flex-none text-akzent">›</span>
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </div>

      {drill.why && (
        <details className="info">
          <summary>Warum das so ist</summary>
          <p className="px-[15px] pb-[15px] text-[14px] leading-relaxed text-muted">{drill.why}</p>
        </details>
      )}
      </div>
      </div>
    </div>
  )
}
