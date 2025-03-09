# next-navigation-interception

Run callbacks before user navigation with ability to prevent navigation.

> For Next.js 13+ with App Router

## Install

```sh
npm i @yaredfall/next-navigation-interception
```

## Features

-   intercept navigation through `Link` component and app router methods (`push`, `replace` and others)
-   intercept navigation through browser back and forward buttons (`popstate` events)
-   prevent page leave on tab refresh/close

## Usage

Wrap your application with `NavigationInterceptionProvider`:

```tsx
// src/app/layout.tsx
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <NavigationInterceptionProvider>
                    {children}
                </NavigationInterceptionProvider>
            </body>
        </html>
    );
}
```

Use `useNavigationInterceptors` to intercept navigation events in any part of your application:

```tsx
// src/app/demo/page.tsx
"use client";

import { useCallback } from "react";
import { useNavigationInterceptors } from "@yaredfall/next-navigation-interception";

export default function Page() {
    const onBeforeunload = useCallback(() => {
        // Just return `false` to prevent navigation!
        return false;
    }, []);
    const onBeforePageChange = useCallback(() => {
        return confirm("Are you sure you want to leave this page?");
    }, []);

    useNavigationInterceptors({ 
        onBeforeunload,
        onPopstate: onBeforePageChange,
        onBack: onBeforePageChange,
        onForward: onBeforePageChange,
        onPush: onBeforePageChange,
        onReplace: onBeforePageChange,
        onRefresh: onBeforePageChange,
    });

    return <div>User will be prompted before page leave</div>;
}
```

You can have multiple interceptors per event. They will be executed in order.
Async interceptors are awaited one by one.
When any of the event interceptors returns `false`, the event is immediately prevented
