import "./styles.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { createRoot } from "react-dom/client";

import { App } from "./App";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <App />
  </TooltipProvider>
);
