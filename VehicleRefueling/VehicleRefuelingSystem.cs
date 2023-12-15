using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleRefueling
{
    public class VehicleRefuelingSystem : Script
    {
        public string _refuelPumpIdenfitier = "refuelingPumpData";
        public static List<RefuelStation> refuelingStations = new List<RefuelStation>
        {
            new RefuelStation
            {
                station_id = 0,
                name = "Mirror Park Gas",
                position = new Vector3(1181.2, -330.1, 74.5),
                pumps = new List<RefuelPump>
                {
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1183.2, -321.5, 69.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1175.8, -322.9, 69.4)
                    },
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1177.3, -330.4, 69.3)
                    },
                    new RefuelPump
                    {
                        owner_id = 0,
                        position = new Vector3(1184.8, -329.1, 69.3)
                    }
                }
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void loadAllFuelStations()
        {
            refuelingStations.ForEach(refuelStation =>
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

        [RemoteEvent("server:refuelVehicleCycle")]
        public void beginRefuelOfVehicle(Player player)
        {
            Vehicle targetVeh = VehicleSystem.getClosestVehicleToPlayer(player, 2);

            if(targetVeh == null)
            {
                uiHandling.sendPushNotifError(player, "You are not close enough to a vehicle to refuel it.", 5500);
                return;
            }

            DbVehicle vehicleData = VehicleSystem.getVehicleData(targetVeh);
            if (vehicleData == null) return;

            vehicleData.vehicle_fuel_purchase += 0.4;
            vehicleData.vehicle_fuel_purchase_price += 2;

            Console.WriteLine("Fuel purchase amount " + vehicleData.vehicle_fuel_purchase + " __ " + vehicleData.vehicle_fuel_purchase_price);
            VehicleSystem.saveVehicleData(targetVeh, vehicleData);
        }


    }
}
