using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.FactionSystems;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using static CloudRP.PlayerSystems.FactionSystems.FactionSystem;

namespace CloudRP.VehicleSystems.VehicleParking
{
    public class VehicleParking : Script
    {
        public delegate void VehicleParkingEventsHandler(Player player, int vehicleId);

        public static event VehicleParkingEventsHandler onVehicleUnpark;

        public static string _parkingLotIdentifier = "parkingLotData";
        public static string _retrievalIdentifier = "retreivalParkingData";
        public static List<ParkingLot> parkingLots = new List<ParkingLot>
        {
            new ParkingLot
            {
                name = "Mirror Park Parking",
                parkingId = 1,
                spawnVehiclesAt = new Vector3(222.3, -801.8, 30.7),
                park = new ParkCol
                {
                    name = "Mirror Park",
                    owner_id = 1,
                    position = new Vector3(208.8, -808.4, 30.9)
                },
                retrieve = new RetrieveCol
                {
                    name = "Mirror Park",
                    owner_id = 1,
                    position = new Vector3(213.9, -808.5, 31.0)
                },
                parkPosRange = 2.5f,
                retrievePosRange = 1f
            },
            new ParkingLot
            {
                name = "Davis Parking",
                parkingId = 2,
                spawnVehiclesAt = new Vector3(-78.5, -2010.7, 18.0),
                park = new ParkCol
                {
                    name = "Davis",
                    owner_id = 2,
                    position = new Vector3(-81.1, -1998.6, 18.0)
                },
                retrieve = new RetrieveCol
                {
                    name = "Davis",
                    owner_id = 2,
                    position = new Vector3(-73.4, -2004.6, 18.3)
                },
                parkPosRange = 2.5f,
                retrievePosRange = 1f
            },
            new ParkingLot
            {
                name = "Del Perro Parking",
                parkingId = 3,
                spawnVehiclesAt = new Vector3(-1633.7, -945.4, 8.2),
                park = new ParkCol
                {
                    name = "Del Perro",
                    owner_id = 3,
                    position = new Vector3(-1644.6, -948.3, 8.0)
                },
                retrieve = new RetrieveCol
                {
                    name = "Del Perro",
                    owner_id = 3,
                    position = new Vector3(-1653.4, -948.6, 7.7)
                },
                parkPosRange = 2.5f,
                retrievePosRange = 1f
            },
            new ParkingLot
            {
                name = "Paleto Parking",
                parkingId = 4,
                spawnVehiclesAt = new Vector3(80.7, 6367.5, 31.2),
                park = new ParkCol
                {
                    name = "Paleto",
                    owner_id = 4,
                    position = new Vector3(74.3, 6388.5, 31.2)
                },
                retrieve = new RetrieveCol
                {
                    name = "Paleto",
                    owner_id = 4,
                    position = new Vector3(81.5, 6390.4, 31.4)
                },
                parkPosRange = 2.5f,
                retrievePosRange = 1f
            },
            new ParkingLot
            {
                name = "Sandy Parking",
                parkingId = 5,
                spawnVehiclesAt = new Vector3(1522.7, 3758.3, 34.1),
                park = new ParkCol
                {
                    owner_id = 5,
                    name = "Sandy",
                    position = new Vector3(1515.3, 3757.0, 34.0)
                },
                retrieve = new RetrieveCol
                {
                    name = "Sandy",
                    owner_id = 5,
                    position = new Vector3(1526.4, 3770.6, 34.5)
                },
                parkPosRange = 2.5f,
                retrievePosRange = 1f
            },
            new ParkingLot
            {
                name = "Pillbox Parking",
                parkingId = 6,
                spawnVehiclesAt = new Vector3(-284.5, -901.8, 31.1),
                park = new ParkCol
                {
                    owner_id = 6,
                    name = "Pillbox",
                    position = new Vector3(-274.9, -891.9, 31.3)
                },
                retrieve = new RetrieveCol
                {
                    name = "Pillbox",
                    owner_id = 6,
                    position = new Vector3(-281.4, -888.8, 31.3)
                },
                parkPosRange = 2.5f,
                retrievePosRange = 1f
            },
            new ParkingLot
            {
                name = "Grapeseed Aircraft Hangar",
                parkingId = 7,
                spawnVehiclesAt = new Vector3(2125.3, 4804.1, 41.1),
                park = new ParkCol
                {
                    owner_id = 7,
                    name = "Grapeseed",
                    position = new Vector3(2133.0, 4783.5, 41.0)
                },
                retrieve = new RetrieveCol
                {
                    name = "Grapeseed",
                    owner_id = 7,
                    position = new Vector3(2133.0, 4783.5, 41.0)
                },
                parkPosRange = 8f,
                retrievePosRange = 1f,
                forAircraft = true
            },
            new ParkingLot
            {
                name = "Senora Aircraft Hangar",
                parkingId = 8,
                spawnVehiclesAt = new Vector3(1743.7, 3266.8, 41.2),
                retrieve = new RetrieveCol {
                    name = "Senora",
                    owner_id = 8,
                    position = new Vector3(1732.2, 3308.6, 41.2)
                },
                park = new ParkCol
                {
                    owner_id = 8,
                    name = "Senora",
                    position = new Vector3(1733.2, 3304.0, 41.2)
                },
                retrievePosRange = 1f,
                parkPosRange = 8f,
                forAircraft = true
            },
            new ParkingLot
            {
                name = "LSIA Aircraft Hangar",
                parkingId = 9,
                retrieve = new RetrieveCol
                {
                    name = "LSIA",
                    owner_id = 9,
                    position = new Vector3(-1277.4, -3390.1, 13.9)
                },
                park = new ParkCol
                {
                    name = "LSIA",
                    owner_id = 9,
                    position = new Vector3(-1281.7, -3398.2, 13.9)
                },
                spawnVehiclesAt = new Vector3(-1244.6, -3331.8, 13.9),
                parkPosRange = 8f,
                retrievePosRange = 1f,
                forAircraft = true
            },
            new ParkingLot
            {
                name = "Subway Parking",
                parkingId = 10,
                retrieve = new RetrieveCol
                {
                    name = "Subway",
                    owner_id = 10,
                    position = new Vector3(-924.7, -163.9, 41.9)
                },
                park = new ParkCol
                {
                    name = "Subway",
                    owner_id = 10,
                    position = new Vector3(-924.7, -163.9, 41.9)
                },
                parkPosRange = 2f,
                retrievePosRange = 1f,
                spawnVehiclesAt = new Vector3(-937.5, -166.7, 41.9)

            }
        };

