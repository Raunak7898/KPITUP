interface BrandLockupProps {
  variant?: 'sidebar' | 'compact';
  subtitle?: string;
  className?: string;
}

export const BrandLockup = ({ variant = 'compact', subtitle, className = '' }: BrandLockupProps) => {
  const isSidebar = variant === 'sidebar';

  return (
    <div className={`inline-flex items-center ${isSidebar ? 'gap-3.5' : 'gap-3'} ${className}`.trim()}>
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-[22px] border border-white/10 ${
          isSidebar
            ? 'h-12 w-12 bg-[linear-gradient(160deg,rgba(22,163,74,0.18),rgba(255,255,255,0.02))] shadow-[0_16px_36px_rgba(0,0,0,0.22)]'
            : 'h-11 w-11 bg-[linear-gradient(160deg,rgba(22,163,74,0.16),rgba(255,255,255,0.02))] shadow-[0_12px_28px_rgba(0,0,0,0.18)]'
        }`}
      >
        <div className="absolute inset-[4px] rounded-[18px] border border-white/8" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_36%)]" />
        <span className={`relative font-black text-[#16A34A] ${isSidebar ? 'text-lg' : 'text-base'}`}>K</span>
      </div>

      <div className="min-w-0">
        <div className={`flex items-center gap-2 leading-none ${isSidebar ? 'mb-1' : ''}`}>
          <span
            className={`font-black uppercase text-[#16A34A] ${
              isSidebar ? 'text-[1.45rem] tracking-[0.22em]' : 'text-[1rem] tracking-[0.2em]'
            }`}
          >
            KPIT
          </span>
          <span
            className={`rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] font-black uppercase text-[var(--text-primary)] ${
              isSidebar ? 'px-2.5 py-1 text-[0.72rem] tracking-[0.28em]' : 'px-2 py-1 text-[0.62rem] tracking-[0.24em]'
            }`}
          >
            UP
          </span>
        </div>

        {subtitle ? (
          <p className={`truncate uppercase text-[var(--text-muted)] ${isSidebar ? 'text-[10px] tracking-[0.26em]' : 'text-[9px] tracking-[0.22em]'}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
};
