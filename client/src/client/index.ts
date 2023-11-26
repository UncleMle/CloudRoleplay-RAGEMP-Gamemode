import AdminSystem from "./AdminSystem/AdminSystem";
import PlayerAuthentication from "./Authentication/PlayerAuthentication";
import BrowserSystem from "./BrowserSystem/BrowserSystem";
import NameTags from "./Nametags/Nametags";
import AdminFly from "./AdminSystem/AdminFly";
import AdminEvents from "./AdminSystem/AdminEvents";
import SwitchCamera from "./Authentication/SwitchCamera";
import GuiSystem from "./BrowserSystem/GuiSystem";
import EnterVehicle from "./VehicleSystems/EnterVehicle";
import VehicleLocking from "./VehicleSystems/VehicleLocking";
import NotificationSystem from "./NotificationSystem/NotificationSystem";

// initialize client classes.
new PlayerAuthentication();
new BrowserSystem();
new AdminSystem();
new NameTags();
new AdminFly();
new AdminEvents();
new SwitchCamera();
new GuiSystem();
new EnterVehicle();
new VehicleLocking();
new NotificationSystem();
