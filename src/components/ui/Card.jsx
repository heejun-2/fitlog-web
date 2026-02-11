export default function Card({ children, className = "" }) {
    return (
        <div
            className={
                "rounded-2xl border border-slate-200 bg-white/80 backdrop-blur " +
                "shadow-[0_10px_30px_rgba(2,6,23,0.08)] " +
                className
            }
        >
            {children}
        </div>
    );
}
