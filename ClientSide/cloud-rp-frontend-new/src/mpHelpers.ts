const callServerMiddlewareEvent: string = "client:remoteEventCallMiddleware";

export const addMpEvent = (eventName: string, callBack: (...args: any[]) => void) => {
    if ("mp" in window) mp.events.add(eventName, callBack);
    else console.log("Registered event " + eventName);
}

export const sendToServer = (eventName: string, ...args: any[]) => {
    if ("mp" in window) mp.trigger(callServerMiddlewareEvent, eventName, ...args);
    else console.log(`Called server event ${eventName} with parameters [${args.join(", ")}]`);
}

export const sendToClient = (eventName: string, ...args: any[]) => {
    if ("mp" in window) {
        console.log(`Mp Events ${eventName} args ${args.join(", ")}`)
        mp.trigger(eventName, ...args);
    }
    else console.log(`Called client event ${eventName} with parameters [${args.join(", ")}]`);
}