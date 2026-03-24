export default function Button({
    children,
    className = "",
    variant = "primary",
    ...props
}) {
    const base = "ds-btn";

    const variants = {
        primary: "ds-btn-primary",
        ghost: "ds-btn-ghost",
        danger: "ds-btn-danger",
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}
