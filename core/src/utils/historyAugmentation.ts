"use client";

export interface RenderedState {
    index: number;
    token: string | null; // Prevent from two unrelated index numbers used for calculating delta.
}

let setupDone = false;
let writeState = () => {};

export function newToken() {
    return Math.random().toString(36).substring(2);
}

// Next.js also modifies history.pushState and history.replaceState in useEffect.
// And it's order seems to be not guaranteed.
// So we setup only once before Next.js does.
export function setupHistoryAugmentationOnce({ renderedStateRef }: { renderedStateRef: { current: RenderedState } }): {
    writeState: () => void;
} {
    if (setupDone) return { writeState };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    renderedStateRef.current.index = parseInt(window.history.state.__next_navigation_guard_stack_index) || 0;
    renderedStateRef.current.token = String(window.history.state.__next_navigation_guard_token ?? "") || newToken();

    writeState = () => {
        const modifiedState = {
            ...window.history.state,
            __next_navigation_guard_token: renderedStateRef.current.token,
            __next_navigation_guard_stack_index: renderedStateRef.current.index,
        };

        originalReplaceState.call(window.history, modifiedState, "", window.location.href);
    };

    if (
        window.history.state.__next_navigation_guard_stack_index == null ||
        window.history.state.__next_navigation_guard_token == null
    ) {
        writeState();
    }

    window.history.pushState = function (state, unused, url) {
        // If current state is not managed by this library, reset the state.
        if (!renderedStateRef.current.token) {
            renderedStateRef.current.token = newToken();
            renderedStateRef.current.index = -1;
        }

        ++renderedStateRef.current.index;

        const modifiedState = {
            ...state,
            __next_navigation_guard_token: renderedStateRef.current.token,
            __next_navigation_guard_stack_index: renderedStateRef.current.index,
        };
        originalPushState.call(this, modifiedState, unused, url);
    };

    window.history.replaceState = function (state, unused, url) {
        // If current state is not managed by this library, reset the state.
        if (!renderedStateRef.current.token) {
            renderedStateRef.current.token = newToken();
            renderedStateRef.current.index = 0;
        }

        const modifiedState = {
            ...state,
            __next_navigation_guard_token: renderedStateRef.current.token,
            __next_navigation_guard_stack_index: renderedStateRef.current.index,
        };
        originalReplaceState.call(this, modifiedState, unused, url);
    };

    setupDone = true;

    return { writeState };
}
