import { useEffect, useMemo, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function remainingFrom(target: number): Remaining {
  const ms = target - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** A single split-flap digit that flips vertically when its value changes. */
function FlipDigit({ value }: { value: string }) {
  const [prev, setPrev] = useState(value);

  useEffect(() => {
    if (value === prev) return;
    if (prefersReduced()) {
      setPrev(value);
      return;
    }
    const t = window.setTimeout(() => setPrev(value), 620); // matches CSS flip duration
    return () => window.clearTimeout(t);
    // `prev` intentionally omitted — we only react to incoming value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flip-unit">
      {/* static halves: new top is revealed as the old top folds away */}
      <div className="flip-top">
        <span>{value}</span>
      </div>
      <div className="flip-bottom">
        <span>{prev}</span>
      </div>
      {value !== prev && (
        <div className="flip-anim" key={value}>
          <div className="flip-top flip-fold-top">
            <span>{prev}</span>
          </div>
          <div className="flip-bottom flip-fold-bottom">
            <span>{value}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ value, label }: { value: string; label: string }) {
  return (
    <div className="flip-group">
      <div className="flip-digits">
        {value.split("").map((d, i) => (
          <FlipDigit key={i} value={d} />
        ))}
      </div>
      <span className="flip-label">{label}</span>
    </div>
  );
}

function Colon() {
  return (
    <div className="flip-colon" aria-hidden>
      <span />
      <span />
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function FlipClock({ targetISO }: { targetISO: string }) {
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [time, setTime] = useState<Remaining>(() => remainingFrom(target));

  useEffect(() => {
    setTime(remainingFrom(target));
    const id = window.setInterval(() => setTime(remainingFrom(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const a11y = time.done
    ? "The bootcamp has started"
    : `${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds until the bootcamp starts`;

  return (
    <div className="flip-clock" role="timer" aria-live="off" aria-label={a11y}>
      <Group value={pad(time.days)} label="Days" />
      <Colon />
      <Group value={pad(time.hours)} label="Hours" />
      <Colon />
      <Group value={pad(time.minutes)} label="Minutes" />
      <Colon />
      <Group value={pad(time.seconds)} label="Seconds" />
    </div>
  );
}
