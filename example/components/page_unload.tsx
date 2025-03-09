"use client";

import { useCallback, useState } from "react";
import { useNavigationInterceptors } from "@yaredfall/next-navigation-interception";

export default function PageUnload({}) {
    const [prevent, setPrevent] = useState(false);
    const onBeforeunload = useCallback(() => {
        console.log("PAGE UNLOAD");
        return !prevent;
    }, [prevent]);
    useNavigationInterceptors({ onBeforeunload });
    return <button onClick={() => setPrevent((prev) => !prev)}>prevent beforeunload: {String(prevent)}</button>;
}
