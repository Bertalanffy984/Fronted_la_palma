import { Sprout } from 'lucide-react'

export default function Brand({ light = false, compact = false }) {
  return <div className={'flex items-center gap-3 ' + (light ? 'text-white' : 'text-[#183d2d]')}>
    <span className={'grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ' +
      (light ? 'border-white/20 bg-white/10 text-[#d9e9b1]' : 'border-[#dbe9d9] bg-[#eaf2e5] text-[#1d6649]')}>
      <Sprout aria-hidden="true" size={25} strokeWidth={1.8} />
    </span>
    <div>
      <span className="block text-[1.2rem] font-extrabold leading-none tracking-tight">La Palma</span>
      {!compact && <span className={'mt-1 block text-xs ' + (light ? 'text-[#bad0bf]' : 'text-[#527361]')}>Gestión cafetera</span>}
    </div>
  </div>
}
