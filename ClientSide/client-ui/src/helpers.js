export function getCarImagePath(vehSpawnName) {
    try {
        const imageModule = require(`./assets/img/cars/${vehSpawnName}.png`);
        return imageModule;
    } catch (error) {
        return require("./assets/img/cars/sentinel.png");
    }
}

export function getTruckerImagePath(jobImage) {
    try {
        const imageModule = require(`./assets/img/jobs/${jobImage}.png`);
        return imageModule;
    } catch (error) {
        return require("./assets/img/cars/sentinel.png");
    }
}

export function sendToServer(eventName, value) {
    if (window.mp) {
        window.mp.trigger("browser:sendString", eventName, value);
    } else {
        console.log(`[Server] MP EVENT | ${eventName} |  ${value}`);
    }
}

export function sendToClient(eventName, value) {
    if (window.mp) {
        window.mp.trigger(eventName, value);
    } else {
        console.log(`[Client] MP EVENT | ${eventName} |  ${value}`);
    }
}

export function getStaffRanks() {
    let adminRanksList = ["None", "Support", "Senior Support", "Moderator", "Senior Moderator", "Administrator", "Senior Administrator", "Head Administrator", "Founder", "Developer"];
    let adminRanksStyles = [
        "",
        "color: #ff00fa;",
        "color: #9666ff;",
        "color: #37db63;",
        "color: #018a35;",
        "color: #ff6363;",
        "color: #ff0000;",
        "color: #00bbff;",
        "color: #c096ff;",
        "background: -webkit-linear-gradient(#DAB8FF, #7AC8EE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
    ];

    return { adminRanksList, adminRanksStyles };
}