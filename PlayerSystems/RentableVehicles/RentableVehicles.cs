using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.VehicleParking;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.World.TimeWeather;
using CloudRP.WorldSystems.NpcInteractions;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.RentableVehicles
{
    public class RentableVehicles : Script
    {
        public static readonly string _spawnedRentVehicleKey = "rentableVehicles:spawn";
        public static readonly int fixedRentalPrice = 500;
        public static List<RentableVehiclePoint> rentPoints = new List<RentableVehiclePoint>
        {
            new RentableVehiclePoint
            {
                rentPrice = 200,
                npcHeading = -32.8f,
                npcPed = PedHash.Abigail,
                npcSpawn = new Vector3(-1031.5, -2677.1, 13.8),
                spawnVehicles = new Vector3(-1036.6, -2671.0, 13.8)
            },
            new RentableVehiclePoint
            {
                rentPrice = 400,
                npcHeading = -89.8f,
                npcPed = PedHash.Security01SMM,
                npcSpawn = new Vector3(387.9, -654.7, 28.8),
                spawnVehicles = new Vector3(395.6, -654.3, 28.5)
            },
            new RentableVehiclePoint
            {
                rentPrice = 700,
                npcHeading = -51.3f,
                npcPed = PedHash.Security01SMM,
                npcSpawn = new Vector3(122.3, 6405.8, 31.4),
                spawnVehicles = new Vector3(138.2, 6410.8, 31.3)
            }
        };

        class MenuItems
        {
            public const string RentCar = "Rent a car";
            public const string RentBike = "Rent a motorbike";
            public const string ReturnVehicle = "Return rented vehicle";
        }
        
        class RentVehicles
        {
            public const string Car = "asbo";
            public const string Bike = "bf400";
        }

        public RentableVehicles()
        {
            NpcInteractions.onNpcInteract += handleNpcInteraction;
            Main.playerDisconnect += (player) => removeRentalVehicle(player);
            VehicleSystem.vehicleDeath += (Vehicle vehicle, DbVehicle vehicleData) =>
            {
                RentVehicleData rental = vehicle.GetData<RentVehicleData>(_spawnedRentVehicleKey);

                if (rental == null) return;

                CharacterSystem.sendMessageViaCharacterId(rental.characterOwnerId, $"{ChatUtils.rentalVehicles}Your rental vehicle has been destroyed and sent back to the insurance.");
            };

            TimeSystem.serverHourPassed += chargePlayerForRentals;

            rentPoints.ForEach(point =>
            {
                point.npcId = NpcInteractions.buildPed(PedHash.AnitaCutscene, point.npcSpawn, point.npcHeading, "Sophie - Rent a vehicle", new string[]
                {
                    MenuItems.RentCar,
                    MenuItems.RentBike,
                    MenuItems.ReturnVehicle,
                });

                NAPI.Marker.CreateMarker(36, point.spawnVehicles, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
                NAPI.Blip.CreateBlip(810, point.npcSpawn, 1f, 4, "Rental Vehicle Location", 255, 1f, true, 0, 0);
            });
        }

        #region Global Methods
        private static void chargePlayerForRentals()
        {
            Dictionary<int, Vehicle> rentalVehicles = getAllRentals();

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                DbCharacter character = p.getPlayerCharacterData();

                if (character == null) return;

                if(rentalVehicles.ContainsKey(character.character_id))
                {
                    if((character.money_amount - fixedRentalPrice) < 0)
                    {
                        p.SendChatMessage(ChatUtils.rentalVehicles + $"You can't afford to pay your rental vehicle fee. Your rental vehicle has been returned.");

                        removeRentalVehicle(p);
                        return;
                    }

                    character.money_amount -= fixedRentalPrice;
                    p.setPlayerCharacterData(character, false, true);

                    p.SendChatMessage(ChatUtils.rentalVehicles + $"You have been charged {ChatUtils.moneyGreen}${fixedRentalPrice.ToString("N0")}{ChatUtils.White} for a rental vehicle. To return a vehicle head to a rental point and return the rental.");
                }
            });
        }

        private static Dictionary<int, Vehicle> getAllRentals()
        {
            Dictionary<int, Vehicle> rentals =  new Dictionary<int, Vehicle>();

            NAPI.Pools.GetAllVehicles().ForEach(veh =>
            {
                DbVehicle vehicleData = veh.getData();
                RentVehicleData characterOwner = veh.GetData<RentVehicleData>(_spawnedRentVehicleKey);

                if(characterOwner == null) return;

                if (vehicleData == null) return;

                rentals.Add(characterOwner.characterOwnerId, veh);
            });

            return rentals;
        }

        private static void createRentalVehicle(Player player, string vehicle, Vector3 spawn)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            Vehicle rentVeh = VehicleSystem.buildVolatileVehicle(player, vehicle, spawn, 20f, "RENT" + character.character_id);

            if(rentVeh == null) return;

            rentVeh.SetData(_spawnedRentVehicleKey, new RentVehicleData {
                characterOwnerId = character.character_id,
                vehicleDisplay = rentVeh.getData()?.vehicle_display_name
            });
        }

        private static bool hasRentedVehicle(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();
            bool hasRental = false;

            if (character != null)
            {
                NAPI.Pools.GetAllVehicles().ForEach(veh =>
                {
                    if (veh.GetData<RentVehicleData>(_spawnedRentVehicleKey) != null && veh.GetData<RentVehicleData>(_spawnedRentVehicleKey).characterOwnerId == character.character_id) hasRental = true;
                });
            }

            return hasRental;
        }

        private static void removeRentalVehicle(Player player, bool sendMsg = false, bool distCheck = false)
        {
            bool found = false;
            string vehicleName = "";

            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            NAPI.Pools.GetAllVehicles().ForEach(veh =>
            {
                DbVehicle vehicle = veh.getData();

                if (vehicle == null) return;

                RentVehicleData rental = veh.GetData<RentVehicleData>(_spawnedRentVehicleKey);

                if (rental != null && rental.characterOwnerId == character.character_id)
                {
                    if (distCheck && Vector3.Distance(player.Position, veh.Position) > 10) return;

                    found = true;
                    vehicleName = vehicle.vehicle_display_name;
                    veh.Delete();
                }
            });

            if(!found && sendMsg)
            {
                CharacterSystem.sendMessageViaCharacterId(character.character_id, $"{ChatUtils.error}Your rental vehicle wasn't found.");
            }

            if (found && sendMsg) CharacterSystem.sendMessageViaCharacterId(character.character_id, $"{ChatUtils.rentalVehicles}Your rental vehicle {vehicleName} has been returned.");
        }

        private static void handleNpcInteraction(Player player, int npcId, string raycastOption)
        {
            RentableVehiclePoint point = rentPoints.Where(p => p.npcId == npcId)
                .FirstOrDefault();

            if (point == null) return;

            if (raycastOption != MenuItems.ReturnVehicle && hasRentedVehicle(player))
            {
                uiHandling.sendPushNotifError(player, $"You already have a rental vehicle. Return it before getting another one.", 6600);
                return;
            }

            Vector3 spawnAt = point.spawnVehicles;

            switch(raycastOption)
            {
                case MenuItems.RentCar:
                    {
                        createRentalVehicle(player, RentVehicles.Car, spawnAt);
                        break;
                    }
                case MenuItems.RentBike:
                    {
                        createRentalVehicle(player, RentVehicles.Bike, spawnAt);
                        break;
                    };
                case MenuItems.ReturnVehicle:
                    {
                        removeRentalVehicle(player, true);
                        break;
                    }
            }

            if (raycastOption == MenuItems.ReturnVehicle) return;

            player.SendChatMessage(ChatUtils.rentalVehicles + $"You have rented out a vehicle for the price of {ChatUtils.moneyGreen}${point.rentPrice.ToString("N0")}{ChatUtils.White}. Your rental vehicle {ChatUtils.orange}has been marked on the map{ChatUtils.White}. You will be charged {ChatUtils.moneyGreen}${fixedRentalPrice.ToString("N0")}{ChatUtils.White} every hour (( 20 minutes )) for the rental vehicle.");

            MarkersAndLabels.addBlipForClient(player, 523, "Rental Vehicle", spawnAt, 4, 255, 10, false, true);
        }
        #endregion
    }
}
