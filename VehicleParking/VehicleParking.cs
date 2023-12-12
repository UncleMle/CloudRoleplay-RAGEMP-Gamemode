using CloudRP.Character;
using CloudRP.ClothingStores;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;

namespace CloudRP.VehicleParking
{
    public class VehicleParking : Script
    {
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
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void populateParkingAreas()
        {
            for(int i = 0; i < parkingLots.Count; i++)
            {
                ParkingLot pLot = parkingLots[i];

                ColShape parkCol = NAPI.ColShape.CreateSphereColShape(pLot.park.position, pLot.parkPosRange, 0);
                ColShape retrieveCol = NAPI.ColShape.CreateSphereColShape(pLot.retrieve.position, pLot.retrievePosRange, 0);

                parkCol.SetData(_parkingLotIdentifier, pLot.park);
                retrieveCol.SetData(_retrievalIdentifier, pLot.retrieve);

                NAPI.TextLabel.CreateTextLabel($"{pLot.name} ~y~Y~w~ to interact", pLot.retrieve.position, 10f, 1.0f, 4, new Color(255, 255, 255, 255), true);
                NAPI.Blip.CreateBlip(831, pLot.park.position, 1.0f, 63, pLot.name, 255, 1.0f, true, 0, 0);
                NAPI.Marker.CreateMarker(27, new Vector3(pLot.retrieve.position.X, pLot.retrieve.position.X, pLot.retrieve.position.Z), new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setParkingData(ColShape colshape, Player player)
        {
            ParkCol parkCol = colshape.GetData<ParkCol>(_parkingLotIdentifier);
            RetrieveCol retrievalCol = colshape.GetData<RetrieveCol>(_retrievalIdentifier);


            if (retrievalCol != null)
            {
                uiHandling.sendPushNotif(player, "Use Y to interact with the parking lot.", 6600);
                player.SetData(_retrievalIdentifier, retrievalCol);
                player.SetSharedData(_retrievalIdentifier, retrievalCol);
                return;
            }
            
            if (parkCol != null)
            { 
                if(player.IsInVehicle)
                {
                    uiHandling.sendPushNotif(player, "Use /park to park this vehicle.", 6600);
                }

                player.SetData(_parkingLotIdentifier, parkCol);
                player.SetSharedData(_parkingLotIdentifier, parkCol);
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

        [Command("park", "~y~Use: ~w~/park")]
        public void parkVehicle(Player player)
        {
            DbCharacter charData = PlayersData.getPlayerCharacterData(player);
            ParkCol parkCol = player.GetData<ParkCol>(_parkingLotIdentifier);

            if(parkCol != null && charData != null)
            {
                if(!player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                    return;
                }
                Vehicle pVeh = player.Vehicle;
                DbVehicle pVehData = VehicleSystem.getVehicleData(pVeh);

                if(pVehData.owner_id != charData.character_id)
                {
                    CommandUtils.errorSay(player, "You must be the owner of the vehicle to park it.");
                    return;
                }

                if(pVehData != null)
                {
                    using(DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        pVehData.vehicle_dimension = VehicleDimensions.Garage;
                        pVehData.vehicle_garage_id = parkCol.owner_id;

                        dbContext.Update(pVehData);
                        dbContext.SaveChanges();

                        CommandUtils.successSay(player, $"You parked your vehicle [{pVehData.numberplate}]");
                        pVeh.Delete();
                    }   
                        
                }
            } else
            {
                CommandUtils.errorSay(player, "You must be within a parking lot to use this command.");
            }
        }

        [RemoteEvent("server:viewParkedVehicles")]
        public void viewParkedVehicles(Player player)
        {
            DbCharacter charData = PlayersData.getPlayerCharacterData(player);
            RetrieveCol retrievalCol = player.GetData<RetrieveCol>(_retrievalIdentifier);

            if(retrievalCol != null && Vector3.Distance(player.Position, retrievalCol.position) < 10)
            {
                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    List<DbVehicle> vehicles = dbContext.vehicles
                        .Where(veh => veh.owner_id == charData.character_id && veh.vehicle_dimension == VehicleDimensions.Garage && veh.vehicle_garage_id == retrievalCol.owner_id)
                        .ToList();

                    if(vehicles.Count > 0)
                    {
                        uiHandling.resetMutationPusher(player, MutationKeys.ParkedVehicles);

                        foreach (DbVehicle findVeh in vehicles)
                        {
                            uiHandling.handleObjectUiMutationPush(player, MutationKeys.ParkedVehicles, findVeh);
                            uiHandling.pushRouterToClient(player, Browsers.Parking);
                        }

                    } else
                    {
                        uiHandling.sendPushNotifError(player, "You don't have any vehicle's in this parking!", 5500);
                        return;
                    }
                }
            }
        }

        [RemoteEvent("server:unparkVehicle")]
        public void unparkVehicle(Player player, int vehicleId)
        {
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            RetrieveCol retrievalCol = player.GetData<RetrieveCol>(_retrievalIdentifier);
            if (retrievalCol == null) return;
            
            ParkingLot parkingLot = parkingLots.Where(pl => pl.parkingId == retrievalCol.owner_id).FirstOrDefault();

            if (characterData != null && parkingLot != null && Vector3.Distance(player.Position, retrievalCol.position) < 10)
            {

                if(checkParkingLot(parkingLot.parkingId))
                {
                    uiHandling.sendPushNotifError(player, "There is a vehicle blocking the spawn point!", 5500);
                    return;
                }

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    DbVehicle findVeh = dbContext.vehicles
                        .Where(veh => veh.vehicle_id == vehicleId && veh.vehicle_dimension == VehicleDimensions.Garage && veh.vehicle_garage_id == parkingLot.parkingId && veh.owner_id == characterData.character_id)
                        .FirstOrDefault();

                    if(findVeh == null)
                    {
                        uiHandling.sendPushNotifError(player, "This vehicle couldn't be found.", 7600);
                        return;
                    }

                    VehicleSystem.spawnVehicle(findVeh, parkingLot.spawnVehiclesAt);
                    CommandUtils.successSay(player, $"You unparked your vehicle [{findVeh.numberplate}]");
                    uiHandling.pushRouterToClient(player, Browsers.None);
                }
            }
        }

        public static bool checkParkingLot(int parkingId)
        {
            ParkingLot pLot = parkingLots.Where(pl => pl.parkingId == parkingId).FirstOrDefault();
            bool isInParking = false;

            if(pLot != null)
            {
                List<Vehicle> onlineVehs = NAPI.Pools.GetAllVehicles();

                foreach(Vehicle vehicle in onlineVehs)
                {
                    if ((vehicle.Position.X >= pLot.spawnVehiclesAt.X - 2 && vehicle.Position.X <= pLot.spawnVehiclesAt.X + 2) && (vehicle.Position.Y >= pLot.spawnVehiclesAt.Y - 4 && vehicle.Position.Y <= vehicle.Position.Y + 4))
                    {
                        isInParking = true;
                    }
                }
            }

            return isInParking;
        }

    }
}
