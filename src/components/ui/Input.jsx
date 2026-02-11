export default function Input({
                                  label,
                                  error,
                                  className = "",
                                  ...props
                              }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-slate-700">{label}</label>
            )}
            <input
                className={
                    "w-full rounded-xl border px-3 py-2 text-sm outline-none transition " +
                    "border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 " +
                    (error ? "border-rose-400 focus:ring-rose-200" : "") +
                    ` ${className}`
                }
                {...props}
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
    );
}
