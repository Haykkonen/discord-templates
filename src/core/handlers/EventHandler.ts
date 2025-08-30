import {Client, ClientEvents} from "discord.js";
import {IDiscordEvent} from "../types/IDiscordEvent.js";

const groupAndSortHandlers = (handlers: IDiscordEvent<any>[]) => {
    const eventMap = new Map<keyof ClientEvents, IDiscordEvent<any>[]>();

    for (const handler of handlers) {
        const existingHandlers = eventMap.get(handler.name) ?? [];
        existingHandlers.push(handler);
        eventMap.set(handler.name, existingHandlers);
    }

    for (const group of eventMap.values()) group.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    return eventMap;
};

export function registerEvents(client: Client, ...handlers: IDiscordEvent<any>[]): void {
    const eventGroups = groupAndSortHandlers(handlers);

    for (const [eventName, group] of eventGroups.entries()) {
        const dispatcher = async (...args: any[]) => {
            for (const handler of [...group]) {
                try {
                    await handler.execute(...args);
                } catch (error) {
                    console.error(`Error executing handler for event ${eventName}:`, error,);
                }

                if (handler.once) {
                    const index = group.indexOf(handler);

                    if (index > -1) group.splice(index, 1);
                }
            }

            if (group.length === 0) {
                client.removeListener(eventName, dispatcher);
                console.warn(`All handlers for event ${eventName} were removed. Listener is now off.`,);
            }
        };

        client.on(eventName, dispatcher);
        console.log(`Registered event: ${eventName} with ${group.length} handler(s).`,);
    }
}
