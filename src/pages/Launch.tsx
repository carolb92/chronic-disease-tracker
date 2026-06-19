import { useEffect } from "react";
import FHIR from "fhirclient";

export default function Launch() {
	useEffect(() => {
		FHIR.oauth2.authorize({
			clientId: "chronic-disease-tracker",
			scope: "launch openid fhirUser patient/*.read",
			redirectUri: "/app",
		});
	}, []);
	return null;
}
