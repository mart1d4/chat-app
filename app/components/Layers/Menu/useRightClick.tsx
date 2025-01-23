import type { ElementProps, FloatingRootContext } from "@floating-ui/react";
import { useMemo } from "react";

export interface UseClickProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean;
}

/**
 * Opens or closes the floating element when clicking the reference element.
 * @see https://floating-ui.com/docs/useClick
 */
export function useRightClick(
    context: FloatingRootContext,
    props: UseClickProps = {}
): ElementProps {
    const {
        open,
        onOpenChange,
        refs,
        dataRef,
        elements: { domReference },
    } = context;
    const { enabled = true } = props;

    const reference: ElementProps["reference"] = useMemo(
        () => ({
            onContextMenu(event) {
                onOpenChange(true, event.nativeEvent);
                refs.setPositionReference({
                    getBoundingClientRect() {
                        return {
                            width: 0,
                            height: 0,
                            x: event.clientX,
                            y: event.clientY,
                            top: event.clientY,
                            right: event.clientX,
                            bottom: event.clientY,
                            left: event.clientX,
                        };
                    },
                });
            },
            onMouseDown(event) {
                if (open) {
                    onOpenChange(false, event.nativeEvent);
                }
            },
        }),
        [dataRef, domReference, onOpenChange, open]
    );

    return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
