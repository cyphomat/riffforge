export function TabView({ tab }: { tab: string }) {
  return (
    <div className="overflow-x-auto border border-line bg-sunken p-4">
      <pre className="font-mono text-[clamp(9.5px,calc(4vw-3.3px),12.5px)] leading-[1.6] text-muted sm:text-[13px]">{tab}</pre>
    </div>
  )
}
