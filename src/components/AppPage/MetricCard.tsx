export type MetricStatus = "good" | "neutral" | "bad";

type Props = {
	label: string;
	value: string;
	subtext?: string;
	status?: MetricStatus;
};

const valueColor: Record<MetricStatus, string> = {
	good: "text-primary",
	neutral: "text-foreground",
	bad: "text-destructive",
};

const accentBorder: Record<MetricStatus, string> = {
	good: "border-l-primary/80",
	neutral: "border-l-slate-300",
	bad: "border-l-destructive/70",
};

export default function MetricCard({
	label,
	value,
	subtext,
	status = "neutral",
}: Props) {
	return (
		<div
			className={`rounded-lg border border-primary/20 border-l-3 ${accentBorder[status]} bg-card p-4`}
		>
			<p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
			<p className={`text-xl font-semibold ${valueColor[status]}`}>{value}</p>
			{subtext && (
				<p className="mt-1 text-xs text-muted-foreground/70">{subtext}</p>
			)}
		</div>
	);
}
