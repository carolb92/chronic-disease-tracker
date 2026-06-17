import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyField({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex items-center gap-2 bg-metric py-1.5 px-3 rounded-lg justify-between font-mono text-sm text-metric-foreground">
			<span className="truncate">{text}</span>
			<button
				onClick={handleCopy}
				disabled={copied}
				className="shrink-0 rounded-md p-1 transition-colors hover:bg-primary/10 text-muted-foreground hover:text-primary"
			>
				{copied ? (
					<Check className="h-4 w-4 text-status-ok" />
				) : (
					<Copy className="h-4 w-4" />
				)}
			</button>
		</div>
	);
}
