import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardAction,
	CardContent,
} from "@/components/ui/card";
import React from "react";

type InstructionsCardProps = {
	title: string;
	description?: string;
	children?: React.ReactNode;
	action?: React.ReactNode;
	width?: string;
	stepNumber?: number;
};

export default function InstructionsCard({
	title,
	description = "",
	children,
	action,
	width = "w-full",
	stepNumber,
}: InstructionsCardProps) {
	return (
		<Card className={width}>
			<CardHeader>
				<CardTitle>
					<span className="flex gap-x-2.5 items-center">
						{stepNumber != null && (
							<span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground w-6 h-6 text-xs font-semibold shrink-0">
								{stepNumber}
							</span>
						)}
						<span className="text-primary">{title}</span>
					</span>
				</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
				{action && <CardAction>{action}</CardAction>}
			</CardHeader>
			{children && <CardContent>{children}</CardContent>}
		</Card>
	);
}
