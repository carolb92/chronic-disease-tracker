import CopyField from "@/components/global/CopyField";
import InstructionsCard from "./InstructionsCard";

type PatientCardProps = {
	ptName: string;
	description: string;
	ptID: string;
};

export default function PatientCard({
	ptName,
	description,
	ptID,
}: PatientCardProps) {
	return (
		<InstructionsCard
			title={ptName}
			description={description}
			width="w-full md:w-1/2"
		>
			<div>
				<CopyField text={ptID} />
			</div>
		</InstructionsCard>
	);
}