        public VehicleParking()
        {
            NAPI.Task.Run(() =>
            {
                for (int i = 0; i < parkingLots.Count; i++)
                {
                    ParkingLot pLot = parkingLots[i];
                    ColShape parkCol = NAPI.ColShape.CreateSphereColShape(pLot.park.position, pLot.parkPosRange, 0);
                    ColShape retrieveCol = NAPI.ColShape.CreateSphereColShape(pLot.retrieve.position, pLot.retrievePosRange, 0);

                    parkCol.SetData(_parkingLotIdentifier, pLot.park);
                    
                    retrieveCol.SetData(_retrievalIdentifier, pLot.retrieve);
                    retrieveCol.SetSharedData(_retrievalIdentifier, pLot.retrieve);
                    RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
                    {
                        menuTitle = "Vehicle Parking",
                        raycastMenuItems = new List<string> { "View parked vehicles" },
                        raycastMenuPosition = pLot.retrieve.position,
                        targetMethod = viewParkedVehicles
                    });

                    NAPI.Blip.CreateBlip(831, pLot.park.position, 1.0f, (byte)(pLot.forAircraft ? 11 : 39), pLot.name, 255, 1.0f, true, 0, 0);
                    NAPI.Marker.CreateMarker(36, new Vector3(pLot.park.position.X, pLot.park.position.Y, pLot.park.position.Z), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
                }
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {parkingLots.Count} parking lots were loaded.");
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setParkingData(ColShape colshape, Player player)
        {
            ParkCol parkCol = colshape.GetData<ParkCol>(_parkingLotIdentifier);
            RetrieveCol retrievalCol = colshape.GetData<RetrieveCol>(_retrievalIdentifier);

            if (retrievalCol != null)
            {
                player.SetCustomData(_retrievalIdentifier, retrievalCol);
                player.SetCustomSharedData(_retrievalIdentifier, retrievalCol);
                return;
            }

            if (parkCol != null)
            {
                if (player.IsInVehicle)
                {
                    uiHandling.sendPushNotif(player, "Use /park to park this vehicle.", 6600);
                }

                player.SetCustomData(_parkingLotIdentifier, parkCol);
                player.SetCustomSharedData(_parkingLotIdentifier, parkCol);
                return;
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void removeParkingData(ColShape colshape, Player player)
        {
            ParkCol parkCol = colshape.GetData<ParkCol>(_parkingLotIdentifier);
            RetrieveCol retrievalCol = colshape.GetData<RetrieveCol>(_retrievalIdentifier);

            if (retrievalCol != null || parkCol != null)
            {
                player.ResetData(_parkingLotIdentifier);
                player.ResetData(_retrievalIdentifier);
                player.ResetSharedData(_parkingLotIdentifier);
                player.ResetSharedData(_retrievalIdentifier);
            }
        }

        #region Commands
        [Command("park", "~y~Use: ~w~/park")]
        public void parkVehicle(Player player)
        {
            DbCharacter charData = player.getPlayerCharacterData();
            ParkCol parkCol = player.GetData<ParkCol>(_parkingLotIdentifier);

            if (parkCol != null && charData != null)
            {
                ParkingLot targetLot = parkingLots.Where(lot => lot.parkingId == parkCol.owner_id)
                    .FirstOrDefault();

                if (targetLot == null) return; 

                if (!player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                    return;
                }
                Vehicle pVeh = player.Vehicle;
                DbVehicle pVehData = pVeh.getData();

                if (pVehData == null) return;

                if (pVehData.owner_id != charData.character_id)
                {
                    CommandUtils.errorSay(player, "You must be the owner of the vehicle to park it.");
                    return;
                }

                if(targetLot.forAircraft && !VehicleSystem.aircraftClasses.Contains((VehicleClasses)pVehData.vehicle_class_id))
                {
                    CommandUtils.errorSay(player, "Only aircraft can be parked here.");
                    return;
                }

                 player.Vehicle.parkVehicle(player, parkCol.owner_id);
            }
            else
            {
                CommandUtils.errorSay(player, "You must be within a parking lot to use this command.");
            }
        }

        public void viewParkedVehicles(Player player, string rayOption)
        {
            DbCharacter charData = player.getPlayerCharacterData();
            RetrieveCol retrievalCol = player.GetData<RetrieveCol>(_retrievalIdentifier);

            if (retrievalCol != null && Vector3.Distance(player.Position, retrievalCol.position) < 2)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    List<DbVehicle> vehicles = dbContext.vehicles
                        .Where(veh => veh.owner_id == charData.character_id && veh.vehicle_dimension == VehicleDimensions.Garage && veh.vehicle_parking_lot_id == retrievalCol.owner_id)
                        .ToList();

                    if (vehicles.Count > 0)
                    {
                        uiHandling.resetMutationPusher(player, MutationKeys.ParkedVehicles);

                        foreach (DbVehicle findVeh in vehicles)
                        {
                            uiHandling.handleObjectUiMutationPush(player, MutationKeys.ParkedVehicles, findVeh);
                            uiHandling.pushRouterToClient(player, Browsers.Parking, true);
                        }

                    }
                    else
                    {
                        uiHandling.sendPushNotifError(player, "You don't have any vehicle's in this parking!", 5500);
                        return;
                    }
                }
            }
        }

        [RemoteEvent("server:unparkVehicle")]
        public void unparkVehicle(Player player, int vehicleId) => onVehicleUnpark(player, vehicleId);
        #endregion
    }
}
