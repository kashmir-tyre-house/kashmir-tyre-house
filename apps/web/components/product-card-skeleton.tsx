type ProductCardSkeletonProps = {
  className?: string;
};

export function ProductCardSkeleton({ className = "" }: ProductCardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`h-fit min-w-[312px] max-w-[372px] w-fit flex-none snap-start overflow-hidden rounded-[22px] bg-white shadow-[0_14px_44px_rgba(35,26,18,0.07)] ${className}`}
    >
      <div className="relative rounded-[20px] bg-[#e6d7c7] p-2">
        <div className="relative h-[160px] animate-pulse overflow-hidden rounded-2xl bg-[linear-gradient(110deg,#ead9c9_0%,#f3e4d4_45%,#ead9c9_100%)]">
          <span className="absolute bottom-2.5 left-2.5 inline-block h-4 w-14 rounded-[6px] bg-[#f3e4d4]/80" />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-2/3 animate-pulse rounded bg-[#ead9c9]" />
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-[8px] border border-[#F3E7DB] bg-[#f3e4d4]" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="h-2.5 w-16 animate-pulse rounded bg-[#ead9c9]" />
              <div className="mt-1.5 h-3.5 w-20 animate-pulse rounded bg-[#ead9c9]" />
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-2">
          <div className="h-9 flex-1 animate-pulse rounded-md bg-[#ead9c9]" />
          <div className="h-9 w-20 animate-pulse rounded-md bg-[#ead9c9]" />
        </div>
      </div>
    </div>
  );
}
