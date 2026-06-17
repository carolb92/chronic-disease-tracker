import { useState, useRef, useEffect } from "react";
import { Copy, Check } from "lucide-react";

type CopyStatus = "idle" | "copied" | "error";

export default function CopyField({ text }: { text: string }) {
	const [status, setStatus] = useState<CopyStatus>("idle");
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setStatus("copied");
		} catch {
			setStatus("error");
		}
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
	};

	if (status === "error") {
		return (
			<div className="rounded-lg bg-status-danger/10 px-3 py-1.5 text-sm text-status-danger">
				Something went wrong — try copying manually
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 bg-metric py-1.5 px-3 rounded-lg justify-between font-mono text-sm text-metric-foreground">
			<span className="truncate">{text}</span>
			<button
				onClick={handleCopy}
				disabled={status !== "idle"}
				className="shrink-0 rounded-md p-1 transition-colors hover:bg-primary/10 text-muted-foreground hover:text-primary"
			>
				{status === "copied" ? (
					<Check className="h-4 w-4 text-status-ok" />
				) : (
					<Copy className="h-4 w-4" />
				)}
			</button>
		</div>
	);
}
