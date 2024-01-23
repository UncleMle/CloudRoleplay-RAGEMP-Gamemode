using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.Jobs;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.PlayerSystems.PlayerDealerships;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.VehicleInsurance;
using CloudRP.VehicleSystems.VehicleModification;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Timers;

namespace CloudRP.VehicleSystems.Vehicles
{
    public class VehicleSystem : Script
    {
        public static readonly string _vehicleSharedDataIdentifier = "VehicleData";
        public static readonly string _vehicleSharedModData = "VehicleModData";
        public static readonly string _vehicleDirtLevelIdentifier = "VehicleDirtLevel";
        public static readonly string _seatBeltIdentifier = "playerIsWearingSeatBelt";
        private static int _timerInterval_seconds = 10;
        private static Timer saveVehicleTimer;
        public static readonly string[] bones = { "door_dside_f", "door_pside_f", "door_dside_r", "door_pside_r", "bonnet", "boot" };
        public static readonly string[] names = { "door", "door", "door", "door", "hood", "trunk", "trunk" };

        #region Init
        public VehicleSystem()
        {
            NAPI.Task.Run(() =>
            {
                List<DbVehicle> vehicles;
                
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    vehicles = dbContext.vehicles.ToList();
                }

                int totalSpawned = 0;
                if (vehicles.Count > 0)
                {
                    foreach (DbVehicle item in vehicles)
                    {
                        if (item.vehicle_dimension == VehicleDimensions.World)
                        {
                            totalSpawned++;
                            spawnVehicle(item);
                        }
                    }
                };

                ChatUtils.formatConsolePrint($"A total of {totalSpawned} vehicles where loaded into the world.", ConsoleColor.Cyan);
                beginSaveInterval();
            });
        }

        void beginSaveInterval()
        {
            NAPI.Task.Run(() =>
            {
                saveVehicleTimer = new Timer();
                saveVehicleTimer.Interval = _timerInterval_seconds * 1000;
                saveVehicleTimer.Elapsed += saveAllVehicleDataToDb;

                saveVehicleTimer.AutoReset = true;
                saveVehicleTimer.Enabled = true;
            });
        }
        #endregion

        #region Global Methods
        public static Vehicle spawnVehicle(DbVehicle vehicle, Vector3 spawnCoords = null)
        {
            Vector3 spawnPosition = new Vector3(vehicle.position_x, vehicle.position_y, vehicle.position_z);
            Vector3 spawnRotation = new Vector3(vehicle.rotation_x, vehicle.rotation_y, vehicle.rotation_z);
            float rotation = vehicle.rotation;

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicle.vehicle_spawn_hash, spawnCoords ?? spawnPosition, rotation, 255, 255, vehicle.numberplate, 255, false, true, 0);

