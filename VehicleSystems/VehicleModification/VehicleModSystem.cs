using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.VehicleSystems.VehicleModification
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

        public VehicleModSystem()
        {
            foreach (CustomArea col in customsAreas)
            {
                ColShape colshape = NAPI.ColShape.CreateSphereColShape(col.position, col.size, 0);
                NAPI.Blip.CreateBlip(544, col.position, 1.0f, 4, col.name, 255, 1.0f, true, 0, 0);
                setColData(colshape, col);

                colshape.OnEntityEnterColShape += (shape, player) =>
                {
                    if (shape.Equals(colshape))
                    {
                        setPlayerColData(player, col);
                    }
                };
                
                colshape.OnEntityExitColShape += (shape, player) =>
                {
                    if (shape.Equals(colshape))
                    {
                        flushPlayerColData(player);
                    }
                };
            }
        }

        [Command("mods", "~y~Use: ~w~/mods")]
        public void modsCommand(Player player)
        {
            if(player.IsInVehicle && player.Vehicle.getData()?.dealership_id != -1)
            {
                DbVehicle playerDealerVehData = player.Vehicle.getData();

                if(playerDealerVehData != null)
                {
                    player.TriggerEvent("customs:loadIndexes");

                    uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerVehDealer, true);
                    uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleMods, playerDealerVehData.vehicle_mods);
                    uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleModsOld, playerDealerVehData.vehicle_mods);

                    uiHandling.pushRouterToClient(player, Browsers.ModsView);

                    return;
                } 
            }


            if (player.GetData<CustomArea>(_colShapeIdentifer) == null)
            {
                CommandUtils.errorSay(player, "You must be within one of the customs areas or viewing a dealer vehicle to use this command.");
                return;
            }

            DbCharacter characterData = player.getPlayerCharacterData();

            if (characterData == null) return;

            if (!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "This command must be used inside of a vehicle.");
                return;
            }

            Vehicle viewModsVehicle = player.Vehicle;
            DbVehicle vehicleData = viewModsVehicle.getData();

            if (vehicleData != null)
            {
                if (vehicleData.owner_id != characterData.character_id)
                {
                    CommandUtils.errorSay(player, "You must be the owner of the vehicle.");
                    return;
                }

                player.TriggerEvent("customs:loadIndexes");

                uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleMods, vehicleData.vehicle_mods);
                uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleModsOld, vehicleData.vehicle_mods);

                uiHandling.pushRouterToClient(player, Browsers.ModsView);
            }
        }

        [RemoteEvent("server:vehicleModsSave")]
        public void saveVehiclesMods(Player player, string modData)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if (!player.IsInVehicle || characterData == null) return;

            player.TriggerEvent("customs:toggleVehicleFreeze", false);

            Vehicle pVeh = player.Vehicle;
            DbVehicle pVehData = pVeh.getData();
            if (pVehData != null)
            {
                if (pVehData.owner_id != characterData.character_id)
                {
                    uiHandling.sendPushNotifError(player, "Not sure how you got here but you can't be here.", 6600, true);
                    return;
                }

                VehicleMods newModData = JsonConvert.DeserializeObject<VehicleMods>(modData);
                if (newModData == null)
                {
                    uiHandling.sendPushNotifError(player, "There was an error handling this request.", 6600, true);
                    return;
                }

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    VehicleMods currentData = dbContext.vehicle_mods
                        .Where(mod => mod.vehicle_owner_id == pVehData.vehicle_id)
                        .FirstOrDefault();

                    if (currentData != null)
                    {
                        newModData.vehicle_owner_id = pVehData.vehicle_id;

                        dbContext.vehicle_mods.Remove(currentData);
                        dbContext.vehicle_mods.Add(newModData);

                        pVehData.vehicle_mods = newModData;
                        dbContext.SaveChanges();
                        pVeh.setVehicleData(pVehData, true);
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
            player.SetCustomData(_colShapeIdentifer, customAreaData);
            player.SetCustomSharedData(_colShapeIdentifer, customAreaData);
        }

        public static void flushPlayerColData(Player player)
        {
            player.ResetData(_colShapeIdentifer);
            player.ResetSharedData(_colShapeIdentifer);
        }
    }
}
