export function TabView({ tab }: { tab: string }) {
  return (
    <div className="overflow-x-auto border border-line bg-sunken px-3 py-4">
      <pre className="font-mono text-[clamp(9.5px,calc(4.6vw-4.5px),13px)] leading-[1.6] text-fg sm:text-[13px]">{tab}</pre>
    </div>
  )
}
