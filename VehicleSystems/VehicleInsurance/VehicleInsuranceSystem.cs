using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloudRP.VehicleSystems.VehicleInsurance
{
    public class VehicleInsuranceSystem : Script
    {
        public static readonly string _insuranceDataIdentifier = "vehicleInsuranceData";
        public static readonly int insureVehicleFee = 400;
        public static readonly float insuranceVehicleMaxDist = 60;
        public static readonly List<InsuranceArea> insuranceAreas = new List<InsuranceArea>
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
            }
        };

        public VehicleInsuranceSystem()
        {
            NAPI.Task.Run(() =>
            {
                insuranceAreas.ForEach(area =>
                {
                    NAPI.Blip.CreateBlip(380, area.retrievePosition, 1.0f, 49, area.insuranceName, 255, 1.0f, true, 0, 0);

                    RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
                    {
                        menuTitle = "Vehicle Insurance",
                        raycastMenuItems = new string[] { "View vehicle insurance" },
                        raycastMenuPosition = area.retrievePosition,
                        targetMethod = viewServerInsuranceVehicles
                    });

                    ColShape insuranceCol = NAPI.ColShape.CreateSphereColShape(area.retrievePosition, 2.0f, 0);
                    insuranceCol.SetData(_insuranceDataIdentifier, area);

                    insuranceCol.OnEntityEnterColShape += (shape, player) =>
                    {
                        InsuranceArea insuranceColData = shape.GetData<InsuranceArea>(_insuranceDataIdentifier);

                        if (insuranceColData != null && player.getPlayerCharacterData() != null)
                        {
                            player.SetCustomData(_insuranceDataIdentifier, insuranceColData);
                            player.SetCustomSharedData(_insuranceDataIdentifier, insuranceColData);
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

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {insuranceAreas.Count} insurance areas were loaded.");
        }

        public void viewServerInsuranceVehicles(Player player, string rayOption)
        {
            InsuranceArea playerInsuranceData = player.GetData<InsuranceArea>(_insuranceDataIdentifier);
            DbCharacter charData = player.getPlayerCharacterData();

            if (playerInsuranceData != null && charData != null)
            {
                List<DbVehicle> inInsuranceVehicles = VehicleSystem.getInsuranceVehicles(player, playerInsuranceData.insuranceId);
                List<DbVehicle> unInsuredVehicles = VehicleSystem.getPlayerUninsuredVehicles(player);

                uiHandling.pushRouterToClient(player, Browsers.Insurance);
                uiHandling.resetMutationPusher(player, MutationKeys.InsuranceVehicles);
                uiHandling.resetMutationPusher(player, MutationKeys.UninsuredVehicles);

                unInsuredVehicles.ForEach(veh =>
                {
                    Vehicle found = VehicleSystem.checkInstance(veh);

                    if(found != null && Vector3.Distance(player.Position, found.Position) < insuranceVehicleMaxDist)
                    {
                        uiHandling.handleObjectUiMutationPush(player, MutationKeys.UninsuredVehicles, veh);
                    }
                });

                inInsuranceVehicles.ForEach(veh =>
                {
                    uiHandling.handleObjectUiMutationPush(player, MutationKeys.InsuranceVehicles, veh);
                });
            }
        }

        [RemoteEvent("server:insureVehicle")]
        public void insureVehicle(Player player, int vehicleId)
        {
            InsuranceArea playerInsuranceData = player.GetData<InsuranceArea>(_insuranceDataIdentifier);
            DbCharacter character = player.getPlayerCharacterData();

            if (playerInsuranceData == null || character == null) return;

            Vehicle targetVehicle = VehicleSystem.getVehicleById(vehicleId, null, false);

            if(targetVehicle == null) return;

            if(Vector3.Distance(targetVehicle.Position, player.Position) > insuranceVehicleMaxDist)
            {
                uiHandling.sendPushNotifError(player, "Vehicle is too far a distance from the insurance company.", 6600);
                return;
            }

            DbVehicle vehicleData = targetVehicle.getData();

            if (vehicleData == null || vehicleData != null && vehicleData.insurance_status) return;

            if(character.money_amount - insureVehicleFee < 0)
            {
                long difference = insureVehicleFee - character.money_amount;

                uiHandling.sendPushNotifError(player, $"You don't have enough to pay for the insurance fee. You need ${difference.ToString("N0")} more.", 6600);
                return;
            }

            uiHandling.resetRouter(player);

            character.money_amount -= insureVehicleFee;
            player.setPlayerCharacterData(character, false, true);

            string newPlate = VehicleSystem.genUniquePlate(vehicleData.vehicle_id, vehicleData.vehicle_class_id, true);

            vehicleData.numberplate = newPlate;
            vehicleData.insurance_status = true;
            targetVehicle.saveVehicleData(vehicleData, true);
            targetVehicle.NumberPlate = newPlate;

            CommandUtils.successSay(player, $"You have insured your vehicle {vehicleData.vehicle_display_name} for {ChatUtils.moneyGreen}${insureVehicleFee.ToString("N0")}{ChatUtils.White}.");
            CommandUtils.successSay(player, $"Your vehicle {vehicleData.vehicle_display_name} has been assigned a new license plate of {newPlate}");
        }

        [RemoteEvent("server:removeVehicleFromInsurance")]
        public void removeVehicleFromInsurance(Player player, int vehicleId)
        {
            InsuranceArea playerInsuranceData = player.GetData<InsuranceArea>(_insuranceDataIdentifier);
            DbCharacter charData = player.getPlayerCharacterData();

            if (playerInsuranceData != null && charData != null)
            {
                DbVehicle findFromDb = VehicleSystem.getPlayerVehicleFromInsurance(player, vehicleId, playerInsuranceData.insuranceId);

                if (findFromDb == null) return;

                int insuranceFee = findFromDb.insurance_status ? playerInsuranceData.retrieveFee : playerInsuranceData.retrieveFee * 2;

                if (charData.money_amount - insuranceFee < 0)
                {
                    uiHandling.sendPushNotifError(player, $"You don't have enough money to pay for this. You need {playerInsuranceData.retrieveFee - charData.money_amount:N0} more.", 5500);
                    return;
                }

                if(VehicleSystem.checkVehInSpot(playerInsuranceData.spawnPosition, 8) != null)
                {
                    uiHandling.sendPushNotifError(player, "There is a vehicle blocking the spawn point!", 6600);
                    return;
                }

                uiHandling.pushRouterToClient(player, Browsers.None);

                VehicleSystem.spawnVehicle(findFromDb, playerInsuranceData.spawnPosition);

                if (!findFromDb.insurance_status)
                {
                    player.SendChatMessage(ChatUtils.info + $"You have had to pay {ChatUtils.red}${playerInsuranceData.retrieveFee.ToString("N0")}{ChatUtils.White} more in insurance due to your car not being insured.");
                }

                charData.money_amount -= insuranceFee;

                player.setPlayerCharacterData(charData, false, true);
                ChatUtils.formatConsolePrint($"{charData.character_name} retrieved their vehicle [{findFromDb.numberplate}] from {playerInsuranceData.insuranceName} for ${insuranceFee.ToString("N0")}");
                CommandUtils.successSay(player, $"You retrieved your vehicle [{findFromDb.numberplate}] from {playerInsuranceData.insuranceName} for ${insuranceFee.ToString("N0")}. The vehicle has ~y~been marked on the map~w~.");

                MarkersAndLabels.addBlipForClient(player, 380, $"Your vehicle [{findFromDb.numberplate}]", playerInsuranceData.spawnPosition, 70, 255);
            }
        }
    }
}
