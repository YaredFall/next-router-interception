"use client";

import { AppRouterContext, AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PropsWithChildren, createContext, useContext, useLayoutEffect, useMemo } from "react";
import { Emitter, EventsHandlers } from "../utils/emitter";
import { RenderedState, newToken, setupHistoryAugmentationOnce } from "../utils/historyAugmentation";

export type NavigationInterceptionEvents = {
    [E in keyof AppRouterInstance]: { type: E; args: Parameters<AppRouterInstance[E]> };
} & {
    popstate: { type: "popstate"; args: [] };
    beforeunload: { type: "beforeunload"; args: [] };
};

export type NavigationInterceptionEventHandlers = EventsHandlers<NavigationInterceptionEvents>;

export type NavigationEventsEmitter = Emitter<NavigationInterceptionEvents>;
const NavigationEventsContext = createContext<NavigationEventsEmitter>(undefined!);

const renderedStateRef: { current: RenderedState } = {
    current: { index: -1, token: "" },
};

export const NavigationEventsEmitterProvider = ({
    children,
    emitter,
}: PropsWithChildren<{ emitter: NavigationEventsEmitter }>) => {
    const router = useContext(AppRouterContext);

    const interceptedRouter = useMemo<AppRouterInstance | null>(() => {
        if (!router) return null;

        return {
            ...router,
            back: async (...args) => {
                if (await emitter.emit("back", { type: "back", args })) router.back(...args);
            },
            forward: async (...args) => {
                if (await emitter.emit("forward", { type: "forward", args })) router.forward(...args);
            },
            refresh: async (...args) => {
                if (await emitter.emit("refresh", { type: "refresh", args })) router.refresh(...args);
            },
            push: async (...args) => {
                if (await emitter.emit("push", { type: "push", args })) router.push(...args);
            },
            replace: async (...args) => {
                if (await emitter.emit("replace", { type: "replace", args })) router.replace(...args);
            },
            prefetch: async (...args) => {
                if (await emitter.emit("prefetch", { type: "prefetch", args })) router.prefetch(...args);
            },
        };
    }, [emitter, router]);

    useLayoutEffect(() => {
        // * Called before Next.js router setup which is useEffect().
        // https://github.com/vercel/next.js/blob/50b9966ba9377fd07a27e3f80aecd131fa346482/packages/next/src/client/components/app-router.tsx#L518

        const { writeState } = setupHistoryAugmentationOnce({ renderedStateRef });
        const handlePopState = createHandlePopState(
            async () => await emitter.emit("popstate", { type: "popstate", args: [] }),
            writeState
        );

        const onPopState = async (event: PopStateEvent) => {
            if (!handlePopState(event.state)) {
                event.stopImmediatePropagation();
                console.log(event);
            }
        };
        const onBeforeOnload = async (event: BeforeUnloadEvent) => {
            const shouldContinue = await emitter.emit("beforeunload", { type: "beforeunload", args: [] });
            if (!shouldContinue) {
                event.preventDefault();
                // As MDN says, custom message has already been unsupported in majority of browsers.
                // Chrome requires returnValue to be set.
                event.returnValue = "";
                return;
            }
        };

        window.addEventListener("popstate", onPopState);
        window.addEventListener("beforeunload", onBeforeOnload);

        return () => {
            window.removeEventListener("popstate", onPopState);
            window.removeEventListener("beforeunload", onBeforeOnload);
        };
    });

    return (
        <AppRouterContext.Provider value={interceptedRouter}>
            <NavigationEventsContext.Provider value={emitter}>{children}</NavigationEventsContext.Provider>;
        </AppRouterContext.Provider>
    );
};
export const useNavigationEventsEmitter = () => useContext(NavigationEventsContext);

function createHandlePopState(guard: () => Promise<boolean>, writeState: () => void) {
    let dispatchedState: unknown;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (nextState: any): boolean => {
        const token: string | undefined = nextState.__next_navigation_guard_token;
        const nextIndex: number = Number(nextState.__next_navigation_guard_stack_index) || 0;

        if (!token || token !== renderedStateRef.current.token) {
            renderedStateRef.current.token = token || newToken();
            renderedStateRef.current.index = token ? nextIndex : 0;
            writeState();
            return true;
        }

        const delta = nextIndex - renderedStateRef.current.index;
        // When go(-delta) is called, delta should be zero.
        if (delta === 0) {
            return false;
        }

        if (nextState === dispatchedState) {
            dispatchedState = null;
            renderedStateRef.current.index = nextIndex;
            return true;
        }

        // Wait for all callbacks to be resolved
        (async () => {
            const shouldContinue = await guard();
            if (!shouldContinue) {
                if (delta !== 0) {
                    // discard event
                    window.history.go(-delta);
                }
                return;
            }

            // accept
            dispatchedState = nextState;
            window.dispatchEvent(new PopStateEvent("popstate", { state: nextState }));
        })();

        // Return false to call stopImmediatePropagation()
        return false;
    };
}
