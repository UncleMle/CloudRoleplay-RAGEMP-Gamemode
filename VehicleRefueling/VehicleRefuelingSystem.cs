using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Vehicles;
using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;

namespace CloudRP.VehicleRefueling
{
    public class VehicleRefuelingSystem : Script
    {
        public static string _refuelPumpIdenfitier = "refuelingPumpData";
        public static string _refuelDataIdentifier = "playerRefuelData";

        [ServerEvent(Event.ResourceStart)]
        public void loadAllFuelStations()
        {
            VehicleRefuelStations.refuelingStations.ForEach(refuelStation =>
            {
                NAPI.Blip.CreateBlip(361, refuelStation.position, 1.0f, 75, refuelStation.name, 255, 20f, true, 0, 0);
                
                refuelStation.pumps.ForEach(pump =>
                {
                    ColShape pumpCol = NAPI.ColShape.CreateSphereColShape(pump.position, 3f, 0);
                    MarkersAndLabels.setTextLabel(pump.position, "Fuel Pump \nUse ~y~Y~w~ to interact", 5f);

                    pumpCol.SetData(_refuelPumpIdenfitier, refuelStation);
                });
            });
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setPumpData(ColShape colshape, Player player)
        {
            RefuelStation refuelStationData = colshape.GetData<RefuelStation>(_refuelPumpIdenfitier);

            if(refuelStationData != null)
            {
                player.SetData(_refuelPumpIdenfitier, refuelStationData);
                player.SetSharedData(_refuelPumpIdenfitier, refuelStationData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void removePumpData(ColShape colshape, Player player)
        {
            RefuelStation refuelStationData = colshape.GetData<RefuelStation>(_refuelPumpIdenfitier);

            if(refuelStationData != null)
            {
                player.ResetData(_refuelPumpIdenfitier);
                player.ResetSharedData(_refuelPumpIdenfitier);
            }
        }

        [ServerEvent(Event.PlayerDisconnected)]
        public void removeRefuellingPlayer(Player player)
        {
            removeRefuellingPlayerFromVehicle(player);
        }

        [RemoteEvent("server:startRefuelEvent")]
        public void startVehicleRefuel(Player player)
        {
            Vehicle findClosestVehicle = VehicleSystem.getClosestVehicleToPlayer(player, 4);
            RefuelingData refuelData = player.GetData<RefuelingData>(_refuelDataIdentifier);
            RefuelStation refuelStationData = player.GetData<RefuelStation>(_refuelPumpIdenfitier);
            if (refuelData != null || refuelStationData == null) return;
            
            if(findClosestVehicle == null)
            {
                uiHandling.sendPushNotifError(player, "No vehicle was found within proximity of you.", 6500);
                return;
            }
            
            DbVehicle closeVehicleData = VehicleSystem.getVehicleData(findClosestVehicle);
            
            if(closeVehicleData != null)
            {

                if(closeVehicleData.player_refuelling != null)
                {
                    uiHandling.sendPushNotifError(player, "There is already a player refuelling this vehicle.", 6600);
                    return;
                }

                if(closeVehicleData.vehicle_locked)
                {
                    uiHandling.sendPushNotifError(player, "Ensure the vehicle is unlocked.", 6600);
                    return;
                }

                if(closeVehicleData.engine_status)
                {
                    uiHandling.sendPushNotifError(player, "Ensure the vehicle's engine is off.", 6600);
                    return;
                }

                closeVehicleData.player_refuelling = player;
                closeVehicleData.vehicle_fuel_purchase_price = -1;
                VehicleSystem.saveVehicleData(findClosestVehicle, closeVehicleData);

                RefuelingData playerRefuelData = new RefuelingData
                {
                    refuelStationId = refuelStationData.station_id,
                    vehicleId = closeVehicleData.vehicle_id
                };

                player.SetData(_refuelDataIdentifier, playerRefuelData);
                player.SetSharedData(_refuelDataIdentifier, playerRefuelData);

                uiHandling.sendNotification(player, "~w~Hold down ~y~Y~w~ to continue pumping fuel", false);

                player.TriggerEvent("refuel:startRefuelInterval");
            }
        }

        [RemoteEvent("server:refuelVehicleCycle")]
        public void serverRefuelEventCycle(Player player)
        {
            RefuelingData refuelData = player.GetData<RefuelingData>(_refuelDataIdentifier);
            RefuelStation stationData = player.GetData<RefuelStation>(_refuelPumpIdenfitier);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            if (characterData == null) return;

            if (refuelData != null && stationData != null)
            {
                List<Vehicle> closeVehicles = VehicleSystem.getVehicleInRange(player, 8);
                KeyValuePair<Vehicle, DbVehicle> foundVeh = new KeyValuePair<Vehicle, DbVehicle>();

                closeVehicles.ForEach(veh =>
                {
                    DbVehicle vehData = VehicleSystem.getVehicleData(veh);

                    if (vehData != null && vehData.vehicle_id == refuelData.vehicleId)
                    {
                        foundVeh = new KeyValuePair<Vehicle, DbVehicle>(veh, vehData);
                    }
                });

                if(foundVeh.Key != null && foundVeh.Value != null)
                {
                    int fuelPrice = stationData.pricePerLitre;
                    Vehicle findVeh = foundVeh.Key;
                    DbVehicle foundVehData = foundVeh.Value;

                    if(foundVehData.vehicle_locked || foundVehData.engine_status)
                    {
                        endPlayerRefuellingCycle(player, "Ensure the vehicle is unlocked and the engine is off.");
                        return;
                    }

                    if ((characterData.money_amount - fuelPrice) < 0)
                    {
                        endPlayerRefuellingCycle(player, "You don't have enough money to continue to cover this payment.");
                        return;
                    }

                    if((foundVehData.vehicle_fuel + 1.89) >= 100)
                    {
                        endPlayerRefuellingCycle(player, "~g~This vehicle's fuel tank is full!");
                        foundVehData.vehicle_fuel = 100;
                        VehicleSystem.saveVehicleData(findVeh, foundVehData, true);
                        return;
                    }
                    
                    foundVehData.vehicle_fuel += 1.89;
                    characterData.money_amount -= fuelPrice;

                    foundVehData.vehicle_fuel_purchase_price += fuelPrice;

                    VehicleSystem.saveVehicleData(findVeh, foundVehData, true);
                    PlayersData.setPlayerCharacterData(player, characterData, false, true);

                    uiHandling.handleObjectUiMutation(player, MutationKeys.VehicleFuelData, new UiFuelData
                    {
                        fuel_literage = foundVehData.vehicle_fuel,
                        price = foundVehData.vehicle_fuel_purchase_price
                    });

                    uiHandling.sendNotification(player, $"~w~You spent ~g~${fuelPrice}~w~ on fuel.", false);
                } else
                {
                    endPlayerRefuellingCycle(player);
                }

            } else
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

            uiHandling.sendNotification(player, "~r~"+notif, false);
        }

        public static void removeRefuellingPlayerFromVehicle(Player player)
        {
            List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();

            foreach (Vehicle vehicle in onlineVehicles)
            {
                DbVehicle vehicleData = VehicleSystem.getVehicleData(vehicle);

                if(vehicleData.player_refuelling.Equals(player))
                {
                    vehicleData.player_refuelling = null;
                    VehicleSystem.saveVehicleData(vehicle, vehicleData);
                }
            }
        }

    }
}
