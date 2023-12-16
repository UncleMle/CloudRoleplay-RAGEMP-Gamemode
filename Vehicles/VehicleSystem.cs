using CloudRP.Admin;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.VehicleModification;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;

namespace CloudRP.Vehicles
{
    internal class VehicleSystem : Script
    {
        public static List<DbVehicle> vehicles;
        public static string _vehicleSharedDataIdentifier = "VehicleData";
        private static int _timerInterval_seconds = 10;
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
                saveVehicleTimer.Interval = _timerInterval_seconds * 1000;
                saveVehicleTimer.Elapsed += saveAllVehicleDataToDb;

                saveVehicleTimer.AutoReset = true;
                saveVehicleTimer.Enabled = true;
            });
        }
        
        public static Vehicle spawnVehicle(DbVehicle vehicle, Vector3 spawnCoords = null)
        {
            Vector3 spawnPosition = new Vector3(vehicle.position_x, vehicle.position_y, vehicle.position_z);
            float rotation = vehicle.rotation;

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicle.vehicle_spawn_hash, spawnCoords ?? spawnPosition, rotation, 255, 255, vehicle.numberplate, 255, false, true, 0);

            vehicle.vehicle_dimension = VehicleDimensions.World;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.vehicles.Update(vehicle);
                dbContext.SaveChanges();
            }

            veh.Locked = true;
            veh.Rotation = new Vector3(0, 0, rotation);

            vehicle.vehicle_locked = true;
            vehicle.vehicle_key_holders = getVehicleKeyHoldersFromDb(vehicle);

            setVehicleData(veh, vehicle);
            return veh;
        }

        public static List<VehicleKey> getVehicleKeyHoldersFromDb(DbVehicle vehicle)
        {
            List<VehicleKey> keyHolders = null;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                keyHolders = dbContext.vehicle_keys.Where(vKey => vKey.vehicle_id == vehicle.vehicle_id).ToList();
            }

            return keyHolders;
        }

        public static void sendVehicleToInsurance(Vehicle vehicle)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);

            if(vehicleData != null)
            {
                vehicleData.vehicle_dimension = VehicleDimensions.Insurance;
                vehicleData.UpdatedDate = DateTime.Now;

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.vehicles.Update(vehicleData);

                    dbContext.SaveChanges();
                }

                vehicle.Delete();

                return;
            }
        }

        public static void setVehicleData(Vehicle vehicle, DbVehicle vehicleData)
        {
            vehicleData.vehicle_mods = getVehiclesMods(vehicleData.vehicle_id);
            vehicle.SetSharedData(_vehicleSharedDataIdentifier, vehicleData);
            vehicle.SetData(_vehicleSharedDataIdentifier, vehicleData);
        }

        public static Vehicle getClosestVehicleToPlayer(Player player, float maxDist = 10)
        {
            List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();
            Dictionary<float, Vehicle> pDist = new Dictionary<float, Vehicle>();

            foreach (Vehicle veh in onlineVehicles)
            {
                float dist = Vector3.Distance(veh.Position, player.Position);

                if(dist < maxDist)
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
                try
                {
                    if(getVehicleData(vehicle) == null)
                    {
                        vehicle.Delete();
                        Console.WriteLine("Possible vehicle spawn cheat. Vehicle with no data found!");
                    } else
                    {
                        DbVehicle vehicleData = getVehicleData(vehicle);

                        if(vehicleData != null)
                        {
                            saveVehicleData(vehicle, vehicleData, true);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }
            }
        }


        public static void saveVehicleData(Vehicle vehicle, DbVehicle vehicleData, bool updateDb = false)
        {
            setVehicleData(vehicle, vehicleData);

            if(updateDb)
            {
                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    vehicleData.position_x = vehicle.Position.X;
                    vehicleData.position_y = vehicle.Position.Y;
                    vehicleData.position_z = vehicle.Position.Z;
                    vehicleData.rotation = vehicle.Rotation.Z;

                    dbContext.vehicles.Update(vehicleData);
                    dbContext.SaveChanges();
                }
            }

        }

        public static void bringVehicleToPlayer(Player player, Vehicle vehicle, bool putInVehicle)
        {
            vehicle.Position = player.Position;

            DbVehicle vehicleData = getVehicleData(vehicle);

            if(vehicleData != null)
            {
                saveVehicleData(vehicle , vehicleData, true);
            }
        }

        public static Vehicle buildVehicle(string vehName, Vector3 position, float rotation, int ownerId, int colourOne, int colourTwo)
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

            if (vehicleData == null) return null;

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicleHash, position, rotation, 255, 255, vehiclePlate, 255, false, true, 0);
            setVehicleData(veh, vehicleData);
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

        public static DbVehicle getVehicleData(Vehicle vehicle)
        {
            DbVehicle getData = null;

            if(vehicle != null)
            {
                getData = vehicle.GetData<DbVehicle>(_vehicleSharedDataIdentifier);
            }

            return getData;
        }

        public static DbVehicle getVehicleDataById(int vehicleId)
        {
            Vehicle vehicle = findVehicleById(vehicleId);
            
            if(vehicle == null ) return null;

            DbVehicle findData = getVehicleData(vehicle);

            return findData;
        }

        public static bool deleteVehicleById(int vehicleId)
        {
            bool returnRes = false;

            NAPI.Task.Run(() =>
            {
                Vehicle vehicle = findVehicleById(vehicleId);
                DbVehicle vehicleData = getVehicleDataById(vehicleId);

                if(vehicle != null && vehicleData != null)
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
            AdminUtils.staffSay(player, ChatUtils.yellow + "-----------------------------------------------------------");
            AdminUtils.staffSay(player, "Vehicle id: " + ChatUtils.red + vehicle.vehicle_id + AdminUtils.staffSuffixColour + " VehName: " + ChatUtils.red + vehicle.vehicle_name);
            AdminUtils.staffSay(player, "Owner id: " + ChatUtils.red + vehicle.owner_id + AdminUtils.staffSuffixColour + " Numberplate: " + ChatUtils.red + vehicle.numberplate);
            AdminUtils.staffSay(player, "Vehicle Dimension: " + ChatUtils.red + vehicle.vehicle_dimension + AdminUtils.staffSuffixColour + " Lock Status: " + ChatUtils.red + vehicle.vehicle_locked);
            AdminUtils.staffSay(player, "Mileage: " + ChatUtils.red + (vehicle.vehicle_distance / 1609).ToString("N0") + " Miles" + AdminUtils.staffSuffixColour + " Fuel Level: " + ChatUtils.red + vehicle.vehicle_fuel.ToString("N1")+"%");

            DbCharacter vehicleOwnerData = getOwnerOfVehicleById(vehicle.owner_id);
            if ((userdata.adminDuty || userdata.adminLevel > (int)AdminRanks.Admin_HeadAdmin) && vehicleOwnerData != null)
            {
                AdminUtils.staffSay(player, "Owner: " + ChatUtils.red + vehicleOwnerData.character_name+ AdminUtils.staffSuffixColour + " Owner Last Login: " + ChatUtils.red + vehicleOwnerData.last_login);
            }

            AdminUtils.staffSay(player, ChatUtils.yellow + "-----------------------------------------------------------");
        }

        [ServerEvent(Event.VehicleDeath)]
        public void onVehicleDeath(Vehicle vehicle)
        {
            if (vehicle == null) return;

            try
            {
                DbVehicle vehicleData = getVehicleData(vehicle);

                if (vehicleData == null) return;

                vehicleData.vehicle_dimension = VehicleDimensions.Insurance;
                vehicleData.position_x = VehicleDimensions.morsPosition.X;
                vehicleData.position_y = VehicleDimensions.morsPosition.Y;
                vehicleData.position_z = VehicleDimensions.morsPosition.Z;
                vehicleData.vehicle_insurance_id = VehicleDimensions._morsId;
                vehicleData.vehicle_fuel = 100;

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.vehicles.Update(vehicleData);
                    dbContext.SaveChanges();
                }

                vehicle.Delete();
                Console.WriteLine($"Vehicle #{vehicleData.vehicle_id} was saved to insurance. ");
            }
            catch
            {

            }
            
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
                DbVehicle findVehicle = dbContext.vehicles.Where(veh => veh.numberplate == vehiclePlate.ToUpper()).FirstOrDefault();

                if (findVehicle != null && findVehicle.vehicle_dimension != VehicleDimensions.World)
                {
                    returnVeh = spawnVehicle(findVehicle);
                }
            }

            if(returnVeh == null) { 
                List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();

                foreach(Vehicle vehicle in onlineVehicles)
                {
                    if(vehicle.NumberPlate == vehiclePlate.ToUpper())
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

            if(shouldSpawn)
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
            User playerData = PlayersData.getPlayerAccountData(player);
            DbCharacter charData = PlayersData.getPlayerCharacterData(player);

            if (vehicleData == null || charData == null) return;

            VehicleKey vehicleKey = vehicleData.vehicle_key_holders
                .Where(holder => holder.target_character_id == charData.character_id && holder.vehicle_id == vehicleData.vehicle_id)
                .FirstOrDefault();

            if (charData.character_id == vehicleData.owner_id || vehicleKey != null || playerData.adminDuty)
            {
                vehicleData.vehicle_locked = !vehicleData.vehicle_locked;

                vehicle.Locked = vehicleData.vehicle_locked;

                if (vehicle.Locked)
                {
                    closeAllDoors(vehicle);
                    closeAllWindows(vehicle);
                }

                saveVehicleData(vehicle, vehicleData);

                string lockUnlockText = $"{(playerData.adminDuty ? "~r~[Staff]" : "")} You {(vehicleData.vehicle_locked ? "locked" : "unlocked")} vehicle.";

                uiHandling.sendNotification(player, lockUnlockText, !playerData.adminDuty);
            }
        }

        [Command("givekeys", "~y~Use:~w~ /givekeys [nameOrId]")]
        public static void giveVehiclesKeys(Player player, string nameOrId)
        {
            if(!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            DbCharacter playerCharData = PlayersData.getPlayerCharacterData(player);
            if (playerCharData == null) return;
            Player playerFindPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if(playerFindPlayer == null || playerFindPlayer != null && Vector3.Distance(playerFindPlayer.Position, player.Position) > 6)
            {
                CommandUtils.errorSay(player, "Player couldn't be found. (Are you within distance?)");
                return;
            }

            if (player.Equals(playerFindPlayer))
            {
                CommandUtils.errorSay(player, "You cannot give vehicle keys to yourself.");
                return;
            }

            DbCharacter playerFindData = PlayersData.getPlayerCharacterData(playerFindPlayer);
            if (playerFindData == null) return;
            
            if(!playerFindPlayer.IsInVehicle)
            {
                CommandUtils.errorSay(player, "Target must be in the same vehicle as you.");
                return;
            }

            Vehicle targetVeh = player.Vehicle;
            DbVehicle targetVehData = getVehicleData(targetVeh);


            if(targetVehData != null)
            {
                if (targetVehData.owner_id != playerCharData.character_id)
                {
                    CommandUtils.errorSay(player, "You must own the vehicle to give keys to it.");
                    return;
                }

                VehicleKey findIfAlreadyHas = targetVehData.vehicle_key_holders
                    .Where(key => key.target_character_id == playerFindData.character_id && key.vehicle_id == targetVehData.vehicle_id)
                    .FirstOrDefault();

                if(findIfAlreadyHas != null)
                {
                    CommandUtils.errorSay(player, "This player already has keys to this vehicle.");
                    return;
                } 


                VehicleKey newKey = new VehicleKey
                {
                    target_character_id = playerFindData.character_id,
                    vehicle_id = targetVehData.vehicle_id,
                    vehicle_name = targetVehData.vehicle_name
                };

                targetVehData.vehicle_key_holders.Add(newKey);

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.vehicle_keys.Add(newKey);
                    dbContext.SaveChanges();
                }

                saveVehicleData(targetVeh, targetVehData);

                string prefixToPlayer = ChatUtils.Success + "You gave ";
                string suffixToPlayer = " a copy of your vehicle's keys.";
                string prefixFromPlayer = ChatUtils.info + "You were given a copy of ";
                string suffixFromPlayer = "'s vehicle's keys";

                ChatUtils.sendWithNickName(player, playerFindPlayer, prefixToPlayer, suffixToPlayer);
                ChatUtils.sendWithNickName(playerFindPlayer, player, prefixFromPlayer, suffixFromPlayer);
            }
        }

        [Command("removekeys", "~y~Use:~w~ /removekeys [nameOrId]")]
        public void removeVehicleKeys(Player player, string nameOrId)
        {
            DbCharacter playerCharData = PlayersData.getPlayerCharacterData(player);
            if (playerCharData == null) return;

            if(!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);
            if(findPlayer == null || findPlayer != null && Vector3.Distance(player.Position, findPlayer.Position) > 6)
            {
                CommandUtils.errorSay(player, "Player couldn't be found. (Are you within distance?)");
                return;
            }

            if(!findPlayer.IsInVehicle)
            {
                CommandUtils.errorSay(player, "Target must be in the same vehicle as you.");
                return;
            }
            
            DbCharacter findPlayerData = PlayersData.getPlayerCharacterData(findPlayer);
            if (findPlayerData == null) return;
            
            Vehicle targetVeh = player.Vehicle;
            DbVehicle targetVehData = getVehicleData(targetVeh);
            if (targetVeh == null) return;

            if(playerCharData.character_id != targetVehData.owner_id)
            {
                CommandUtils.errorSay(player, "You must own this vehicle to remove a players access to it.");
                return;
            }

            VehicleKey checkIfExists = targetVehData.vehicle_key_holders
                .Where(keyHolder => keyHolder.target_character_id == findPlayerData.character_id && keyHolder.vehicle_id == targetVehData.vehicle_id)
                .FirstOrDefault();

            if(checkIfExists == null)
            {
                CommandUtils.errorSay(player, "This player doesn't have keys to this vehicle.");
                return;
            }

            targetVehData.vehicle_key_holders.Remove(checkIfExists);

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.vehicle_keys.Remove(checkIfExists);
                dbContext.SaveChanges();
            }

            saveVehicleData(targetVeh, targetVehData);

            string prefixToPlayer = ChatUtils.Success + "You removed ";
            string suffixToPlayer = " access to your vehicle.";
            string prefixFromPlayer = ChatUtils.info + "Your keys for ";
            string suffixFromPlayer = "'s vehicle was revoked";

            ChatUtils.sendWithNickName(player, findPlayer, prefixToPlayer, suffixToPlayer);
            ChatUtils.sendWithNickName(findPlayer, player, prefixFromPlayer, suffixFromPlayer);
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

        public static void closeAllWindows(Vehicle vehicle)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);
            if (vehicleData != null)
            {
                for (int i = 0; i < vehicleData.vehicle_windows.Length; i++)
                {
                    vehicleData.vehicle_windows[i] = false;
                }

                saveVehicleData(vehicle, vehicleData);
            }
        }

        public static void setVehicleDirtLevel(Vehicle vehicle, int dirtLevel)
        {
            DbVehicle vehicleData = getVehicleData(vehicle);

            if(vehicleData != null)
            {
                vehicleData.dirt_level = dirtLevel;
                saveVehicleData(vehicle, vehicleData);
            }
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

            DbVehicle vehicleData = getVehicleData(vehicle);

            if(vehicleData == null || vehicle.Locked) return;

            vehicleData.vehicle_doors[boneTargetId] = !vehicleData.vehicle_doors[boneTargetId];

            saveVehicleData(vehicle, vehicleData);
        }

        [RemoteEvent("server:toggleEngine")]
        public void handleToggleEngine(Player player)
        {
            if (!player.IsInVehicle) return;

            if (player.VehicleSeat != 0) return;

            DbVehicle vehicleData = getVehicleData(player.Vehicle);

            if(vehicleData == null) return;

            vehicleData.engine_status = !vehicleData.engine_status;

            uiHandling.sendNotification(player, "You " + (vehicleData.engine_status ? "started" : " turned off") + " this vehicle's engine.");

            saveVehicleData(player.Vehicle, vehicleData);
        }

        [RemoteEvent("server:toggleIndication")]
        public void toggleVehicleIndicator(Player player, int indicationId)
        {
            if (!player.IsInVehicle) return;

            DbVehicle vehicleData = getVehicleData(player.Vehicle);

            if (vehicleData == null || player.VehicleSeat != 0) return;

            vehicleData.indicator_status = indicationId;
            saveVehicleData(player.Vehicle, vehicleData);
        }

        [RemoteEvent("server:toggleSiren")]
        public void toggleVehicleSiren(Player player)
        {
            if (!player.IsInVehicle) return;

            DbVehicle vehicleData = getVehicleData(player.Vehicle);

            if (vehicleData == null || player.VehicleSeat != 0) return;

            vehicleData.vehicle_siren = !vehicleData.vehicle_siren;

            string sendText = "Toggled vehicle siren " + (vehicleData.vehicle_siren ? "off" : "on");

            uiHandling.sendNotification(player, sendText);

            saveVehicleData(player.Vehicle, vehicleData);
        }

        [Command("vw", "~y~Use: ~w~/vw [window]", Alias = "vehiclewindow")]
        public void vehicleWindows(Player player, int vehicleIndex)
        {
            if(!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            DbVehicle vehicleData = getVehicleData(player.Vehicle);

            if(vehicleData == null) return;

            if( !(player.VehicleSeat == 0 || player.VehicleSeat == 1) )
            {
                CommandUtils.errorSay(player, "You must be the driver or front passenger to use this command.");
                return;
            }

            if(vehicleIndex > vehicleData.vehicle_windows.Length || vehicleIndex < 0)
            {
                CommandUtils.errorSay(player, "Enter a valid window to roll up or down.");
                return;
            }

            vehicleData.vehicle_windows[vehicleIndex] = !vehicleData.vehicle_windows[vehicleIndex];

            string openCloseTextNotif = "You " + (vehicleData.vehicle_windows[vehicleIndex] ? "opened" : "closed") + " this vehicle's window.";

            uiHandling.sendNotification(player, openCloseTextNotif);

            saveVehicleData(player.Vehicle, vehicleData);
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
            
            if(!vehicleData.engine_status && player.VehicleSeat == 0)
            {
                uiHandling.sendNotification(player, "~w~Use ~y~Y~w~ to start the engine.", false);
            }
        }

        [RemoteEvent("server:updateVehicleDistance")]
        public void updateVehicleDistance(Player player, string getOldDist)
        {
            if (!player.IsInVehicle || getOldDist == null) return;

            Vehicle playerVehicle = player.Vehicle;
            DbVehicle playerVehicleData = getVehicleData(playerVehicle);
            if (playerVehicleData == null) return;

            Vector3 oldDist = JsonConvert.DeserializeObject<Vector3>(getOldDist);
            if (oldDist == null) return;

            float dist = Vector3.Distance(oldDist, player.Vehicle.Position);

            playerVehicleData.vehicle_distance += (ulong)dist;

            saveVehicleData(playerVehicle, playerVehicleData);
        }

        [RemoteEvent("server:updateVehicleFuel")]
        public void removeVehicleFuel(Player player, double vehicleSpeed)
        {
            Vehicle vehicle = player.Vehicle;
            if (vehicle == null) return;

            User userData = PlayersData.getPlayerAccountData(player);
            if (userData != null && userData.adminDuty) return;

            DbVehicle vehicleData = getVehicleData(player.Vehicle);

            if (!vehicleData.engine_status) return;

            Dictionary<int, double> fuelMultipliers = FuelMultipliers.fuelMultipliers;

            bool completedRemoval = false;

            foreach(KeyValuePair<int, double> multiplier in  fuelMultipliers)
            {
                if(multiplier.Key == player.Vehicle.Class)
                {
                    vehicleData.vehicle_fuel -= (vehicleSpeed * multiplier.Value);

                    if (vehicleData.vehicle_fuel <= 0)
                    {
                        vehicleData.vehicle_fuel = 0;
                    }

                    completedRemoval = true;
                }
            }

            if(completedRemoval)
            {
                saveVehicleData(vehicle, vehicleData);
            }
        }

        [RemoteEvent("server:toggleEmergencyLights")]
        public void toggleEmergencyLights(Player player)
        {
            if(!player.IsInVehicle) return;

            Vehicle targetVeh = player.Vehicle;
            DbVehicle targetVehData = getVehicleData(targetVeh);

            if(targetVehData != null)
            {
                targetVehData.emergency_lights = !targetVehData.emergency_lights;

                string text = $"You toggled {(targetVehData.emergency_lights ? "on" : "off")} your emergency lights.";
                uiHandling.sendNotification(player, text);
                saveVehicleData(targetVeh, targetVehData);
            }
        }
    }
}
