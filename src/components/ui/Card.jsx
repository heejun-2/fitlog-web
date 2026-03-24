export default function Card({ children, className = "" }) {
    return <div className={`ds-glass ds-panel ${className}`}>{children}</div>;
}
