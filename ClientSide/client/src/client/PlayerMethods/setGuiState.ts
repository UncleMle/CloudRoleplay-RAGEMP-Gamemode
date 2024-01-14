import BrowserSystem from "../BrowserSystem/BrowserSystem";

const setGuiState = (toggle: boolean) => {
	BrowserSystem._browserInstance.execute(`appSys.commit("setGuiState", {
		toggle: ${toggle}
	})`);
}

export default setGuiState;
