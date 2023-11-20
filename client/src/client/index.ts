import AdminSystem from "./AdminSystem/AdminSystem";
import PlayerAuthentication from "./Authentication/PlayerAuthentication";
import BrowserSystem from "./BrowserSystem/BrowserSystem";
import NameTags from "./Nametags/Nametags";

// initialize client classes.
new PlayerAuthentication();
new BrowserSystem();
new AdminSystem();
new NameTags();
