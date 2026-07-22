import { cn } from "@kth/ui/utils";

// Travel direction: down and to the right. The trail is rotated by the same
// angle so the streak always lies along the path, like a real meteor.
// dx/dy = tan(31deg) ≈ 0.6, so the two must be kept in sync.
const DRIFT_RATIO = 0.6;

// Deterministic pseudo-random in [0, 1) — keeps the server-rendered markup
// identical to the client's, which Math.random() cannot guarantee.
function seeded(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export const Meteors = ({
  number,
  className,
  travel = 560,
}: {
  number?: number;
  className?: string;
  /** Vertical distance a meteor falls, in px. Should exceed the container height. */
  travel?: number;
}) => {
  const meteors = new Array(number || 20).fill(true);

  return (
    <>
      {meteors.map((el, idx) => {
        // Start biased to the left: each meteor drifts right as it falls, so
        // this keeps the whole streak crossing the container rather than
        // exiting the right edge immediately.
        const slot = (idx + 0.5) / meteors.length;
        const jitter = (seeded(idx, 1) - 0.5) / meteors.length;
        const left = (-25 + (slot + jitter) * 120).toFixed(2) + "%";

        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-px w-px rounded-full bg-[#94a3b8]",
              // The drag: a long streak trailing back up the flight path,
              // brightest at the head and fading to nothing at the tail.
              "before:absolute before:bottom-0 before:left-0 before:h-24 before:w-px before:origin-bottom before:rotate-[-31deg] before:bg-linear-to-t before:from-[#64748b] before:to-transparent before:content-['']",
              className
            )}
            style={{
              top: "-90px",
              left,
              ["--meteor-dx" as string]: Math.round(travel * DRIFT_RATIO) + "px",
              ["--meteor-dy" as string]: travel + "px",
              animationDelay: (seeded(idx, 2) * 5).toFixed(2) + "s",
              animationDuration: (seeded(idx, 3) * 2.5 + 2.5).toFixed(2) + "s",
            }}
          />
        );
      })}
    </>
  );
};