            vehicle.vehicle_dimension = VehicleDimensions.World;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.vehicles.Update(vehicle);
                dbContext.SaveChanges();
            }

            veh.Locked = true;

            vehicle.vehicle_locked = true;
            vehicle.vehicle_key_holders = getVehicleKeyHoldersFromDb(vehicle);

            if(vehicle.dealership_id != -1 && vehicle.dealership_spot_id != -1)
            {
                vehicle.vehicle_locked = false;
                veh.Locked = false;

                veh.SetSharedData(PlayerDealerships._playerVehicleDealerDataIdentifier, true);
                veh.SetData(PlayerDealerships._playerVehicleDealerDataIdentifier, true);

                foreach(DealerVehPos dealerVehPos in PlayerDealerVehPositions.dealerVehPositions)
                {
                    Vehicle findInSpot = checkVehInSpot(dealerVehPos.vehPos, 8);

                    if(findInSpot != null && findInSpot.getData() != null && findInSpot.getData().dealership_id == -1)
                    {
                        findInSpot.sendVehicleToInsurance();
                    }

                    if(dealerVehPos.ownerId == vehicle.dealership_id && dealerVehPos.vehInSpot == null)
                    {
                        dealerVehPos.vehInSpot = vehicle;
                        vehicle.dynamic_dealer_spot_id = dealerVehPos.spotId;

                        veh.Position = dealerVehPos.vehPos;
                        veh.Rotation = new Vector3(0, 0, dealerVehPos.vehRot);

                        PlayerDealerships.setSpotActiveWithVehicle(vehicle, vehicle.dynamic_dealer_spot_id);
                        break;
                    }
                }
            } else
            {
                veh.Rotation = spawnRotation;
            }

            veh.setVehicleData(vehicle, true, true);

            return veh;
        }

        public static (string, int) getVehiclesDisplayNameAndClass(string vehicleName)
        {
            string findDisplayName = null;
            int findClass = -1;

            try
            {
                using (StreamReader sr = new StreamReader(Main.JsonDirectory + "vehicles.json"))
                {
                    List<VehicleJsonData> vehicleData = JsonConvert.DeserializeObject<List<VehicleJsonData>>(sr.ReadToEnd());

                    foreach (VehicleJsonData item in vehicleData)
                    {
                        if (item.Name.ToLower() == vehicleName.ToLower())
                        {
                            findDisplayName = item.DisplayName.English;
                            findClass = item.ClassId;
                        }
                    }
                }
            }
            catch
            {
            }

            return (findDisplayName, findClass);
        }

        public static List<VehicleJsonData> getVehiclesJsonData()
        {
            List<VehicleJsonData> vehicleData = null;

            using (StreamReader sr = new StreamReader(Main.JsonDirectory + "vehicles.json"))
            {
                vehicleData = JsonConvert.DeserializeObject<List<VehicleJsonData>>(sr.ReadToEnd());
            }

            return vehicleData;
        }

        public static void addNewVehicleJson(VehicleJsonData newData)
        {
            List<VehicleJsonData> vehicleData = getVehiclesJsonData();

            if(vehicleData != null)
            {
                vehicleData.Add(newData);

                string newJson = JsonConvert.SerializeObject(vehicleData);

                File.WriteAllText(Main.JsonDirectory + "vehicles.json", newJson);
            }
        }

        public static bool editVehicleJsonData(string targetName, string displayName)
        {
            List<VehicleJsonData> vehicleData = getVehiclesJsonData();
            bool wasEdited = false; 

            if(vehicleData != null)
            {
                VehicleJsonData findData = vehicleData
                    .Where(data => data.Name == targetName)
                    .FirstOrDefault();

                if(findData != null)
                {
                    findData.DisplayName.Name = displayName;
                    findData.DisplayName.English = displayName;
                    
                    using(DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        List<DbVehicle> vehicles = dbContext.vehicles.ToList();

                        vehicles.ForEach(dbVeh =>
                        {
                            if(dbVeh.vehicle_name == targetName)
                            {
                                dbVeh.vehicle_display_name = targetName;
                                dbContext.Update(dbVeh);
                                dbContext.SaveChanges();
                            }
                        });

                        NAPI.Pools.GetAllVehicles().ForEach(onlineVeh =>
                        {
                            DbVehicle onlineVehData = onlineVeh.getData();
                            
                            if(onlineVehData?.vehicle_name == targetName)
                            {
                                onlineVehData.vehicle_display_name = displayName;
                                onlineVeh.saveVehicleData(onlineVehData, true);
                            }
                        });
                    }

                    string newJson = JsonConvert.SerializeObject(vehicleData);
                    File.WriteAllText(Main.JsonDirectory + "vehicles.json", newJson);
                    wasEdited = true;
                }
            }

            return wasEdited;
        }

        public static Vehicle getClosestVehicleToPlayer(Player player, float maxDist = 10)
        {
            List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();
            Dictionary<float, Vehicle> pDist = new Dictionary<float, Vehicle>();

            foreach (Vehicle veh in onlineVehicles)
            {
                float dist = Vector3.Distance(veh.Position, player.Position);

                if (dist < maxDist)
                {
                    pDist.Add(dist, veh);
                }
            }

            List<float> distList = new List<float>(pDist.Keys);

            distList.Sort();

            return pDist.Count == 0 ? null : pDist.GetValueOrDefault(distList[0]);
        }

        public static Vehicle vehicleIdOrPlate(string plateOrId)
        {
            Vehicle findVehicle = getVehicleByPlate(plateOrId.ToUpper());

            if (findVehicle == null)
            {
                int? vehicleId = CommandUtils.tryParse(plateOrId);

                if (vehicleId == null) return null;

                findVehicle = getVehicleById((int)vehicleId, null, false);
            }

            return findVehicle;
        }

        public static void saveAllVehicleDataToDb(object source, ElapsedEventArgs e)
        {
            List<Vehicle> allVehicles = NAPI.Pools.GetAllVehicles();

            foreach (var vehicle in allVehicles)
            {
                NAPI.Task.Run(() =>
                {
                    try
                    {
                        if (vehicle.getData() == null && vehicle.getFreelanceJobData() == null)
                        {
                            vehicle.Delete();
                            ChatUtils.formatConsolePrint("Possible vehicle spawn cheat. Vehicle with no data found!");
                        }
                        else
                        {
                            DbVehicle vehicleData = vehicle.getData();

                            if (vehicleData != null)
                            {
                                vehicle.saveVehicleData(vehicleData, true);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        ChatUtils.formatConsolePrint(ex.ToString());
                    }
                });
            }
        }

        public static void bringVehicleToPlayer(Player player, Vehicle vehicle, bool putInVehicle)
        {
            vehicle.Position = player.Position;
            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData != null)
            {
                vehicle.saveVehicleData(vehicleData, true);
            }
        }

        public static (Vehicle, DbVehicle) buildVehicle(string vehName, Vector3 position, float rotation, int ownerId, int colourOne, int colourTwo, string ownerName = "N/A")
        {
            Vehicle vehicle = null;
            DbVehicle vehData = null;

            try
            {
                string vehiclePlate = "notset";
                uint vehicleHash = NAPI.Util.GetHashKey(vehName);
                DbVehicle vehicleData = null;

                (string vehicleName, int classId) = getVehiclesDisplayNameAndClass(vehName);

                if (vehicleName == null) return (null, null);

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    DbVehicle vehicleInsert = new DbVehicle
                    {
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        owner_id = ownerId,
                        vehicle_display_name = vehicleName,
                        vehicle_class_id = classId,
                        owner_name = ownerName,
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
                    vehiclePlate = genUniquePlate(vehicleInsert.vehicle_id);

                    findJustInserted.numberplate = vehiclePlate;

                    vehicleData = dbContext.vehicles.Find(vehicleInsert.vehicle_id);

                    dbContext.vehicles.Update(vehicleInsert);
                    dbContext.SaveChanges();

                    dbContext.vehicle_mods.Add(new VehicleMods
                    {
                        vehicle_owner_id = vehicleInsert.vehicle_id,
                        colour_1 = colourOne,
                        colour_2 = colourTwo
                    });

                    dbContext.SaveChanges();
                }

                Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicleHash, position, rotation, colourOne, colourTwo, vehiclePlate, 255, false, true, 0);

                veh.setVehicleData(vehicleData, true, true);
                vehicle = veh;
                vehData = vehicleData;
            }
            catch
            {
            }

            return (vehicle, vehData);
        }

        public static Vehicle buildVolatileVehicle(Player player, string vehName, Vector3 pos, float rot, string plate, int colourOne = 111, int colourTwo = 111)
        {
            DbCharacter playerData = player.getPlayerCharacterData();
            Vehicle volatileVeh = null;
            try
            {
                if (playerData != null)
                {
                    (string vehicleName, int classId) = getVehiclesDisplayNameAndClass(vehName);

                    if(vehicleName != null)
                    {
                        volatileVeh = NAPI.Vehicle.CreateVehicle(NAPI.Util.GetHashKey(vehName), pos, rot, colourOne, colourTwo, plate, 255, false, true, 0);
                        volatileVeh.Locked = false;

                        volatileVeh.saveVehicleData(new DbVehicle
                        {
                            vehicle_id = -1,
                            CreatedDate = DateTime.Now,
                            dirt_level = 0,
                            vehicle_locked = false,
                            vehicle_name = vehName,
                            vehicle_display_name = vehicleName,
                            vehicle_class_id = classId,
                            engine_status = true,
                            numberplate = plate,
                            owner_name = playerData.character_name,
                            owner_id = playerData.character_id,
                            vehicle_fuel = 100,
                        });
                    }
                }
            }
            catch
            {
            }

            return volatileVeh;
        }

        public static Vehicle findVehicleById(int vehicleId)
        {
            List<Vehicle> allVehicles = NAPI.Pools.GetAllVehicles();
            Vehicle foundVehicle = null;

            foreach (var vehicle in allVehicles)
            {
                DbVehicle vehicleData = vehicle.GetData<DbVehicle>(_vehicleSharedDataIdentifier);

                if (vehicleData.vehicle_id == vehicleId)
                {
                    foundVehicle = vehicle;
                }
            }

            return foundVehicle;
        }

        public static VehicleMods getVehiclesMods(int vehicleId)
        {
            VehicleMods mods = null;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                mods = dbContext.vehicle_mods
                    .Where(mod => mod.vehicle_owner_id == vehicleId)
                    .FirstOrDefault();
            }

            return mods;
        }

        public static DbVehicle getVehicleDataById(int vehicleId)
        {
            Vehicle vehicle = findVehicleById(vehicleId);

            if (vehicle == null) return null;

            DbVehicle findData = vehicle.getData();

            return findData;
        }

        public static bool deleteVehicleById(int vehicleId)
        {
            bool returnRes = false;

            NAPI.Task.Run(() =>
            {
                Vehicle vehicle = findVehicleById(vehicleId);
                DbVehicle vehicleData = getVehicleDataById(vehicleId);

                if (vehicleData != null && vehicleData.vehicle_id == -1)
                {
                    if(vehicle.getFreelanceJobData() != null)
                    {
                        FreelanceJobSystem.handleVehicleDestroyed(vehicle);
                    }

                    vehicle.Delete();

                    returnRes = true;
                }

                if (vehicle != null && vehicleData != null)
                {
                    using (DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        dbContext.vehicles.Remove(vehicleData);
                        dbContext.SaveChanges();
                    }

                    vehicle.SetData<DbVehicle>(_vehicleSharedDataIdentifier, null);
                    vehicle.Delete();

                    returnRes = true;
                }
            });

            return returnRes;
        }

        public static DbCharacter getOwnerOfVehicleById(int vehicleOwnerId)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();
            DbCharacter foundPlayer = null;

            foreach (Player player in onlinePlayers)
            {
                DbCharacter charData = player.getPlayerCharacterData();

                if (charData != null)
                {
                    if (charData.character_id == vehicleOwnerId)
                    {
                        foundPlayer = charData;
                    }
                }
            }

            return foundPlayer;
        }

        public static InsuranceArea getClosestInsuranceToDeath(Vehicle vehicle)
        {
            List<InsuranceArea> insurances = VehicleInsuranceSystem.insuranceAreas;
            Dictionary<float, InsuranceArea> iDists = new Dictionary<float, InsuranceArea>();

            insurances.ForEach(insurance =>
            {
                iDists.Add(Vector3.Distance(insurance.spawnPosition, vehicle.Position), insurance);
            });

            List<float> dists = new List<float>(iDists.Keys);
            dists.Sort();

            return iDists.GetValueOrDefault(dists[0]);
        }

        public static List<Vehicle> getVehicleInRange(Player player, float range)
        {
            List<Vehicle> vehicles = NAPI.Pools.GetAllVehicles();
            List<Vehicle> rangeVehicles = new List<Vehicle>();

            foreach (Vehicle vehicle in vehicles)
            {
                if (Vector3.Distance(player.Position, vehicle.Position) < range)
                {
                    rangeVehicles.Add(vehicle);
                }
            }

            return rangeVehicles;
        }

        public static Vehicle getVehicleByPlate(string vehiclePlate)
        {
            Vehicle returnVeh = null;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle findVehicle = dbContext.vehicles.Where(veh => veh.numberplate.ToUpper() == vehiclePlate.ToUpper()).FirstOrDefault();

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
                    if (vehicle.NumberPlate == vehiclePlate.ToUpper())
                    {
                        returnVeh = vehicle;
                    }
                }
            }
            return returnVeh;
        }

        public static Vehicle getVehicleById(int vehicleId, Vector3 possibleSpawn = null, bool shouldSpawn = true)
        {
            Vehicle returnVeh = null;

            if (shouldSpawn)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    DbVehicle findVehicle = dbContext.vehicles.Where(veh => veh.vehicle_id == vehicleId).FirstOrDefault();

                    if (findVehicle != null && findVehicle.vehicle_dimension != VehicleDimensions.World)
                    {
                        returnVeh = spawnVehicle(findVehicle, possibleSpawn);
                    }
                }
            }

            if (returnVeh == null)
            {
                List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();

                foreach (Vehicle vehicle in onlineVehicles)
                {
                    DbVehicle vehicleData = vehicle.getData();

                    if (vehicleData.vehicle_id == vehicleId)
                    {
                        returnVeh = vehicle;
                    }
                }
            }

            return returnVeh;
        }

        public static List<VehicleKey> getVehicleKeyHoldersFromDb(DbVehicle vehicle)
        {
            List<VehicleKey> keyHolders = null;

            if (vehicle != null)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    keyHolders = dbContext.vehicle_keys.Where(vKey => vKey.vehicle_id == vehicle.vehicle_id).ToList();
                }
            }

            return keyHolders;
        }


        public static void removeKeyFromWorldVeh(int vehicleId, int keyId)
        {
            NAPI.Pools.GetAllVehicles().ForEach(veh =>
            {
                DbVehicle vehData = veh.getData();

                if (vehData != null && vehData.vehicle_id == vehicleId)
                {
                    VehicleKey findKey = vehData.vehicle_key_holders
                    .Where(key => key.vehicle_id == vehicleId && key.vehicle_key_id == keyId)
                    .FirstOrDefault();

                    if (findKey != null)
                    {
                        vehData.vehicle_key_holders.Remove(findKey);
                    }
                }
            });
        }

        public static string genUniquePlate(int vehicleId)
        {
            string characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            string result = "";

            int fillAmount = 8 - vehicleId.ToString().Count();

            for (int i = 0; i < fillAmount; i++)
            {
                Random r = new Random();
                int rInt = r.Next(0, characters.Length);
                result += characters[rInt];
            }

            string[] rArr = result.Split("");

            Array.Resize(ref rArr, rArr.Length + 1);
            Array.Copy(rArr, 0, rArr, 1, rArr.Length - 1);
            rArr[0] = vehicleId.ToString();

            return string.Join("", rArr).ToUpper();
        }

        public static Vehicle checkVehInSpot(Vector3 spot, int range)
        {
            Vehicle blockingVehicle = null;

            NAPI.Pools.GetAllVehicles().ForEach(veh =>
            {
                if(veh.Position.DistanceToSquared(spot) < range)
                {
                    blockingVehicle = veh;
                }
            });

            return blockingVehicle;
        }
        #endregion

        #region Commands
        [Command("vw", "~y~Use: ~w~/vw [window]", Alias = "vehiclewindow")]
        public void vehicleWindows(Player player, int vehicleIndex)
        {
            if (!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            DbVehicle vehicleData = player.Vehicle.getData();

            if (vehicleData == null) return;

            if (!(player.VehicleSeat == 0 || player.VehicleSeat == 1))
            {
                CommandUtils.errorSay(player, "You must be the driver or front passenger to use this command.");
                return;
            }

            if (vehicleIndex > vehicleData.vehicle_windows.Length || vehicleIndex < 0)
            {
                CommandUtils.errorSay(player, "Enter a valid window to roll up or down.");
                return;
            }

            vehicleData.vehicle_windows[vehicleIndex] = !vehicleData.vehicle_windows[vehicleIndex];

            string openCloseTextNotif = "You " + (vehicleData.vehicle_windows[vehicleIndex] ? "opened" : "closed") + " this vehicle's window.";

            uiHandling.sendNotification(player, openCloseTextNotif, true, true, "Rolled " + (vehicleData.vehicle_windows[vehicleIndex] ? "down" : "up") + " a vehicle window.");

            player.Vehicle.saveVehicleData(vehicleData);
        }

        [Command("cruisec", "~y~Use: ~w~ /cruisecontrol [limit | none]", Alias = "cruisecontrol")]
        public void speedLimitCommand(Player player, string limit)
        {
            if (!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            DbVehicle vehicleData = player.Vehicle.getData();

            if (vehicleData != null)
            {
                if (limit == "none")
                {
                    vehicleData.speed_limit = -1;

                    player.Vehicle.setVehicleData(vehicleData);

                    CommandUtils.successSay(player, "You toggled off cruise control.");
                    return;
                }

                try
                {
                    int speedLimit = int.Parse(limit);

                    if (speedLimit < 50 || speedLimit > 300)
                    {
                        CommandUtils.errorSay(player, "Enter a speed limit between 50 and 300");
                        return;
                    }

                    vehicleData.speed_limit = speedLimit * 0.2764976958525346;

                    player.Vehicle.setVehicleData(vehicleData);

                    CommandUtils.successSay(player, $"You set your vehicle's speed limit to {speedLimit}");
                }
                catch
                {
                    CommandUtils.errorSay(player, "Enter a valid speed limit.");
                }
            }
        }
        #endregion


        #region Remote Events
        [RemoteEvent("server:handleDoorInteraction")]
        public void handleDoorInteraction(Player player, Vehicle vehicle, int boneTargetId)
        {
            if (vehicle == null || Vector3.Distance(player.Position, vehicle.Position) > 12) return;

            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData == null || vehicle.Locked) return;

            vehicleData.vehicle_doors[boneTargetId] = !vehicleData.vehicle_doors[boneTargetId];
            vehicle.saveVehicleData(vehicleData);
        }

        [RemoteEvent("server:toggleEngine")]
        public void handleToggleEngine(Player player, string vehName)
        {
            if (!player.IsInVehicle) return;

            if (player.VehicleSeat != 0 || NAPI.Vehicle.GetVehicleBodyHealth(player.Vehicle) <= 0) return;

            DbVehicle vehicleData = player.Vehicle.getData();

            if (vehicleData == null) return;

            Console.WriteLine("stalled " + player.Vehicle.isStalled());

            if(player.Vehicle.isStalled())
            {
                uiHandling.sendNotification(player, "~r~Vehicle is stalled", false);
                return;
            }

            vehicleData.engine_status = !vehicleData.engine_status;

            uiHandling.sendNotification(player, "You " + (vehicleData.engine_status ? "started" : "turned off") + $" the {vehicleData.vehicle_display_name}'s engine.", true, true, (vehicleData.engine_status ? "Started" : "Turned off") + $" the {vehicleData.vehicle_display_name}'s engine.");

            player.Vehicle.saveVehicleData(vehicleData);
        }

        [RemoteEvent("server:toggleIndication")]
        public void toggleVehicleIndicator(Player player, int indicationId)
        {
            if (!player.IsInVehicle) return;

            DbVehicle vehicleData = player.Vehicle.getData();

            if (vehicleData == null || player.VehicleSeat != 0) return;

            vehicleData.indicator_status = indicationId;

            player.Vehicle.saveVehicleData(vehicleData);
        }

        [RemoteEvent("server:toggleSiren")]
        public void toggleVehicleSiren(Player player)
        {
            if (!player.IsInVehicle) return;

            DbVehicle vehicleData = player.Vehicle.getData();

            if (vehicleData == null || player.VehicleSeat != 0) return;

            vehicleData.vehicle_siren = !vehicleData.vehicle_siren;

            player.Vehicle.saveVehicleData(vehicleData);
        }

        [RemoteEvent("server:saveVehicleDamage")]
        public void saveVehicleDamage(Player player)
        {
            if (player.IsInVehicle)
            {
                DbVehicle vehicleData = player.Vehicle.getData();

                if (vehicleData != null)
                {
                    vehicleData.vehicle_health = NAPI.Vehicle.GetVehicleBodyHealth(player.Vehicle);

                    if (vehicleData.vehicle_health <= 0)
                    {
                        vehicleData.engine_status = false;
                        return;
                    }
                    player.Vehicle.saveVehicleData(vehicleData, true);
                }
            }
        }

        [RemoteEvent("server:updateVehicleDistance")]
        public void updateVehicleDistance(Player player, string getOldDist)
        {
            if (!player.IsInVehicle || getOldDist == null) return;

            Vehicle playerVehicle = player.Vehicle;
            DbVehicle playerVehicleData = playerVehicle.getData();
            if (playerVehicleData == null) return;

            Vector3 oldDist = JsonConvert.DeserializeObject<Vector3>(getOldDist);
            if (oldDist == null) return;

            float dist = Vector3.Distance(oldDist, player.Vehicle.Position);

            playerVehicleData.vehicle_distance += (ulong)dist;

            playerVehicle.saveVehicleData(playerVehicleData);
        }

        [RemoteEvent("server:updateVehicleFuel")]
        public void removeVehicleFuel(Player player, double vehicleSpeed)
        {
            Vehicle vehicle = player.Vehicle;
            if (vehicle == null) return;

            User userData = player.getPlayerAccountData();
            if (userData != null && userData.adminDuty) return;

            DbVehicle vehicleData = player.Vehicle.getData();

            if (!vehicleData.engine_status) return;

            Dictionary<int, double> fuelMultipliers = FuelMultipliers.fuelMultipliers;

            bool completedRemoval = false;

            foreach (KeyValuePair<int, double> multiplier in fuelMultipliers)
            {
                if (multiplier.Key == player.Vehicle.Class)
                {
                    vehicleData.vehicle_fuel -= vehicleSpeed * (multiplier.Value / 10);

                    if (vehicleData.vehicle_fuel <= 0)
                    {
                        vehicleData.vehicle_fuel = 0;
                    }

                    completedRemoval = true;
                }
            }

            if (completedRemoval)
            {
                vehicle.saveVehicleData(vehicleData);
            }
        }

        [RemoteEvent("vehicle:toggleLock")]
        public static void toggleVehiclesLock(Player player, Vehicle vehicle)
        {
            User playerData = player.getPlayerAccountData();
            DbCharacter charData = player.getPlayerCharacterData();
            if (vehicle == null) return;

            DbVehicle vehicleData = vehicle.getData();

            if (vehicleData == null || charData == null) return;

            if (charData.character_id == vehicleData.owner_id || playerData.adminDuty)
            {
                vehicle.toggleLock(!vehicleData.vehicle_locked);

                string lockUnlockText = $"{(playerData.adminDuty ? "~r~[Staff]" : "")} You {(vehicleData.vehicle_locked ? "locked" : "unlocked")} vehicle.";
                uiHandling.sendNotification(player, lockUnlockText, !playerData.adminDuty, !playerData.adminDuty, (vehicleData.vehicle_locked ? "Locks" : "Unlocks") + " vehicle.");
            }
            else if (vehicleData.vehicle_key_holders.Count > 0)
            {
                VehicleKey vehicleKey = vehicleData.vehicle_key_holders
                    .Where(holder => holder.target_character_id == charData.character_id && holder.vehicle_id == vehicleData.vehicle_id)
                    .FirstOrDefault();

                if (vehicleKey != null)
                {
                    vehicle.toggleLock(!vehicleData.vehicle_locked);

                    string lockUnlockText = $"{(playerData.adminDuty ? "~r~[Staff]" : "")} You {(vehicleData.vehicle_locked ? "locked" : "unlocked")} vehicle.";
                    uiHandling.sendNotification(player, lockUnlockText, !playerData.adminDuty, !playerData.adminDuty, (vehicleData.vehicle_locked ? "Locks" : "Unlocks") + " vehicle.");
                }
            }
        }

        [RemoteEvent("vehicle:toggleSeatBelt")]
        public void toggleSeatBelt(Player player, bool toggle)
        {
            if (player.IsInVehicle)
            {
                player.SetCustomData(_seatBeltIdentifier, toggle);
                player.SetCustomSharedData(_seatBeltIdentifier, toggle);
            }
        }


        [RemoteEvent("server:addVehicleKey")]
        public static void giveVehiclesKeys(Player player, string data)
        {
            VehicleKeyData keyData = JsonConvert.DeserializeObject<VehicleKeyData>(data);
            if (keyData == null) return;

            if (!player.IsInVehicle)
            {
                uiHandling.sendPushNotifError(player, "You must be in a vehicle to use this!", 5600);
                return;
            }

            if (keyData.nickname != null && keyData.nameOrId != null)
            {
                if (keyData.nickname.Length > 40)
                {
                    uiHandling.sendPushNotifError(player, "Key nickname must be less than 40 characters", 6600, true);
                    return;
                }

                DbCharacter playerCharData = player.getPlayerCharacterData();
                if (playerCharData == null) return;
                Player playerFindPlayer = CommandUtils.getPlayerFromNameOrId(keyData.nameOrId);

                if (playerFindPlayer == null || playerFindPlayer != null && Vector3.Distance(playerFindPlayer.Position, player.Position) > 6)
                {
                    uiHandling.sendPushNotifError(player, "Player couldn't be found. (Are you within distance?)", 6600);
                    return;
                }

                if (player.Equals(playerFindPlayer))
                {
                    uiHandling.sendPushNotifError(player, "You cannot give keys to yourself.", 6600);
                    return;
                }

                DbCharacter playerFindData = playerFindPlayer.getPlayerCharacterData();
                if (playerFindData == null) return;

                if (!playerFindPlayer.IsInVehicle || playerFindPlayer.IsInVehicle && !player.Vehicle.Equals(playerFindPlayer.Vehicle))
                {
                    uiHandling.sendPushNotifError(player, "Target must be in the same vehicle as you.", 6600);
                    return;
                }

                Vehicle targetVeh = player.Vehicle;
                DbVehicle targetVehData = targetVeh.getData();

                if (targetVehData.vehicle_id != keyData.vehicleId)
                {
                    uiHandling.sendPushNotifError(player, "You and the target must both be in the same vehicle.", 6600);
                    return;
                }

                if (targetVehData != null)
                {
                    if (targetVehData.owner_id != playerCharData.character_id) return;

                    VehicleKey findIfAlreadyHas = targetVehData.vehicle_key_holders
                        .Where(key => key.target_character_id == playerFindData.character_id && key.vehicle_id == targetVehData.vehicle_id)
                        .FirstOrDefault();

                    if (findIfAlreadyHas != null)
                    {
                        uiHandling.sendPushNotif(player, "This player already has keys to this vehicle.", 6600);
                        return;
                    }

                    VehicleKey newKey = new VehicleKey
                    {
                        target_character_id = playerFindData.character_id,
                        vehicle_id = targetVehData.vehicle_id,
                        vehicle_name = targetVehData.vehicle_name,
                        nickname = keyData.nickname
                    };

                    targetVehData.vehicle_key_holders.Add(newKey);

                    using (DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        dbContext.vehicle_keys.Add(newKey);
                        dbContext.SaveChanges();
                    }

                    targetVeh.saveVehicleData(targetVehData, true);

                    uiHandling.sendPushNotif(player, "You gave a vehicle key.", 6600, true, true, true);
                }
            }
            else
            {
                uiHandling.sendPushNotifError(player, "Ensure all fields are filled", 6000, true);
            }
        }

        [RemoteEvent("server:removeKey")]
        public void removeVehicleKeys(Player player, string data)
        {
            VehicleKeyRemoveData vehicleKeyRemoveData = JsonConvert.DeserializeObject<VehicleKeyRemoveData>(data);
            if (vehicleKeyRemoveData == null) return;

            DbCharacter playerCharData = player.getPlayerCharacterData();
            if (playerCharData == null) return;


            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbVehicle findVeh = dbContext.vehicles
                    .Where(veh => veh.vehicle_id == vehicleKeyRemoveData.vehicle_id && veh.owner_id == playerCharData.character_id)
                    .FirstOrDefault();

                if (findVeh == null) return;

                VehicleKey checkIfExists = dbContext.vehicle_keys
                    .Where(vehKey => vehKey.vehicle_id == findVeh.vehicle_id && vehKey.vehicle_key_id == vehicleKeyRemoveData.keyId)
                    .FirstOrDefault();

                if (checkIfExists == null) return;

                dbContext.vehicle_keys.Remove(checkIfExists);

                dbContext.SaveChanges();

                removeKeyFromWorldVeh(findVeh.vehicle_id, checkIfExists.vehicle_key_id);
                uiHandling.sendPushNotif(player, "You removed a vehicle key!", 6600, true, true, true);
            }
        }

        [RemoteEvent("server:stallVehicle")]
        public void beginVehicleStall(Player player, int stallType)
        {
            if(player.IsInVehicle && player.VehicleSeat == 0 && !player.Vehicle.isStalled() && player.Vehicle.getData() != null)
            {
                DbVehicle vehicleData = player.Vehicle.getData();
                int targetVehId = vehicleData.vehicle_id;
                int timeOut_seconds = stallType == 0 ? 6 : 12;
                
                player.Vehicle.setVehicleStalled(true);
                uiHandling.sendNotification(player, $"~r~You have stalled the vehicle. Please wait {timeOut_seconds} seconds.", false);

                NAPI.Task.Run(() =>
                {
                    NAPI.Pools.GetAllVehicles().ForEach(veh =>
                    {
                        if(veh.getData()?.vehicle_id ==  targetVehId)
                        {
                            veh.setVehicleStalled(false);
                        }
                    });
                }, timeOut_seconds * 1000);

            }
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerEnterVehicle)]
        public void onPlayerEnterVehicle(Player player, Vehicle vehicle, sbyte seatId)
        {
            DbVehicle vehicleData = vehicle.getData();
            User userData = player.getPlayerAccountData();

            if (userData == null || vehicleData == null && vehicle.getFreelanceJobData() == null || vehicleData != null && vehicleData.vehicle_locked && !(userData.admin_status > (int)AdminRanks.Admin_HeadAdmin || userData.adminDuty))
            {
                player.WarpOutOfVehicle();
                return;
            }

            if (vehicleData != null && !vehicleData.engine_status && player.VehicleSeat == 0)
            {
                uiHandling.sendNotification(player, "~w~Use ~y~Y~w~ to start the engine.", false);
            }
        }

        [ServerEvent(Event.VehicleDeath)]
        public void onVehicleDeath(Vehicle vehicle)
        {
            NAPI.Task.Run(() =>
            {
                if (vehicle == null) return;
                try
                {
                    DbVehicle vehicleData = vehicle.getData();

                    if (vehicleData == null) return;

                    if (vehicleData.vehicle_id == -1 && vehicle.getFreelanceJobData() != null)
                    {
                        FreelanceJobSystem.handleVehicleDestroyed(vehicle);
                        return;
                    }

                    if (vehicleData.dealership_id != -1)
                    {
                        vehicle.Delete();

                        PlayerDealerVehPositions.dealerVehPositions
                            .Where(dealerPos => dealerPos.spotId == vehicleData.dynamic_dealer_spot_id)
                            .FirstOrDefault()
                            .vehInSpot = null;

                        NAPI.Task.Run(() =>
                        {
                            if (vehicleData != null)
                            {
                                spawnVehicle(vehicleData);
                            }
                        }, 1500);

                        return;
                    }

                    vehicle.sendVehicleToInsurance(true);
                }
                catch
                {
                    ChatUtils.formatConsolePrint("An error occured when saving vehicle.");
                }
            });
        }
        #endregion
    }
}
