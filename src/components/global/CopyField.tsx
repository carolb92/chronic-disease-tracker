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
		<div className="flex items-center gap-2 border border-transparent bg-gray-200/50 py-1 px-3 rounded-md justify-between">
			<span>{text}</span>
			<button onClick={handleCopy} disabled={copied}>
				{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
			</button>
		</div>
	);
}
