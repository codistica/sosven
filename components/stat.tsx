export function Stat({
  value,
  label,
  tone = "light",
}: {
  value: number;
  label: string;
  tone?: "light" | "dark";
}) {
  const valueColor = tone === "dark" ? "text-brand" : "text-white";
  const labelColor = tone === "dark" ? "text-muted" : "text-white/80";
  return (
    <div className="text-center sm:text-left">
      <div className={`text-3xl font-extrabold tabular-nums sm:text-4xl ${valueColor}`}>
        {value.toLocaleString("es-VE")}
      </div>
      <div className={`text-sm font-medium ${labelColor}`}>{label}</div>
    </div>
  );
}
