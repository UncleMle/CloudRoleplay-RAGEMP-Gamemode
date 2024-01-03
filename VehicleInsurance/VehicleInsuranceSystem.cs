using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using CloudRP.World;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloudRP.VehicleInsurance
{
    public class VehicleInsuranceSystem : Script
    {
        public static string _insuranceDataIdentifier = "vehicleInsuranceData";
        public static List<InsuranceArea> insuranceAreas = new List<InsuranceArea>
        {
            new InsuranceArea
            {
                insuranceId = 0,
                insuranceName = "Mors Mutual Insurance",
                retrievePosition = new Vector3(-836.5, -273.6, 38.8),
                spawnPosition = new Vector3(-860.4, -262.6, 39.8),
                retrieveFee = 1200
            },
            new InsuranceArea
            {
                insuranceId = 1,
                insuranceName = "Mors Mutual Paleto",
                retrievePosition = new Vector3(-227.6, 6333.6, 32.4),
                spawnPosition = new Vector3(-219.7, 6342.0, 32.3),
                retrieveFee = 2500
            },
        };

        public VehicleInsuranceSystem()
        {
            NAPI.Task.Run(() =>
            {
                insuranceAreas.ForEach(area =>
                {
                    NAPI.Blip.CreateBlip(380, area.retrievePosition, 1.0f, 49, area.insuranceName, 255, 1.0f, true, 0, 0);
                    MarkersAndLabels.setPlaceMarker(area.retrievePosition);
                    MarkersAndLabels.setTextLabel(area.retrievePosition, area.insuranceName + "\nUse ~y~Y~w~ to interact", 5f);

                    ColShape insuranceCol = NAPI.ColShape.CreateSphereColShape(area.retrievePosition, 2.0f, 0);
                    insuranceCol.SetData(_insuranceDataIdentifier, area);

                    insuranceCol.OnEntityEnterColShape += (shape, player) =>
                    {
                        InsuranceArea insuranceColData = shape.GetData<InsuranceArea>(_insuranceDataIdentifier);

                        if (insuranceColData != null && PlayersData.getPlayerCharacterData(player) != null)
                        {
                            player.SetData(_insuranceDataIdentifier, insuranceColData);
                            player.SetSharedData(_insuranceDataIdentifier, insuranceColData);
                        }
                    };

                    insuranceCol.OnEntityExitColShape += (shape, player) =>
                    {
                        InsuranceArea insuranceColData = shape.GetData<InsuranceArea>(_insuranceDataIdentifier);

                        if (insuranceColData != null)
                        {
                            player.ResetData(_insuranceDataIdentifier);
                            player.ResetSharedData(_insuranceDataIdentifier);
                        }
                    };
                    
                });
            });
        }

        [RemoteEvent("server:viewInsuranceVehicles")]
        public void viewServerInsuranceVehicles(Player player)
        {
            InsuranceArea playerInsuranceData = player.GetData<InsuranceArea>(_insuranceDataIdentifier);
            DbCharacter charData = PlayersData.getPlayerCharacterData(player);

            if (playerInsuranceData != null && charData != null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    List<DbVehicle> inInsuranceVehicles = dbContext.vehicles
                        .Where(veh => veh.owner_id == charData.character_id && veh.vehicle_dimension == VehicleDimensions.Insurance && veh.vehicle_insurance_id == playerInsuranceData.insuranceId)
                        .ToList();

                    if (inInsuranceVehicles.Count > 0)
                    {
                        uiHandling.pushRouterToClient(player, Browsers.Insurance);
                        uiHandling.handleObjectUiMutation(player, MutationKeys.InsuranceVehicles, inInsuranceVehicles);
                    } else
                    {
                        uiHandling.sendPushNotifError(player, "You don't have any vehicles stored in this insurance.", 5500);
                    }
                }
            }
        }

        [RemoteEvent("server:removeVehicleFromInsurance")]
        public void removeVehicleFromInsurance(Player player, int vehicleId)
        {
            InsuranceArea playerInsuranceData = player.GetData<InsuranceArea>(_insuranceDataIdentifier);
            DbCharacter charData = PlayersData.getPlayerCharacterData(player);

            if(playerInsuranceData != null && charData != null)
            {
                if( (charData.money_amount - playerInsuranceData.retrieveFee) < 0)
                {
                    uiHandling.sendPushNotifError(player, $"You don't have enough money to pay for this. You need {(playerInsuranceData.retrieveFee - charData.money_amount)} more.", 5500);
                    return;
                }
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    DbVehicle findFromDb = dbContext.vehicles
                        .Where(veh => veh.vehicle_id == vehicleId && veh.vehicle_dimension == VehicleDimensions.Insurance && veh.vehicle_insurance_id == playerInsuranceData.insuranceId)
                        .FirstOrDefault();

                    if (findFromDb != null)
                    {
                        uiHandling.pushRouterToClient(player, Browsers.None);

                        findFromDb.vehicle_dimension = VehicleDimensions.World;

                        dbContext.vehicles.Update(findFromDb);
                        dbContext.SaveChanges();

                        VehicleSystem.spawnVehicle(findFromDb, playerInsuranceData.spawnPosition);

                        charData.money_amount -= playerInsuranceData.retrieveFee;

                        PlayersData.setPlayerCharacterData(player, charData, false, true);
                        ChatUtils.formatConsolePrint($"{charData.character_name} retrieved their vehicle [{findFromDb.numberplate}] from {playerInsuranceData.insuranceName} for {playerInsuranceData.retrieveFee.ToString("C")}");
                        CommandUtils.successSay(player, $"You retrieved your vehicle [{findFromDb.numberplate}] from {playerInsuranceData.insuranceName} for {playerInsuranceData.retrieveFee.ToString("C")}. The vehicle has ~y~been marked on the map~w~.");

                        MarkersAndLabels.addBlipForClient(player, 380, $"Your vehicle [{findFromDb.numberplate}]", playerInsuranceData.spawnPosition, 70, 255);
                    }
                    else
                    {
                        uiHandling.sendPushNotifError(player, "Vehicle wasn't found.", 5500);
                    }
                }
            }
        }
    }
}
