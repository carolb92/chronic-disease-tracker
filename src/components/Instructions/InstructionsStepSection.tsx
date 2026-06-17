import type React from "react";
import { Separator } from "@/components/ui/separator";

type InstructionsStepSectionProps = {
	sectionTitle: string;
	stepNumber?: string;
	children: React.ReactNode;
	mdFlexDirection?: "md:flex-row" | "md:flex-col";
};

export default function InstructionsStepSection({
	sectionTitle,
	stepNumber,
	children,
	mdFlexDirection,
}: InstructionsStepSectionProps) {
	return (
		<div>
			<h2 className="uppercase tracking-widest text-sm text-muted-foreground">
				{stepNumber && (
					<span className="text-primary font-semibold">Step {stepNumber}:</span>
				)}{" "}
				<span className="text-primary">{sectionTitle}</span>
			</h2>
			<Separator className="mt-2 mb-4 bg-primary/30" />
			<div className={`flex flex-col gap-4 w-full ${mdFlexDirection}`}>
				{children}
			</div>
		</div>
	);
}
