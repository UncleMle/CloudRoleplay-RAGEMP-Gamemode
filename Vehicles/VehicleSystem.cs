using CloudRP.Admin;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Timers;

namespace CloudRP.Vehicles
{
    internal class VehicleSystem : Script
    {
        public static List<DbVehicle> vehicles;
        public static string _vehicleSharedDataIdentifier = "VehicleData";
        private static int _timerInterval = 5000;
        private static Timer saveVehicleTimer;
        public static readonly string[] bones = {"door_dside_f", "door_pside_f", "door_dside_r", "door_pside_r", "bonnet", "boot"};
        public static readonly string[] names = { "door", "door", "door", "door", "hood", "trunk", "trunk" };
	

        [ServerEvent(Event.ResourceStart)]
        public void spawnAllVehicles()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                vehicles = dbContext.vehicles.ToList();
            }

            Console.WriteLine($"A total of {vehicles.Count} vehicles where loaded in.");

            if (vehicles.Count > 0)
            {

                foreach (var item in vehicles)
                {
                    if(item.vehicle_dimension == VehicleDimensions.World)
                    {
                        spawnVehicle(item);
                    }
                }
            };

            beginSaveInterval();
        }

        void beginSaveInterval()
        {
            NAPI.Task.Run(() =>
            {
                saveVehicleTimer = new Timer();
                saveVehicleTimer.Interval = _timerInterval;
                saveVehicleTimer.Elapsed += saveVehiclePositions;

                saveVehicleTimer.AutoReset = true;
                saveVehicleTimer.Enabled = true;
            });
        }
        
        public static Vehicle spawnVehicle(DbVehicle vehicle)
        {
            Vector3 spawnPosition = new Vector3(vehicle.position_x, vehicle.position_y, vehicle.position_z);
            float rotation = vehicle.rotation;

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicle.vehicle_spawn_hash, spawnPosition, rotation, 255, 255, vehicle.numberplate, 255, false, true, 0);

            vehicle.vehicle_dimension = VehicleDimensions.World;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.vehicles.Update(vehicle);
                dbContext.SaveChanges();
            }

            vehicle.vehicle_doors = new bool[] { false, false, false, false, false, false };

            veh.Locked = true;
            veh.SetSharedData(_vehicleSharedDataIdentifier, vehicle);
            veh.SetData(_vehicleSharedDataIdentifier, vehicle);

            return veh;
        }

        public static void saveVehiclePositions(object source, ElapsedEventArgs e)
        {
            List<Vehicle> allVehicles = NAPI.Pools.GetAllVehicles();

            foreach (var vehicle in allVehicles)
            {
                try
                {
                    saveVehicleData(vehicle);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }
            }
        }

        public static void saveVehicleData(Vehicle vehicle)
        {
            DbVehicle vehicleData = vehicle.GetData<DbVehicle>(_vehicleSharedDataIdentifier);
            if (vehicleData == null) return;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle findVehicle = dbContext.vehicles.Find(vehicleData.vehicle_id);

                if (findVehicle == null) return;

                findVehicle.position_x = vehicle.Position.X;
                findVehicle.position_y = vehicle.Position.Y;
                findVehicle.position_z = vehicle.Position.Z;
                findVehicle.vehicle_locked = vehicleData.vehicle_locked;

                findVehicle.rotation = vehicle.Rotation.Z;

                dbContext.SaveChanges();
            }

        }

        public static void saveVehicleData(Vehicle vehicle, DbVehicle vehicleData)
        {
            vehicle.SetData(_vehicleSharedDataIdentifier, vehicleData);
            vehicle.SetSharedData(_vehicleSharedDataIdentifier, vehicleData);
        }

        public static void bringVehicleToPlayer(Player player, Vehicle vehicle, bool putInVehicle)
        {
            vehicle.Position = player.Position;
            
            if(putInVehicle)
            {
                player.SetIntoVehicle(vehicle, 0);
            }

            saveVehicleData(vehicle);
        }

        public static Vehicle buildVehicle(string vehName, Vector3 position, float rotation, int ownerId)
        {
            string vehiclePlate = "notset";
            uint vehicleHash = NAPI.Util.GetHashKey(vehName);
            DbVehicle vehicleData = null;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle vehicleInsert = new DbVehicle
                {
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now,
                    owner_id = ownerId,
                    position_x = position.X,
                    position_y = position.Y,
                    position_z = position.Z,
                    rotation = rotation,
                    vehicle_spawn_hash = vehicleHash,
                    vehicle_name = vehName,
                    numberplate = "null",
                    vehicle_dimension = VehicleDimensions.World
                };

                dbContext.vehicles.Add(vehicleInsert);
                dbContext.SaveChanges();

                DbVehicle findJustInserted = dbContext.vehicles.Find(vehicleInsert.vehicle_id);

                vehiclePlate = $"U_{vehicleInsert.vehicle_id}";
                findJustInserted.numberplate = vehiclePlate;

                vehicleData = dbContext.vehicles.Find(vehicleInsert.vehicle_id);

                dbContext.vehicles.Update(vehicleInsert);
                dbContext.SaveChanges();
            }

            if (vehicleData == null) return null;

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicleHash, position, rotation, 255, 255, vehiclePlate, 255, false, true, 0);
            
            vehicleData.vehicle_doors = new bool[] { false, false, false, false, false, false };

            veh.SetData(_vehicleSharedDataIdentifier, vehicleData);
            veh.SetSharedData(_vehicleSharedDataIdentifier, vehicleData);

            return veh;
        }

        public static Vehicle findVehicleById(int vehicleId)
        {
            List<Vehicle> allVehicles = NAPI.Pools.GetAllVehicles();
            Vehicle foundVehicle = null;

            foreach (var vehicle in allVehicles)
            {
                DbVehicle vehicleData = vehicle.GetData<DbVehicle>(_vehicleSharedDataIdentifier);

                if(vehicleData.vehicle_id == vehicleId)
                {
                    foundVehicle = vehicle;
                }
            }

            return foundVehicle;
        }

        public static DbVehicle getVehicleData(Vehicle vehicle)
        {
            DbVehicle getData = vehicle.GetData<DbVehicle>(_vehicleSharedDataIdentifier);

            return getData;
        }

        public static DbVehicle getVehicleDataById(int vehicleId)
        {
            Vehicle vehicle = findVehicleById(vehicleId);
            DbVehicle findData = getVehicleData(vehicle);

            return findData;
        }

        public static bool deleteVehicleById(int vehicleId)
        {
            bool returnRes = false;

            try
            {
                Vehicle vehicle = findVehicleById(vehicleId);
                DbVehicle vehicleData = getVehicleDataById(vehicleId);

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.vehicles.Remove(vehicleData);
                    dbContext.SaveChanges();
                }

                vehicle.SetData<DbVehicle>(_vehicleSharedDataIdentifier, null);
                vehicle.Delete();
                returnRes = true;
            } catch
            {
                returnRes = false;  
            }
            
            return returnRes;
        }

        public static DbCharacter getOwnerOfVehicleById(int vehicleOwnerId)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();
            DbCharacter foundPlayer = null;

            foreach(Player player in onlinePlayers)
            {
                DbCharacter charData = PlayersData.getPlayerCharacterData(player);

                if(charData != null)
                {
                    if(charData.character_id == vehicleOwnerId)
                    {
                        foundPlayer = charData;
                    }
                }
            }

            return foundPlayer;
        }

        public static void sayInfoAboutVehicle(Player player, User userdata, DbVehicle vehicle)
        {
            AdminUtils.staffSay(player, Chat.yellow + "-----------------------------------------------------------");
            AdminUtils.staffSay(player, "Vehicle id: " + Chat.red + vehicle.vehicle_id + Chat.White + " VehName: " + Chat.red + vehicle.vehicle_name);
            AdminUtils.staffSay(player, "Owner id: " + Chat.red + vehicle.owner_id + Chat.White + " Numberplate: " + Chat.red + vehicle.numberplate);

            DbCharacter vehicleOwnerData = getOwnerOfVehicleById(vehicle.owner_id);
            if (userdata.adminDuty && vehicleOwnerData != null)
            {
                AdminUtils.staffSay(player, "Owner: " + Chat.red + vehicleOwnerData.character_name+ Chat.White + " Owner Last Login: " + Chat.red + vehicleOwnerData.last_login);
            }

            AdminUtils.staffSay(player, Chat.yellow + "-----------------------------------------------------------");
        }

        [ServerEvent(Event.VehicleDeath)]
        public void onVehicleDeath(Vehicle vehicle)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);

            if (vehicleData == null) return;

            vehicleData.vehicle_dimension = VehicleDimensions.Insurance;
            vehicleData.position_x = VehicleDimensions.morsPosition.X;
            vehicleData.position_y = VehicleDimensions.morsPosition.Y;
            vehicleData.position_z = VehicleDimensions.morsPosition.Z;
            vehicleData.vehicle_insurance_id = VehicleDimensions._morsId;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.vehicles.Update(vehicleData);
                dbContext.SaveChanges();
            }

            vehicle.Delete();
            Console.WriteLine($"Vehicle #{vehicleData.vehicle_id} was saved to insurance. ");
        }

        public static List<Vehicle> getVehicleInRange(Player player, float range)
        {
            List<Vehicle> vehicles = NAPI.Pools.GetAllVehicles();
            List<Vehicle> rangeVehicles = new List<Vehicle>();

            foreach(Vehicle vehicle in vehicles)
            {
                if(Vector3.Distance(player.Position, vehicle.Position) < range)
                {
                    rangeVehicles.Add(vehicle);
                }
            }

            return rangeVehicles;
        }

        public static string getFixedVehicleDistance(Player player, Vehicle vehicle)
        {
            float dist = Vector3.Distance(player.Position, vehicle.Position);

            return toFixed((int)dist, 0);
        }

        public static string toFixed(int number, uint decimals)
        {
            return number.ToString("N" + decimals);
        }

        public static Vehicle getVehicleByPlate(string vehiclePlate)
        {
            Vehicle returnVeh = null;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle findVehicle = dbContext.vehicles.Where(veh => veh.numberplate == vehiclePlate).FirstOrDefault();

                if (findVehicle != null && findVehicle.vehicle_dimension != VehicleDimensions.World)
                {
                    returnVeh = spawnVehicle(findVehicle);
                }
            }

            if(returnVeh == null) { 
                List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();

                foreach(Vehicle vehicle in onlineVehicles)
                {
                    if(vehicle.NumberPlate == vehiclePlate)
                    {
                        returnVeh = vehicle;
                    }
                }
            }
            return returnVeh;
        }

        public static Vehicle getVehicleById(int vehicleId)
        {
            Vehicle returnVeh = null;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle findVehicle = dbContext.vehicles.Where(veh => veh.vehicle_id == vehicleId).FirstOrDefault();

                if (findVehicle != null && findVehicle.vehicle_dimension != VehicleDimensions.World)
                {
                    returnVeh = spawnVehicle(findVehicle);
                }
            }

            if (returnVeh == null)
            {
                List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();

                foreach (Vehicle vehicle in onlineVehicles)
                {
                    DbVehicle vehicleData = getVehicleData(vehicle);

                    if (vehicleData.vehicle_id == vehicleId)
                    {
                        returnVeh = vehicle;
                    }
                }
            }

            return returnVeh;
        }

        [RemoteEvent("vehicle:toggleLock")]
        public static void toggleVehiclesLock(Player player, Vehicle vehicle)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);

            if (vehicleData == null) return;

            vehicleData.vehicle_locked = !vehicleData.vehicle_locked;

            vehicle.Locked = vehicleData.vehicle_locked;

            if(vehicle.Locked)
            {
                closeAllDoors(vehicle);
            }

            saveVehicleData(vehicle, vehicleData);

            string lockUnlockText = $" You {(vehicleData.vehicle_locked ? "locked" : "unlocked")} vehicle with id {vehicleData.vehicle_id}";

            uiHandling.sendNotification(player, lockUnlockText);
        }

        public static void closeAllDoors(Vehicle vehicle)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);
            if(vehicleData != null)
            {
                for(int i = 0; i < vehicleData.vehicle_doors.Length; i++)
                {
                    vehicleData.vehicle_doors[i] = false;
                }

                saveVehicleData(vehicle, vehicleData);
            }

        }

        [RemoteEvent("server:handleDoorInteraction")]
        public void handleDoorInteraction(Player player, Vehicle vehicle, int boneTargetId)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);

            if(vehicleData == null || vehicle.Locked) return;

            vehicleData.vehicle_doors[boneTargetId] = !vehicleData.vehicle_doors[boneTargetId];

            saveVehicleData(vehicle, vehicleData);
        }

        [ServerEvent(Event.PlayerEnterVehicle)]
        public void onPlayerEnterVehicle(Player player, Vehicle vehicle, sbyte seatId)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);
            User userData = PlayersData.getPlayerAccountData(player);

            if(userData == null || vehicleData == null || vehicleData.vehicle_locked && !(userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin || userData.adminDuty))
            {
                player.WarpOutOfVehicle();
                return;
            }
        }


    }
}
