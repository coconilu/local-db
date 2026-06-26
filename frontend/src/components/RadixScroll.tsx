import * as ScrollArea from "@radix-ui/react-scroll-area";
import type { ReactNode } from "react";

type RadixScrollProps = {
  children: ReactNode;
  className?: string;
};

export function RadixScroll({ children, className }: RadixScrollProps) {
  return (
    <ScrollArea.Root className={className}>
      <ScrollArea.Viewport className="scroll-viewport">{children}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
        <ScrollArea.Thumb className="scroll-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
