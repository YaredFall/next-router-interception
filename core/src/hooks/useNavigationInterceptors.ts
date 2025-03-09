import { useLayoutEffect } from "react";
import { NavigationInterceptionEventHandlers, useNavigationEventsEmitter } from "./useNavigationEventsEmmiter";

type NavigationInterceptors = {
    [Key in keyof NavigationInterceptionEventHandlers as `on${Capitalize<Key>}`]?: NavigationInterceptionEventHandlers[Key];
};

export function useNavigationInterceptors(interceptors: NavigationInterceptors) {
    const emitter = useNavigationEventsEmitter();

    useLayoutEffect(() => {
        emitter.on("back", interceptors.onBack);
        emitter.on("forward", interceptors.onForward);
        emitter.on("refresh", interceptors.onRefresh);
        emitter.on("push", interceptors.onPush);
        emitter.on("replace", interceptors.onReplace);
        emitter.on("prefetch", interceptors.onPrefetch);

        emitter.on("popstate", interceptors.onPopstate);
        emitter.on("beforeunload", interceptors.onBeforeunload);

        return () => {
            emitter.off("back", interceptors.onBack);
            emitter.off("forward", interceptors.onForward);
            emitter.off("refresh", interceptors.onRefresh);
            emitter.off("push", interceptors.onPush);
            emitter.off("replace", interceptors.onReplace);
            emitter.off("prefetch", interceptors.onPrefetch);

            emitter.off("popstate", interceptors.onPopstate);
            emitter.off("beforeunload", interceptors.onBeforeunload);
        };
    }, [
        emitter,
        interceptors.onBack,
        interceptors.onBeforeunload,
        interceptors.onForward,
        interceptors.onPopstate,
        interceptors.onPrefetch,
        interceptors.onPush,
        interceptors.onRefresh,
        interceptors.onReplace,
    ]);
}
