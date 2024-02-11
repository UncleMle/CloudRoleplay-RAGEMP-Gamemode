using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;

namespace CloudRP.VehicleSystems.VehicleRefueling
{
    public class VehicleRefuelingSystem : Script
    {
        public static string _refuelPumpIdenfitier = "refuelingPumpData";
        public static string _refuelDataIdentifier = "playerRefuelData";

        public VehicleRefuelingSystem()
        {
            KeyPressEvents.keyPress_Y += startVehicleRefuel;
            Main.playerDisconnect += removeRefuellingPlayerFromVehicle;

            VehicleRefuelStations.refuelingStations.ForEach(refuelStation =>
            {
                NAPI.Blip.CreateBlip(361, refuelStation.position, 1.0f, 75, "Gas Station", 255, 20f, true, 0, 0);

                refuelStation.pumps.ForEach(pump =>
                {
                    ColShape pumpCol = NAPI.ColShape.CreateSphereColShape(pump.position, 3f, 0);
                    MarkersAndLabels.setTextLabel(pump.position, "Fuel Pump \nUse ~y~Y~w~ to interact", 5f);

                    pumpCol.SetData(_refuelPumpIdenfitier, refuelStation);

                    pumpCol.OnEntityEnterColShape += (shape, player) =>
                    {
                        RefuelStation refuelStationData = shape.GetData<RefuelStation>(_refuelPumpIdenfitier);

                        if (refuelStationData != null)
                        {
                            player.SetCustomData(_refuelPumpIdenfitier, refuelStationData);
                            player.SetCustomSharedData(_refuelPumpIdenfitier, refuelStationData);
                        }
                    };

                    pumpCol.OnEntityExitColShape += (shape, player) =>
                    {
                        RefuelStation refuelStationData = shape.GetData<RefuelStation>(_refuelPumpIdenfitier);

                        if (refuelStationData != null)
                        {
                            player.ResetData(_refuelPumpIdenfitier);
                            player.ResetSharedData(_refuelPumpIdenfitier);
                        }
                    };
                });
            });
        }

        public void startVehicleRefuel(Player player)
        {
            Vehicle findClosestVehicle = VehicleSystem.getClosestVehicleToPlayer(player, 4);
            RefuelingData refuelData = player.GetData<RefuelingData>(_refuelDataIdentifier);
            RefuelStation refuelStationData = player.GetData<RefuelStation>(_refuelPumpIdenfitier);
            DbCharacter charData = player.getPlayerCharacterData();
            if (refuelData != null || refuelStationData == null || charData == null) return;

            if (findClosestVehicle == null)
            {
                uiHandling.sendPushNotifError(player, "No vehicle was found within proximity of you.", 6500);
                return;
            }

            DbVehicle closeVehicleData = findClosestVehicle.getData();

            if (closeVehicleData != null)
            {

                if (closeVehicleData.player_refuelling_char_id != -1)
                {
                    uiHandling.sendPushNotifError(player, "There is already a player refuelling this vehicle.", 6600);
                    return;
                }

                if (closeVehicleData.vehicle_locked)
                {
                    uiHandling.sendPushNotifError(player, "Ensure the vehicle is unlocked.", 6600);
                    return;
                }

                if (closeVehicleData.engine_status && closeVehicleData.vehicle_fuel > 0)
                {
                    uiHandling.sendPushNotifError(player, "Ensure the vehicle's engine is off.", 6600);
                    return;
                }

                player.TriggerEvent("refuel:closeRefuelInterval", true);

                closeVehicleData.player_refuelling_char_id = charData.character_id;
                closeVehicleData.vehicle_fuel_purchase_price = -1;

                findClosestVehicle.saveVehicleData(closeVehicleData);

                RefuelingData playerRefuelData = new RefuelingData
                {
                    refuelStationId = refuelStationData.station_id,
                    vehicleId = closeVehicleData.vehicle_id
                };

                player.SetCustomData(_refuelDataIdentifier, playerRefuelData);
                player.SetCustomSharedData(_refuelDataIdentifier, playerRefuelData);

                uiHandling.sendNotification(player, "~w~Hold down ~y~Y~w~ to continue pumping fuel", false);

                player.TriggerEvent("refuel:startRefuelInterval");
            }
        }

