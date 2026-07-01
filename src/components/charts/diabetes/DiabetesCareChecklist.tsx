import { Card, CardContent } from "@/components/ui/card";
import type { HedisMeasureResult, MeasureStatus } from "@/lib/hedis";

type Props = {
	measures: HedisMeasureResult[];
};

const statusStyles: Record<MeasureStatus, string> = {
	met: "bg-primary/10 text-primary",
	"not-met": "bg-destructive/10 text-destructive",
	"insufficient-data": "bg-muted text-muted-foreground",
};

const statusLabel: Record<MeasureStatus, string> = {
	met: "Met",
	"not-met": "Not Met",
	"insufficient-data": "Insufficient Data",
};

export default function DiabetesCareChecklist({ measures }: Props) {
	return (
		<Card className="bg-primary/10">
			<CardContent>
				<h3 className="mb-2 text-sm font-semibold text-primary">
					Diabetes Care Checklist
				</h3>
				<p className="mb-3 text-sm">
					Research shows that people with diabetes who keep their blood pressure,
					blood sugar, and kidney health within their target range - and get
					regular eye exams - are less likely to develop complications like
					vision loss, kidney disease, and heart disease.
				</p>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{measures.map((m) => (
						<Card key={m.name}>
							<CardContent className="pt-2">
								<div className="flex flex-col gap-2">
									<span
										className={`self-start rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[m.status]}`}
									>
										{statusLabel[m.status]}
									</span>
									<p className="text-xs font-medium">{m.name}</p>
									<p className="text-xs text-muted-foreground">{m.detail}</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
