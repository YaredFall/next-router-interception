"use client";

import { PropsWithChildren, useRef } from "react";
import { NavigationEventsEmitterProvider, NavigationInterceptionEvents } from "../hooks/useNavigationEventsEmmiter";
import mitt from "../utils/emitter";

export function NavigationInterceptionProvider({ children }: PropsWithChildren) {
    const emitter = useRef(mitt<NavigationInterceptionEvents>());

    return <NavigationEventsEmitterProvider emitter={emitter.current}>{children}</NavigationEventsEmitterProvider>;
}
