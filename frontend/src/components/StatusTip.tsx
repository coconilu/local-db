import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

type StatusTipProps = {
  label: string;
  children: ReactNode;
};

export function StatusTip({ label, children }: StatusTipProps) {
  return (
    <Tooltip.Provider delayDuration={180}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip" sideOffset={8}>
            {label}
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
