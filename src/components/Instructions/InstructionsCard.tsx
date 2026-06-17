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
					<span className="flex gap-x-2 items-center">
						{stepNumber && (
							<div className="p-1 rounded-full bg-gray-200/50 w-6 h-6 flex justify-center items-center">
								{stepNumber}
							</div>
						)}
						<span>{title}</span>
					</span>
				</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
				{action && <CardAction>{action}</CardAction>}
			</CardHeader>
			{children && <CardContent>{children}</CardContent>}
		</Card>
	);
}
