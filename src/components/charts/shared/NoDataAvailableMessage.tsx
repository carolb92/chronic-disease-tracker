export default function NoDataAvailableMessage({
	dataType,
}: {
	dataType: string;
}) {
	return (
		<div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
			{`No ${dataType} data available`}
		</div>
	);
}
