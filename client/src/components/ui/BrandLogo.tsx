type BrandLogoMode = "icon" | "compact" | "full";

type BrandLogoProps = {
    mode?: BrandLogoMode;
    className?: string;
    onClick?: () => void;
};

const wrapperClasses: Record<BrandLogoMode, string> = {
    icon: "inline-flex items-center",
    compact: "inline-flex items-center gap-2.5",
    full: "inline-flex items-center gap-4",
};

const imageClasses: Record<BrandLogoMode, string> = {
    icon: "h-11 w-11 drop-shadow-[0_18px_30px_rgba(79,70,229,0.28)]",
    compact: "h-10 w-10 drop-shadow-[0_18px_30px_rgba(79,70,229,0.24)]",
    full: "h-14 w-14 drop-shadow-[0_22px_36px_rgba(79,70,229,0.3)]",
};

const titleClasses: Record<Exclude<BrandLogoMode, "icon">, string> = {
    compact: "text-[1.18rem] font-black tracking-[-0.08em] text-white leading-none",
    full: "text-[1.95rem] font-black tracking-[-0.09em] text-white leading-none",
};

const subtitleClasses: Record<Exclude<BrandLogoMode, "icon">, string> = {
    compact: "text-[0.58rem] uppercase tracking-[0.3em] text-slate-400 font-semibold",
    full: "text-[0.66rem] uppercase tracking-[0.38em] text-cyan-300/70 font-semibold",
};

const BrandLogo = ({ mode = "full", className = "", onClick }: BrandLogoProps) => {
    const content = (
        <>
            <img
                src="/favicon.svg"
                alt="QuickTalk"
                className={imageClasses[mode]}
            />
            {mode !== "icon" && (
                <div className="flex flex-col items-start">
                    {mode === "full" && (
                        <span className={subtitleClasses[mode]}>
                            Real-Time Messaging
                        </span>
                    )}
                    <span
                        className={titleClasses[mode]}
                        style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
                    >
                        Quick<span className="text-cyan-300">Talk</span>
                    </span>
                </div>
            )}
        </>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`${wrapperClasses[mode]} ${className}`}
            >
                {content}
            </button>
        );
    }

    return (
        <div className={`${wrapperClasses[mode]} ${className}`}>
            {content}
        </div>
    );
};

export default BrandLogo;
