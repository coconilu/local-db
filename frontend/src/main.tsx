import "./styles.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { createRoot } from "react-dom/client";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <App />
  </TooltipProvider>
);
