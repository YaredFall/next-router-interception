export type EventType = string | symbol | number;

export type Handler<T = unknown> = (event: T) => boolean | void | Promise<boolean | void>;

export type EventHandlerList<T = unknown> = Set<Handler<T>>;

export type EventsHandlers<Events extends Record<EventType, unknown>> = {
    [Key in keyof Events]: Handler<Events[Key]>;
};

export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
    keyof Events,
    EventHandlerList<Events[keyof Events]>
>;

export interface Emitter<Events extends Record<EventType, unknown>> {
    all: EventHandlerMap<Events>;

    on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]> | undefined): void;

    off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]> | undefined): void;

    emit(type: keyof Events, event: Events[keyof Events]): Promise<boolean>;
    emit(type: undefined extends Events[keyof Events] ? keyof Events : never): Promise<boolean>;
}

export default function mitt<Events extends Record<EventType, unknown>>(all?: EventHandlerMap<Events>): Emitter<Events> {
    type GenericEventHandler = Handler<Events[keyof Events]> | undefined;
    all = all || new Map();

    return {
        /**
         * A Map of event names to registered handler functions.
         */
        all,

        /**
         * Register an event handler for the given type.
         * @param {string|symbol} type Type of event to listen for
         * @param {Function} handler Function to call in response to given event
         */
        on(type, handler) {
            if (!handler) return;

            const handlers: Set<GenericEventHandler> | undefined = all!.get(type);
            if (handlers) {
                handlers.add(handler as GenericEventHandler);
            } else {
                all!.set(type, new Set([handler as Exclude<GenericEventHandler, undefined>]));
            }
        },

        /**
         * Remove an event handler for the given type.
         * @param {string|symbol} type Type of event to unregister `handler` from
         * @param {Function} [handler] Handler function to remove
         */
        off(type, handler) {
            if (!handler) return;

            const handlers: Set<GenericEventHandler> | undefined = all!.get(type);
            handlers?.delete(handler as GenericEventHandler);
        },

        /**
         * @param {string|symbol} type The event type to invoke
         * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
         */
        async emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
            const handlers = all!.get(type);
            if (handlers) {
                for (const handler of Array.from(handlers)) {
                    const shouldContinue = (await handler(evt!)) ?? true;
                    if (!shouldContinue) return false;
                }
            }
            return true;
        },
    };
}
