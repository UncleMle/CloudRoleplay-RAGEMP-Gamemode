export default function getCarImagePath (vehSpawnName) {
    try {
        const imageModule = require(`./assets/img/cars/${vehSpawnName}.png`);
        return imageModule;
    } catch (error) {
        return require("./assets/img/cars/sentinel.png");
    }
}
