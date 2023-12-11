using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.Vehicles
{
    public class VehicleModSystem : Script
    {
        public static string _colShapeIdentifer = "customsAreaColshapeData";
        public static List<CustomArea> customsAreas = new List<CustomArea>
        {
            new CustomArea
            {
                custom_id = 0,
                position = new Vector3(-375.8, -124.8, 38.6),
                size = 60f,
                name = "Los Santos Customs"
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void addColShapes()
        {
            foreach(CustomArea col in customsAreas)
            {
                ColShape colshape = NAPI.ColShape.CreateSphereColShape(col.position, col.size, 0);
                NAPI.Blip.CreateBlip(544, col.position, 1.0f, 63, col.name, 255, 1.0f, true, 0, 0);
                setColData(colshape, col);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void enterColShape(ColShape colShape, Player player)
        {
            CustomArea colShapeData = colShape.GetData<CustomArea>(_colShapeIdentifer);

            if(colShapeData != null)
            {
                setPlayerColData(player, colShapeData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void onExitColShape(ColShape colShape, Player player)
        {
            CustomArea colShapeData = colShape.GetData<CustomArea>(_colShapeIdentifer);

            if(colShapeData != null)
            {
                flushPlayerColData(player);
            }
        }

        [Command("mods", "~y~Use: ~w~/mods")]
        public void modsCommand(Player player)
        {
            if(player.GetData<CustomArea>(_colShapeIdentifer) == null)
            {
                CommandUtils.errorSay(player, "You must be within one of the customs areas to use this command.");
                return;
            }

            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (characterData == null) return;

            if(!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "This command must be used inside of a vehicle.");
                return;
            }

            Vehicle viewModsVehicle = player.Vehicle;
            DbVehicle vehicleData = VehicleSystem.getVehicleData(viewModsVehicle);

            if(vehicleData != null)
            {
                player.TriggerEvent("customs:loadIndexes");

                uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleMods, vehicleData.vehicle_mods);
                uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleModsOld, vehicleData.vehicle_mods);

                uiHandling.pushRouterToClient(player, Browsers.ModsView);
            }
        }

        [RemoteEvent("server:vehicleModsSave")]
        public void saveVehiclesMods(Player player, string modData)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (!player.IsInVehicle || characterData == null) return;

            Vehicle pVeh = player.Vehicle;
            DbVehicle pVehData = VehicleSystem.getVehicleData(pVeh);
            if(pVehData != null)
            {
                VehicleMods newModData = JsonConvert.DeserializeObject<VehicleMods>(modData);
                if(newModData == null)
                {
                    uiHandling.sendPushNotifError(player, "There was an error handling this request.", 6600, true);
                    return;
                }

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    VehicleMods currentData = dbContext.vehicle_mods
                        .Where(mod => mod.vehicle_owner_id == pVehData.vehicle_id)
                        .FirstOrDefault();

                    if(currentData != null)
                    {
                        newModData.vehicle_owner_id = pVehData.vehicle_id;

                        dbContext.vehicle_mods.Remove(currentData);
                        dbContext.vehicle_mods.Add(newModData);

                        pVehData.vehicle_mods = newModData;
                        dbContext.SaveChanges();
                        VehicleSystem.setVehicleData(pVeh, pVehData);
                    }
                }
            }

            uiHandling.sendPushNotif(player, "You successfully modified your vehicle!", 6600, true, true, true);
            uiHandling.pushRouterToClient(player, Browsers.None);
            uiHandling.toggleGui(player, true);
        }

        public static void setColData(ColShape colshape, CustomArea customsData)
        {
            colshape.SetSharedData(_colShapeIdentifer, customsData);
            colshape.SetData(_colShapeIdentifer, customsData);
        }

        public static void setPlayerColData(Player player, CustomArea customAreaData)
        {
            player.SetData(_colShapeIdentifer, customAreaData);
            player.SetSharedData(_colShapeIdentifer, customAreaData);
        }
        
        public static void flushPlayerColData(Player player)
        {
            player.ResetData(_colShapeIdentifer);
            player.ResetSharedData(_colShapeIdentifer);
        }
    }
}
