using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.VehicleInsurance;
using CloudRP.VehicleSystems.VehicleModification;
using GTANetworkAPI;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;

namespace CloudRP.VehicleSystems.Vehicles
{
    public class VehicleSystem : Script
    {
        public static List<DbVehicle> vehicles;
        public static string _vehicleSharedDataIdentifier = "VehicleData";
        public static string _vehicleSharedModData = "VehicleModData";
        public static string _vehicleDirtLevelIdentifier = "VehicleDirtLevel";
        public static string _seatBeltIdentifier = "playerIsWearingSeatBelt";
        private static int _timerInterval_seconds = 10;
        private static Timer saveVehicleTimer;
        public static readonly string[] bones = { "door_dside_f", "door_pside_f", "door_dside_r", "door_pside_r", "bonnet", "boot" };
        public static readonly string[] names = { "door", "door", "door", "door", "hood", "trunk", "trunk" };


        public VehicleSystem()
        {
            NAPI.Task.Run(() =>
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    vehicles = dbContext.vehicles.ToList();
                }

                ChatUtils.formatConsolePrint($"A total of {vehicles.Count} vehicles where loaded in.", ConsoleColor.Cyan);

                if (vehicles.Count > 0)
                {

                    foreach (var item in vehicles)
                    {
                        if (item.vehicle_dimension == VehicleDimensions.World)
                        {
                            spawnVehicle(item);
                        }
                    }
                };

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
            veh.Rotation = spawnRotation;


            vehicle.vehicle_locked = true;
            vehicle.vehicle_key_holders = getVehicleKeyHoldersFromDb(vehicle);

            veh.setVehicleData(vehicle, true, true);
            return veh;
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
                        if (vehicle.getData() == null)
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

            if (vehicleData == null) return (null, null);

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicleHash, position, rotation, 255, 255, vehiclePlate, 255, false, true, 0);

            veh.setVehicleData(vehicleData, true, true);
            return (veh, vehicleData);
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

        [ServerEvent(Event.VehicleDeath)]
        public void onVehicleDeath(Vehicle vehicle)
        {
            if (vehicle == null) return;
            try
            {
                DbVehicle vehicleData = vehicle.getData();

                if (vehicleData == null) return;

                List<InsuranceArea> insurances = VehicleInsuranceSystem.insuranceAreas;
                Dictionary<float, InsuranceArea> iDists = new Dictionary<float, InsuranceArea>();

                insurances.ForEach(insurance =>
                {
                    iDists.Add(Vector3.Distance(insurance.spawnPosition, vehicle.Position), insurance);
                });

                List<float> dists = new List<float>(iDists.Keys);
                dists.Sort();

                if (dists.Count > 0)
                {
                    InsuranceArea closestInsuranceToDeath = iDists.GetValueOrDefault(dists[0]);

                    vehicleData.vehicle_dimension = VehicleDimensions.Insurance;
                    vehicleData.position_x = closestInsuranceToDeath.spawnPosition.X;
                    vehicleData.position_y = closestInsuranceToDeath.spawnPosition.Y;
                    vehicleData.position_z = closestInsuranceToDeath.spawnPosition.Z;
                    vehicleData.vehicle_insurance_id = closestInsuranceToDeath.insuranceId;
                    vehicleData.vehicle_fuel = 100;
                    vehicleData.vehicle_health = 1000;

                    using (DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        dbContext.vehicles.Update(vehicleData);
                        dbContext.SaveChanges();
                    }

                    vehicle.Delete();
                    ChatUtils.formatConsolePrint($"Vehicle #{vehicleData.vehicle_id} ({vehicleData.vehicle_spawn_hash}) was saved to {closestInsuranceToDeath.insuranceName}.");
                }
            }
            catch
            {
            }

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
                DbVehicle findVehicle = dbContext.vehicles.Where(veh => veh.numberplate == vehiclePlate.ToUpper()).FirstOrDefault();

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

        [RemoteEvent("server:handleDoorInteraction")]
        public void handleDoorInteraction(Player player, Vehicle vehicle, int boneTargetId)
        {
            if (vehicle == null || Vector3.Distance(player.Position, vehicle.Position) > 4) return;

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

            vehicleData.engine_status = !vehicleData.engine_status;

            string vehicleName = $"{(vehName != null && vehName != "NULL" ? vehName : "vehicle")}";

            uiHandling.sendNotification(player, "You " + (vehicleData.engine_status ? "started" : "turned off") + $" the {vehicleName}'s engine.", true, true, (vehicleData.engine_status ? "Started" : "Turned off") + $" the {vehicleName}'s engine.");

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


        [ServerEvent(Event.PlayerEnterVehicle)]
        public void onPlayerEnterVehicle(Player player, Vehicle vehicle, sbyte seatId)
        {
            DbVehicle vehicleData = vehicle.getData();
            User userData = player.getPlayerAccountData();

            if (userData == null || vehicleData == null || vehicleData.vehicle_locked && !(userData.admin_status > (int)AdminRanks.Admin_HeadAdmin || userData.adminDuty))
            {
                player.WarpOutOfVehicle();
                return;
            }

            if (!vehicleData.engine_status && player.VehicleSeat == 0)
            {
                uiHandling.sendNotification(player, "~w~Use ~y~Y~w~ to start the engine.", false);
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
    }
}
