export default function Input({
    label,
    error,
    className = "",
    ...props
}) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-sm font-semibold text-slate-700">{label}</label>
            )}
            <input
                className={
                    "ds-input text-sm " +
                    (error ? "border-rose-300 focus:!border-rose-400 focus:!shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "") +
                    ` ${className}`
                }
                {...props}
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
    );
}
