export default function Button({
                                   children,
                                   className = "",
                                   variant = "primary",
                                   ...props
                               }) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400",
        ghost:
            "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
        danger:
            "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-300",
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}
