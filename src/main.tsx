import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.tsx'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import AppPage from "./pages/AppPage.tsx";
import Instructions from "./pages/Instructions.tsx";
import Launch from "./pages/Launch.tsx";

const router = createBrowserRouter([
	{
		path: "/app",
		element: <AppPage />,
	},
	{
		path: "/instructions",
		element: <Instructions />,
	},
	{
		path: "/launch",
		element: <Launch />,
	},
	{
		path: "/",
		element: <Navigate to="/instructions" replace />,
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