        [RemoteEvent("server:refuelVehicleCycle")]
        public void serverRefuelEventCycle(Player player)
        {
            RefuelingData refuelData = player.GetData<RefuelingData>(_refuelDataIdentifier);
            RefuelStation stationData = player.GetData<RefuelStation>(_refuelPumpIdenfitier);
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;

            if (refuelData != null && stationData != null)
            {
                List<Vehicle> closeVehicles = VehicleSystem.getVehicleInRange(player, 8);
                KeyValuePair<Vehicle, DbVehicle> foundVeh = new KeyValuePair<Vehicle, DbVehicle>();

                closeVehicles.ForEach(veh =>
                {
                    DbVehicle vehData = veh.getData();

                    if (vehData != null && vehData.vehicle_id == refuelData.vehicleId)
                    {
                        foundVeh = new KeyValuePair<Vehicle, DbVehicle>(veh, vehData);
                    }
                });

                if (foundVeh.Key != null && foundVeh.Value != null)
                {
                    int fuelPrice = stationData.pricePerLitre;
                    Vehicle findVeh = foundVeh.Key;
                    DbVehicle foundVehData = foundVeh.Value;

                    if(characterData.faction_duty_status > 0) fuelPrice = 0;
                    if (player.hasVip()) fuelPrice /= 2;

                    if (foundVehData.vehicle_locked || foundVehData.engine_status)
                    {
                        endPlayerRefuellingCycle(player, "Ensure the vehicle is unlocked and the engine is off.");
                        return;
                    }

                    if (characterData.money_amount - fuelPrice < 0)
                    {
                        endPlayerRefuellingCycle(player, "You don't have enough money to continue to cover this payment.");
                        return;
                    }

                    if (foundVehData.vehicle_fuel + 1.89 >= 100)
                    {
                        endPlayerRefuellingCycle(player, "~g~This vehicle's fuel tank is full!");
                        foundVehData.vehicle_fuel = 100;
                        findVeh.saveVehicleData(foundVehData, true);
                        return;
                    }

                    foundVehData.vehicle_fuel += 1.89;
                    characterData.money_amount -= fuelPrice;

                    foundVehData.vehicle_fuel_purchase_price += fuelPrice;

                    findVeh.setVehicleData(foundVehData, true);

                    player.setPlayerCharacterData(characterData, false, true);

                    uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleFuelData, new UiFuelData
                    {
                        fuel_literage = foundVehData.vehicle_fuel,
                        price = foundVehData.vehicle_fuel_purchase_price
                    });

                    uiHandling.sendNotification(player, $"{(player.hasVip() ? "[VIP]" : "")} ~w~You spent ~g~${fuelPrice}~w~ on fuel.", false);
                }
                else
                {
                    endPlayerRefuellingCycle(player);
                }
            }
            else
            {
                endPlayerRefuellingCycle(player);
            }
        }

        [RemoteEvent("server:stopRefuellingVehicle")]
        public static void endPlayerRefuellingCycle(Player player, string notif = "You have moved too far from the vehicle or fuel pump.")
        {
            removeRefuellingPlayerFromVehicle(player);
            player.ResetData(_refuelDataIdentifier);
            player.ResetSharedData(_refuelDataIdentifier);
            player.TriggerEvent("refuel:closeRefuelInterval");

            uiHandling.sendNotification(player, "~r~" + notif, false);
        }

        public static void removeRefuellingPlayerFromVehicle(Player player)
        {
            DbCharacter charData = player.getPlayerCharacterData();
            if (charData != null)
            {
                List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();

                foreach (Vehicle vehicle in onlineVehicles)
                {
                    DbVehicle vehicleData = vehicle.getData();

                    if (vehicleData.player_refuelling_char_id == charData.character_id)
                    {
                        vehicleData.player_refuelling_char_id = -1;
                        vehicle.saveVehicleData(vehicleData);
                    }
                }
            }
        }

    }
}
