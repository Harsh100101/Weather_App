interface Props { theme: 'dark' | 'light' }

function Bone({ w, h, r = 'rounded-xl' }: { w: string; h: string; r?: string }) {
  return (
    <div
      className={`${w} ${h} ${r} skeleton`}
    />
  );
}

export default function WeatherSkeleton({ theme: _theme }: Props) {
  return (
    <div className="h-full flex gap-2.5 animate-pulse">

      {/* Left panel skeleton */}
      <div
        className="w-[242px] shrink-0 h-full rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <Bone w="w-36" h="h-5" />
            <Bone w="w-24" h="h-3" />
          </div>
          <Bone w="w-7" h="h-7" r="rounded-full" />
        </div>
        <div className="flex gap-3 items-center">
          <Bone w="w-[70px]" h="h-[70px]" r="rounded-full" />
          <div className="space-y-2">
            <Bone w="w-28" h="h-12" />
            <Bone w="w-20" h="h-3" />
          </div>
        </div>
        <div className="h-px w-full skeleton opacity-50" />
        <div className="grid grid-cols-2 gap-3 flex-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Bone w="w-[30px]" h="h-[30px]" r="rounded-[10px]" />
              <div className="space-y-1.5 flex-1">
                <Bone w="w-14" h="h-2.5" />
                <Bone w="w-full" h="h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right col skeleton */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 h-full">
        {/* Weekly */}
        <div
          className="rounded-2xl p-3 shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <Bone w="w-10" h="h-2.5" />
                <Bone w="w-9" h="h-9" r="rounded-full" />
                <Bone w="w-full" h="h-3" />
                <Bone w="w-8" h="h-2.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Hourly */}
        <div
          className="rounded-2xl p-4 shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex justify-between mb-3">
            <Bone w="w-32" h="h-4" />
            <Bone w="w-24" h="h-4" />
          </div>
          <Bone w="w-full" h="h-16" r="rounded-lg" />
          <div className="flex gap-2 mt-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-none w-14 flex flex-col items-center gap-1">
                <Bone w="w-8" h="h-2.5" />
                <Bone w="w-8" h="h-8" r="rounded-full" />
                <Bone w="w-6" h="h-3" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex-1 min-h-0 flex gap-2.5">
          <Bone w="w-[180px]" h="h-full" r="rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Bone w="w-full" h="h-[148px]" r="rounded-2xl" />
            <Bone w="w-full" h="h-14" r="rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
