export function getCarImagePath (vehSpawnName) {
    try {
        const imageModule = require(`./assets/img/cars/${vehSpawnName}.png`);
        return imageModule;
    } catch (error) {
        return require("./assets/img/cars/sentinel.png");
    }
}

export function sendToServer(eventName, ...args) {
    if(window.mp) {
        window.mp.trigger("browser:sendString", eventName, args);
    } else {
        console.log(`MP EVENT |${eventName}| args: ${args.join(',')}`);
    }
}