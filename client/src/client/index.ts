import AdminSystem from "./AdminSystem/AdminSystem";
import PlayerAuthentication from "./Authentication/PlayerAuthentication";
import BrowserSystem from "./BrowserSystem/BrowserSystem";
import NameTags from "./Nametags/Nametags";
import AdminFly from "./AdminSystem/AdminFly";
import AdminEvents from "./AdminSystem/AdminEvents";
import SwitchCamera from "./Authentication/SwitchCamera";
import GuiSystem from "./BrowserSystem/GuiSystem";

// initialize client classes.
new PlayerAuthentication();
new BrowserSystem();
new AdminSystem();
new NameTags();
new AdminFly();
new AdminEvents();
new SwitchCamera();
new GuiSystem();
