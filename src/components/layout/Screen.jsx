export default function Screen({ children, style, className = "" }) {
  return (
    <main className={`screen ${className}`} style={style}>
      {children}
    </main>
  );
}
