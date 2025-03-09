"use client";

import { useCallback, useState } from "react";
import { useNavigationInterceptors } from "@yaredfall/next-navigation-interception";

export default function RouterNavigation({}) {
    const [prevent, setPrevent] = useState(false);
    const onRouterNavigation = useCallback(() => {
        console.log("ROUTER NAVIGATION");
        return !prevent;
    }, [prevent]);
    useNavigationInterceptors({ 
        onBack: onRouterNavigation,
        onForward: onRouterNavigation,
        onPush: onRouterNavigation,
        onReplace: onRouterNavigation,
     });
    return <button onClick={() => setPrevent((prev) => !prev)}>prevent router navigation: {String(prevent)}</button>;
}
