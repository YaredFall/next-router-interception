"use client";

import { useCallback, useState } from "react";
import { useNavigationInterceptors } from "@yaredfall/next-navigation-interception";

export default function Popstate({}) {
    const [prevent, setPrevent] = useState(false);
    const onPopstate = useCallback(() => {
        console.log("POPSTATE");
        return !prevent;
    }, [prevent]);
    useNavigationInterceptors({ onPopstate,  });
    return <button onClick={() => setPrevent((prev) => !prev)}>prevent popstate: {String(prevent)}</button>;
}
