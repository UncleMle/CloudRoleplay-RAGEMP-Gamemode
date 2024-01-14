export function getCarImagePath (vehSpawnName) {
    try {
        const imageModule = require(`./assets/img/cars/${vehSpawnName}.png`);
        return imageModule;
    } catch (error) {
        return require("./assets/img/cars/sentinel.png");
    }
}

export function sendToServer(eventName, value) {
    if(window.mp) {
        window.mp.trigger("browser:sendString", eventName, value);
    } else {
        console.log(`MP EVENT |${eventName}| args: ${value}`);
    }
}