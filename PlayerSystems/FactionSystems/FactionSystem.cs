﻿using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.VehicleParking;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Query;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Timers;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionSystem : Script
    {
        public delegate void FactionSystemEventsHandler(Player player, Factions faction);

        #region Event Handlers
        public static event FactionSystemEventsHandler onDutyAreaPress;
        public static event FactionSystemEventsHandler vehicleAreaPress;
        #endregion

        public static readonly Vector3 vehicleImportArea = new Vector3(858.7, -3202.6, 6.0);
        public static readonly Vector3 spawnVehicleArea = new Vector3(854.0, -3218.3, 5.9);
        public static readonly float spawnVehicleRot = -88.8f;

        public static string[] factionColours = new string[] {
            "",
            "#5998ff",
            "#7bb089",
            "#f25130",
            "#baffe6"
        };

        public static Dictionary<Factions, List<Vector3>> onDutyAreas = new Dictionary<Factions, List<Vector3>>
        {
            {
                Factions.LSPD, new List<Vector3>
                {
                    new Vector3(452.0, -987.0, 30.7)
                }
            }
        };
        
        public static Dictionary<Factions, List<FactionVehSpawn>> vehicleSpawnPoints = new Dictionary<Factions, List<FactionVehSpawn>>
        {
            {
                Factions.LSPD, new List<FactionVehSpawn>
                {
                    new FactionVehSpawn
                    {
                        garageId = 1,
                        vehicleRot = 90.6f,
                        spawnPos = new Vector3(416.7, -1025.0, 29.1)
                    },
                    new FactionVehSpawn
                    {
                        garageId = 2,
                        vehicleRot = 57.4f,
                        spawnPos = new Vector3(407.4, -997.3, 29.3)
                    },
                    new FactionVehSpawn
                    {
                        garageId = 3,
                        vehicleRot = 92.1f,
                        spawnPos = new Vector3(449.1, -980.9, 43.7)
                    }
                }
            }
        };

        public static List<FactionBlip> factionBlips = new List<FactionBlip>
        {
            new FactionBlip
            {
                blipColour = 4,
                blipType = 60,
                blipName = "Mission Row - PD",
                blipPos =  new Vector3(451.8, -981.4, 43.7)
            },
            new FactionBlip
            {
                blipColour = 4,
                blipType = 459,
                blipName = "Weazel News",
                blipPos = new Vector3(-583.5, -924.9, 36.8)
            },
            new FactionBlip
            {
                blipColour = 11,
                blipType = 60,
                blipName = "San Andreas Sherrifs Department",
                blipPos = new Vector3(-446.3, 6007.9, 40.4)
            }
        };

        public FactionSystem()
        {
            KeyPressEvents.keyPress_Y += handleKeyInteraction;
            Main.resourceStart += initFactionRanks;
            VehicleParking.onVehicleUnpark += handleFactionUnpark;
            VehicleParking.onVehicleUnpark += handleVehicleImport;
            VehicleSystem.vehiclePark += handleTrackerDestroyed;
            VehicleSystem.vehicleDeath += handleTrackerDestroyed;

            MarkersAndLabels.setPlaceMarker(vehicleImportArea);
            MarkersAndLabels.setTextLabel(vehicleImportArea, "Vehicle Import Area\nUse ~y~Y~w~ to interact", 5f);
            NAPI.Marker.CreateMarker(36, vehicleImportArea, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
            NAPI.Blip.CreateBlip(524, vehicleImportArea, 1f, 17, "Vehicle Imports", 255, 1f, true, 0, 0);

            foreach (FactionBlip blip in factionBlips)
            {
                NAPI.Blip.CreateBlip(blip.blipType, blip.blipPos, 1f, blip.blipColour, blip.blipName, 255, 1f, true, 0, 0);
            }

            foreach (KeyValuePair<Factions, List<Vector3>> area in onDutyAreas)
            {
                area.Value.ForEach(marker =>
                {
                    MarkersAndLabels.setTextLabel(marker, "Duty Point\nUse ~y~Y~w~ to interact", 5f);
                    MarkersAndLabels.setPlaceMarker(marker, 0);
                });
            }

            foreach (KeyValuePair<Factions, List<FactionVehSpawn>> point in vehicleSpawnPoints)
            {
                point.Value.ForEach(marker =>
                {
                    MarkersAndLabels.setTextLabel(marker.spawnPos, "Vehicle Point\nUse ~y~Y~w~ to interact", 5f);
                    MarkersAndLabels.setPlaceMarker(marker.spawnPos, 0);
                    NAPI.Marker.CreateMarker(36, marker.spawnPos, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
                });
            }

            NAPI.Task.Run(() =>
            {
                Timer updateTracking = new Timer
                {
                    AutoReset = true,
                    Enabled = true,
                    Interval = 700
                };

                updateTracking.Elapsed += handleVehicleTracking;
            });
        }

        private static void initFactionRanks()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                List<Faction> factions = dbContext.factions.ToList();

                int currentFactions = Enum.GetNames(typeof(Factions)).Length;

                if (factions.Count < currentFactions)
                {
                    string[] defaultVehicles = new string[]
                    {
                        "pbuffalo4",
                        "dnscout"
                    };

                    factions.ForEach(fac =>
                    {
                        dbContext.factions.Remove(fac);
                        dbContext.SaveChanges();
                    });

                    for (int i = 0; i < currentFactions; i++)
                    {
                        dbContext.factions.Add(new Faction
                        {
                            CreatedDate = DateTime.Now,
                            faction_allowed_vehicles = JsonConvert.SerializeObject(defaultVehicles),
                            faction_name = getFactionName(i),
                            owner_id = -1,
                        });
                        dbContext.SaveChanges();
                    }
                }
            }
        }

        #region Global Methods
        private void handleKeyInteraction(Player player)
        {
            foreach (KeyValuePair<Factions, List<Vector3>> area in onDutyAreas)
            {
                area.Value.ForEach(spot =>
                {
                    if (player.checkIsWithinCoord(spot, 2f) && player.isPartOfFaction(area.Key))
                    {
                        handleDutyArea(player, area.Key);
                    }
                });
            }

            foreach (KeyValuePair<Factions, List<FactionVehSpawn>> point in vehicleSpawnPoints)
            {
                point.Value.ForEach(spot =>
                {
                    if (player.checkIsWithinCoord(spot.spawnPos, 5f) && player.isPartOfFaction(point.Key, true))
                    {
                        handleVehiclePoint(player, point.Key, spot.garageId);
                    }
                });
            }

            if (player.checkIsWithinCoord(vehicleImportArea, 2f)) handleVehicleImportArea(player);
        }

        public static void handleDutyArea(Player player, Factions targetFaction)
        {
            if (!player.hasFactionPermission(targetFaction, GeneralRankPerms.CanGoOnDuty)) return;

            DbCharacter character = player.getPlayerCharacterData();

            List<DbFactionRank> ranks = player.getFactionRanks();

            int targetRankId = -1;

            ranks.ForEach(rank =>
            {
                if(rank.faction == (int)targetFaction)
                {
                    targetRankId = rank.rankId;
                }
            });

            if (targetRankId == -1) return;

            RankPermissions permissions = getAllowedItemsFromRank(targetRankId);

            if (permissions == null) return;

            List<FactionUniform> allowedUniforms = new List<FactionUniform>();

            foreach (int uniformId in permissions.uniforms)
            {
                FactionUniform findUniform = FactionUniforms.factionUniforms
                    .Where(uniform => uniform.uniformId == uniformId)
                    .FirstOrDefault();

                if(findUniform != null)
                {
                    allowedUniforms.Add(findUniform);
                }
            }

            uiHandling.resetMutationPusher(player, MutationKeys.FactionUniforms);

            uiHandling.pushRouterToClient(player, Browsers.FactionUniforms, true);

            allowedUniforms.ForEach(uniform =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.FactionUniforms, uniform);
            });
        }

        public static void handleVehiclePoint(Player player, Factions targetFaction, int garageId)
        {
            if (!player.hasFactionPermission(targetFaction, GeneralRankPerms.ViewFactionParking)) return;

            List<DbVehicle> parkedVehicles = getParkedFactionVehicles(targetFaction, garageId);

            if(parkedVehicles.Count == 0)
            {
                uiHandling.sendPushNotifError(player, "There are no faction vehicles in this vehicle point.", 6600);
                return;
            }

            uiHandling.resetMutationPusher(player, MutationKeys.ParkedVehicles);
            uiHandling.pushRouterToClient(player, Browsers.Parking, true);

            parkedVehicles.ForEach(veh =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.ParkedVehicles, veh);
            });
        }

        public static void handleVehicleImportArea(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            Factions playerFaction = (Factions)character.faction_duty_status;

            if (!player.hasFactionPermission(playerFaction, GeneralRankPerms.ImportVehicles)) return;

            List<string> vehicles = loadFactionVehicles(playerFaction);

            uiHandling.resetMutationPusher(player, MutationKeys.ParkedVehicles);
            uiHandling.pushRouterToClient(player, Browsers.Parking, true);

            vehicles.ForEach(veh =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.ParkedVehicles, new DbVehicle
                {
                    vehicle_fuel = 100,
                    CreatedDate = DateTime.Now,
                    vehicle_id = vehicles.IndexOf(veh),
                    vehicle_display_name = VehicleSystem.getVehiclesDisplayNameAndClass(veh).Item1,
                    vehicle_name = veh
                });
            });
        }

        public static RankPermissions getAllowedItemsFromRank(int factionRankId)
        {
            RankPermissions permissions = null;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                FactionRank rank = dbContext.faction_ranks.Find(factionRankId);

                if(rank != null)
                {
                    permissions = new RankPermissions
                    {
                        general = JsonConvert.DeserializeObject<int[]>(rank.rank_permissions),
                        uniforms = JsonConvert.DeserializeObject<int[]>(rank.allowed_uniforms),
                        vehicles = JsonConvert.DeserializeObject<string[]>(rank.allowed_vehicles),
                        weapons = JsonConvert.DeserializeObject<string[]>(rank.allowed_weapons)
                    };
                }
            }

            return permissions;
        }

        public static List<string> loadFactionVehicles(Factions faction)
        {
            List<string> vehicles = new List<string>();

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                Faction findFaction = dbContext.factions
                    .Where(fac => fac.faction_name == Enum.GetNames(typeof(Factions))[(int)faction])
                    .FirstOrDefault();

                vehicles = JsonConvert.DeserializeObject<List<string>>(findFaction.faction_allowed_vehicles);
            }

            return vehicles;
        }

        public static List<DbVehicle> getParkedFactionVehicles(Factions faction, int garageId)
        {
            List<DbVehicle> vehicles = new List<DbVehicle>();

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                vehicles = dbContext.vehicles
                    .Where(veh => veh.faction_owner_id == (int)faction && 
                    veh.vehicle_garage_id == garageId &&
                    veh.vehicle_dimension == VehicleDimensions.Garage)
                    .ToList();
            }

            return vehicles;
        }

        public static void loadFactionUniform(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if(character != null)
            {
                FactionUniform findUniform = FactionUniforms.factionUniforms
                    .Where(fac => (int)fac.faction == character.faction_duty_status && fac.uniformId == character.faction_duty_uniform)
                    .FirstOrDefault();

                if(findUniform != null)
                {
                    character.characterClothing = findUniform.uniform;
                    player.setPlayerCharacterData(character, true);

                    ChatUtils.formatConsolePrint($"Loaded faction uniform for {character.character_name}.");
                }
            }
        }

        public static List<FactionUniform> getAllUniformsForFaction(Factions faction) 
            => FactionUniforms.factionUniforms
            .Where(uniform => uniform.faction == faction)
            .ToList();

        public static FactionUniform getFactionUniform(int uniformId, Factions targetFaction)
            => FactionUniforms.factionUniforms
            .Where(uniform => uniform.faction == targetFaction && uniform.uniformId == uniformId)
            .FirstOrDefault();

        public static string getFactionName(int faction)
            => Enum.GetNames(typeof(Factions))[faction];
        
        public static (Factions, int) getClosestVehiclePoint(Player player)
        {
            int garageId = -1;
            Factions faction = Factions.None;

            foreach(KeyValuePair<Factions, List<FactionVehSpawn>> point in vehicleSpawnPoints)
            {
                point.Value.ForEach(spot =>
                {
                    if (player.checkIsWithinCoord(spot.spawnPos, 2f) && player.isPartOfFaction(point.Key, true))
                    {
                        faction = point.Key;
                        garageId = spot.garageId;
                    }
                });
            }

            return (faction, garageId);
        }

        public static void handleFactionUnpark(Player player, int vehicleId)
        {
            DbVehicle targetVehicle = null;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                targetVehicle = dbContext.vehicles.
                    Where(veh => veh.vehicle_dimension == VehicleDimensions.Garage &&
                    veh.faction_owner_id != (int)Factions.None &&
                    veh.vehicle_id == vehicleId)
                    .FirstOrDefault();
            }

            if(targetVehicle != null)
            {
                KeyValuePair<Factions, List<FactionVehSpawn>> point = vehicleSpawnPoints
                    .Where(spawnPoint => (int)spawnPoint.Key == targetVehicle.faction_owner_id)
                    .FirstOrDefault();

                if (point.Value == null) return;

                FactionVehSpawn spawn = point.Value
                    .Where(p => p.garageId == targetVehicle.vehicle_garage_id)
                    .FirstOrDefault();

                if (spawn == null || spawn != null && Vector3.Distance(player.Position, spawn.spawnPos) > 12) return;

                Vehicle spawnedVehicle = VehicleSystem.spawnVehicle(targetVehicle, spawn.spawnPos);
                player.SetIntoVehicle(spawnedVehicle, 0);
                uiHandling.resetRouter(player);
            }
        }

        public static void handleVehicleImport(Player player, int vehicleId)
        {
            if (!player.checkIsWithinCoord(vehicleImportArea, 2f) || vehicleId == -1) return;

            DbCharacter character = player.getPlayerCharacterData();

            Factions playerFaction = (Factions)character.faction_duty_status;

            List<string> allowedVehicles = loadFactionVehicles(playerFaction);

            if(vehicleId < 0 || vehicleId >= allowedVehicles.Count) return;

            if(VehicleSystem.checkVehInSpot(spawnVehicleArea, 5) != null)
            {
                uiHandling.sendPushNotifError(player, "There is a vehicle blocking the import spot.", 6600);
                return;
            }

            string spawnVehicle = allowedVehicles[vehicleId];

            (Vehicle veh, DbVehicle data) = VehicleSystem.buildVehicle(spawnVehicle, spawnVehicleArea, spawnVehicleRot, -1, 1, 1, "N/A", playerFaction);

            if (veh == null || data == null) return;

            uiHandling.resetRouter(player);
            CommandUtils.successSay(player, $"You have imported a new faction vehicle ({data.vehicle_display_name}) for your faction {playerFaction}.");
            MarkersAndLabels.addBlipForClient(player, 4, "Faction Vehicle", spawnVehicleArea, 2, 10);
        }

        public static void handleTrackerDestroyed(Vehicle veh, DbVehicle data)
        {
            if (data.faction_owner_id == (int)Factions.None) return;

            removeTrackedVehicle(veh.Id);
        }

        public void handleVehicleTracking(object source, ElapsedEventArgs e)
        {
            NAPI.Task.Run(() =>
            {
                NAPI.Pools.GetAllPlayers().ForEach(p =>
                {
                    DbCharacter character = p.getPlayerCharacterData();

                    if (character == null) return;

                    int factionDuty = character.faction_duty_status;

                    List<TrackVehicle> vehicles = new List<TrackVehicle>();

                    NAPI.Pools.GetAllVehicles().ForEach(veh =>
                    {
                        DbVehicle vehicleData = veh.getData();

                        if (vehicleData != null && vehicleData.faction_owner_id == factionDuty)
                        {
                            int blipType = 672;

                            switch(vehicleData.vehicle_class_id)
                            {
                                case (int)VehicleClasses.Helicopters: {
                                        blipType = 43;
                                        break;
                                }
                                case (int)VehicleClasses.Sports:
                                {
                                        blipType = 724;
                                        break;        
                                }
                                case (int)VehicleClasses.Boats:
                                {
                                        blipType = 427;
                                        break;        
                                }
                            }

                            vehicles.Add(new TrackVehicle
                            {
                                numberPlate = veh.NumberPlate,
                                position = veh.Position,
                                remoteId = veh.Id,
                                heading = veh.Heading,
                                blipType = blipType
                            });
                        }
                    });

                    updateTracking(p, JsonConvert.SerializeObject(vehicles));
                });
            });
        }

        public static void updateTracking(Player player, string data) 
            => player.TriggerEvent("c::faction:tracking:update", data);
        
        public static void clearTracker(Player player) 
            => player.TriggerEvent("c::faction:tracking:clear");
        
        public static void removeTrackedVehicle(int vehicleId)
            => NAPI.ClientEvent.TriggerClientEventForAll("c::faction:tracking:remove", vehicleId);

        #endregion

        #region Remote Events
        [RemoteEvent("server:factionSystem:duty")]
        public void beginFactionDuty(Player player, int uniformId)
        {
            DbCharacter character = player.getPlayerCharacterData();
            Factions targetFaction = Factions.None;

            if (character == null) return;

            foreach (KeyValuePair<Factions, List<Vector3>> area in onDutyAreas)
            {
                area.Value.ForEach(spot =>
                {
                    if (player.checkIsWithinCoord(spot, 2f) && player.isPartOfFaction(area.Key))
                    {
                        targetFaction = area.Key;
                    }
                });
            }

            if (targetFaction == Factions.None) return;

            if(character.faction_duty_status == (int)targetFaction)
            {
                uiHandling.sendPushNotifError(player, "Your already on duty. Head off duty to change uniform.", 6600);
                return;
            }

            FactionUniform uniform = getFactionUniform(uniformId, targetFaction);

            if(uniform == null) return;

            player.setFactionUniform(uniform);
            player.setFactionDuty(targetFaction);

            FactionRank rank = player.getFactionRankViaFaction(targetFaction);

            uiHandling.sendNotification(player, $"Your now ~g~on duty~w~ for faction {targetFaction}. As a {rank.rank_name}", false);
            uiHandling.resetRouter(player);
        }

        [RemoteEvent("server:factionSystem:dutyEnd")]
        public void endFactionDuty(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            player.setOffFactionDuty();
        }
        #endregion

        #region Commands
        [Command("factionchat", "~y~Use:~w~ /factionchat [faction] [message]", Alias = "f,fc", GreedyArg = true)]
        public void factionChatCommand(Player player, Factions faction, string message)
        {
            List<Factions> factionData = player.getPlayerFactions();
            DbCharacter character = player.getPlayerCharacterData();
            if (character == null) return;

            if(factionData == null || factionData != null && !factionData.Contains(faction))
            {
                CommandUtils.errorSay(player, "You aren't part of this faction.");
                return;
            }

            string factionColour = "!{" + factionColours[(int)faction] + "}";
            string factionMessage = $"[{faction}] {character.character_name} {ChatUtils.grey}says: {factionColour}(({ChatUtils.White} {message} {factionColour}))";

            Dictionary<Player, User> onlineStaff = AdminUtils.gatherStaff();

            foreach(KeyValuePair<Player, User> staff in onlineStaff)
            {
                if((staff.Value.adminDuty || staff.Value.admin_status > (int)AdminRanks.Admin_HeadAdmin) && staff.Key.getPlayerFactions()?.Contains(faction) == null)
                {
                    staff.Key.SendChatMessage(ChatUtils.grey + factionMessage);
                }
            }

            NAPI.Pools.GetAllPlayers().ForEach(targetPlayer =>
            {
                if (targetPlayer.getPlayerFactions()?.Contains(faction) != null)
                {
                    targetPlayer.SendChatMessage(factionColour + factionMessage);
                }
            });

            ChatUtils.formatConsolePrint($"[F] [{faction}] {character.character_name} says: {message}", ConsoleColor.Magenta);
        }

        [Command("fpark", "~y~Use: ~w~/fpark", Alias = "factionpark,fpa")]
        public void factionParkCommand(Player player)
        {
            (Factions faction, int garageId) = getClosestVehiclePoint(player);

            if (garageId == -1 || faction == Factions.None) return;

            if (!player.IsInVehicle)
            {
                CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                return;
            }

            DbVehicle vehicle = player.Vehicle.getData();

            if (vehicle == null) return;

            if (vehicle.faction_owner_id != (int)faction) return;

            if(!player.hasFactionPermission(faction, GeneralRankPerms.ViewFactionParking))
            {
                uiHandling.sendPushNotifError(player, "Your faction rank doesn't have access to this.", 6600);
                return;
            }

            player.Vehicle.parkVehicle(player, garageId);
        }
        #endregion
    }

    public enum GeneralRankPerms
    {
        ImportVehicles,
        ViewFactionParking,
        CanGoOnDuty
    }

    public enum Factions
    {
        None,
        LSPD,
        SASD,
        LSMD,
        Weazel
    }
}
