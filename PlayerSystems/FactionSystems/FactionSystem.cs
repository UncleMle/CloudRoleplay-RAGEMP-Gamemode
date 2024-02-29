using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.FactionSystems.DCCFaction;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.VehicleParking;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.World.TimeWeather;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Storage.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http.Headers;
using System.Reflection.Metadata.Ecma335;
using System.Runtime.InteropServices;
using System.Text;
using System.Timers;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionSystem : Script
    {
        public delegate void FactionSystemEventsHandler(Player player, Factions faction);
        public delegate void DispatchEventsHandler(int characterId, DispatchCall call);

        #region Event Handlers
        public static event FactionSystemEventsHandler onDutyAreaPress;
        public static event FactionSystemEventsHandler vehicleAreaPress;

        public static event DispatchEventsHandler dispatchCallCreated;
        #endregion

        public static readonly List<Vector3> vehicleImportAreas = new List<Vector3> {
            new Vector3(858.7, -3202.6, 6.0),
            new Vector3(-55.0, 6392.5, 31.6)
        };
        public static readonly List<Vector3> vehicleSpawnAreas = new List<Vector3>
        {
            new Vector3(854.0, -3218.3, 5.9),
            new Vector3(-61.8, 6397.4, 31.5)
        };

        public static readonly string _dispatchMenuOpen = "factionSystem:dispatch:menu:state";
        public static readonly float spawnVehicleRot = -88.8f;
        public static readonly float maxInviteRange = 5.5f;

        public static Dictionary<int, DispatchCall> dispatchCalls = new Dictionary<int, DispatchCall>();

        public class FactionCommand : CommandConditionAttribute
        {
            bool _checkForDuty;

            public FactionCommand(bool checkForDuty)
            {
                _checkForDuty = checkForDuty;
            }

            public override bool Check(Player player, string cmdName, string cmdText)
            {
                DbCharacter character = player.getPlayerCharacterData();

                if (character == null) return false;

                if(player.getPlayerFactions().Count == 0)
                {
                    CommandUtils.errorSay(player, $"You must be part of a faction to use this command.");
                    return false;
                }

                if (_checkForDuty && character.faction_duty_status == -1)
                {
                    CommandUtils.errorSay(player, "You must be on faction duty to use this command.");
                    return false;
                }

                return true;
            }
        }

        public static string[] factionColours = new string[] {
            "", // Factions.None
            "#5998ff", // Factions.LSPD
            "#7bb089", // Factions.SASD
            "#f25130", // Factions.LSMD
            "#baffe6", // Factions.Weazel_News
            "#878787", // Factions.Bayview
            "#878787", // Factions.LS_Customs
            "#f0cb58" // Factions.DCC
        };

        public static int[] trackerBlipColours = new int[]
        {
            0, 3, 43, 59, 51, 62, 62, 60
        };

        public static Factions[] emergencyFactions = new Factions[]
        {
            Factions.LSPD,
            Factions.LSMD,
            Factions.SASD
        };

        public static Dictionary<Factions, List<Vector3>> onDutyAreas = new Dictionary<Factions, List<Vector3>>
        {
            {
                Factions.LSPD, new List<Vector3>
                {
                    new Vector3(452.0, -987.0, 30.7)
                }
            },
            {
                Factions.SASD, new List<Vector3>
                {
                    new Vector3(-442.4, 6011.9, 31.7)
                }
            },
            {
                Factions.Weazel_News, new List<Vector3>
                {
                    new Vector3(-598.3, -930.0, 23.9)
                }
            },
            {
                Factions.LSMD, new List<Vector3>
                {
                    new Vector3(-507.3, -349.9, 35.3),
                    new Vector3(355.5, -596.5, 28.8),
                    new Vector3(299.2, -584.7, 43.3),
                    new Vector3(389.9, -1432.9, 29.4),
                    new Vector3(-366.7, 6103.7, 35.4)
                }
            },
            {
                Factions.Bayview, new List<Vector3>
                {
                    new Vector3(119.0, 6640.0, 31.9)
                }
            },
            {
                Factions.LS_Customs, new List<Vector3>
                {
                    new Vector3(-354.5, -128.2, 39.4)
                }
            },
            {
                Factions.DCC, new List<Vector3>
                {
                    new Vector3(894.9, -179.1, 74.7)
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
                    },
                    new FactionVehSpawn
                    {
                        garageId = 4,
                        vehicleRot = -91.9f,
                        spawnPos = new Vector3(481.6, -982.6, 41.0)
                    }
                }
            },
            {
                Factions.SASD, new List<FactionVehSpawn>
                {
                    new FactionVehSpawn
                    {
                        garageId = 1,
                        vehicleRot = -50.3f,
                        spawnPos = new Vector3(-467.7, 6020.9, 31.3)
                    },
                    new FactionVehSpawn
                    {
                        garageId = 2,
                        vehicleRot = -41.7f,
                        spawnPos = new Vector3(-475.3, 5988.5, 31.3)
                    }
                }
            },
            {
                Factions.Weazel_News, new List<FactionVehSpawn>
                {
                    new FactionVehSpawn
                    {
                        garageId = 1,
                        vehicleRot = -165.4f, 
                        spawnPos = new Vector3(-551.5, -894.4, 24.7)
                    },
                    new FactionVehSpawn
                    {
                        garageId = 2,
                        vehicleRot = 85.4f,
                        spawnPos = new Vector3(-583.5, -930.5, 36.8)
                    }
                }
            },
            {
                Factions.Bayview , new List<FactionVehSpawn>
                {
                    new FactionVehSpawn
                    {
                        garageId = 1,
                        vehicleRot = -93.0f, 
                        spawnPos = new Vector3(114.7, 6606.8, 31.9)
                    }
                }
            },
            {
                Factions.LS_Customs, new List<FactionVehSpawn>
                {
                    new FactionVehSpawn
                    {
                        garageId = 1,
                        vehicleRot = 69.8f, 
                        spawnPos = new Vector3(-371.4, -107.6, 38.7)
                    }
                }
            },
            {
                Factions.DCC, new List<FactionVehSpawn>
                {
                    new FactionVehSpawn
                    {
                        garageId = 1,
                        vehicleRot = -122.9f, 
                        spawnPos = new Vector3(908.3, -176.5, 74.2)
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
            },
            new FactionBlip
            {
                blipColour = 60,
                blipType = 198,
                blipName = "Downtown Cab Co",
                blipPos = new Vector3(899.4, -159.6, 83.0)
            }
        };

        public FactionSystem()
        {
            KeyPressEvents.keyPress_Y += handleKeyInteraction;
            KeyPressEvents.keyPress_F3 += handleDispatchToggle;
            
            Main.resourceStart += initFactionRanks;
            Main.playerDisconnect += removeDispatchCall;

            VehicleParking.onVehicleUnpark += handleFactionUnpark;
            VehicleParking.onVehicleUnpark += handleVehicleImport;
            
            VehicleSystem.vehiclePark += handleTrackerDestroyed;
            VehicleSystem.vehicleDeath += handleTrackerDestroyed;
            
            TimeSystem.realHourPassed += payFactionSalaries;

            vehicleImportAreas.ForEach(area =>
            {
                MarkersAndLabels.setPlaceMarker(area);
                MarkersAndLabels.setTextLabel(area, "Vehicle Import Area\nUse ~y~Y~w~ to interact", 5f);
                NAPI.Marker.CreateMarker(36, area, new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0.5f, new Color(214, 175, 250, 250), false, 0);
                NAPI.Blip.CreateBlip(524, area, 1f, 17, "Vehicle Imports", 255, 1f, true, 0, 0);
            });

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

            Main.resourceStart += () =>
            {
                ChatUtils.startupPrint($"A total of {Enum.GetNames(typeof(Factions)).Length} legal factions were loaded.");
                ChatUtils.startupPrint($"A total of {onDutyAreas.Count} duty points were loaded.");
                ChatUtils.startupPrint($"A total of {vehicleSpawnPoints.Count} vehicle spawn points were loaded.");
                ChatUtils.startupPrint($"A total of {vehicleImportAreas.Count} vehicle import areas were loaded.");
            };
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

            vehicleImportAreas.ForEach(area =>
            {
                if (player.checkIsWithinCoord(area, 5f)) handleVehicleImportArea(player);
            });
        }

        public static void handleDispatchToggle(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null || character != null && character.faction_duty_status == -1) return;

            bool menuState = !player.GetData<bool>(_dispatchMenuOpen);

            player.SetCustomData(_dispatchMenuOpen, menuState);

            toggleDispatchMenu(player, menuState);    
            loadDispatchMenuUi(player, character);
        }

        public static void resyncDispatchMenu()
        {
            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                DbCharacter character = p.getPlayerCharacterData();

                if(p.GetData<bool>(_dispatchMenuOpen) && character != null && character.faction_duty_status != -1)
                {
                    loadDispatchMenuUi(p, character);       
                }
            });
        }

        public static void loadDispatchMenuUi(Player player, DbCharacter character)
        {
            if (character.faction_duty_status == -1) return;

            if (!dispatchCalls.ContainsKey(character.faction_duty_status)) return;

            uiHandling.resetMutationPusher(player, MutationKeys.FactionDispatch);

            foreach (KeyValuePair<int, DispatchCall> call in dispatchCalls)
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.FactionDispatch, call);
            }
        }

        public static void handleDutyArea(Player player, Factions targetFaction)
        {
            if (!player.hasFactionPermission(targetFaction, GeneralRankPerms.CanGoOnDuty)) return;

            DbCharacter character = player.getPlayerCharacterData();

            if(character == null) return;

            if (character.faction_duty_status != -1 && character.faction_duty_status != (int)targetFaction) return;

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

        public static void sendMessageToOndutyFactionMembers(string message, Factions faction)
            => NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                DbCharacter character = p.getPlayerCharacterData();

                if(character != null && character.faction_duty_status == (int)faction)
                {
                    p.SendChatMessage(message);
                }
            });

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

        public static List<Player> getAllOnDutyFactionMembers()
        {
            List<Player> onlineMembers = new List<Player>();

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                DbCharacter character = p.getPlayerCharacterData();

                if (character == null) return;

                if(character.faction_duty_status != -1)
                {
                    onlineMembers.Add(p);
                }
            });

            return onlineMembers;
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
                    vehicle_display_name = veh,
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

                if(findFaction != null)
                {
                    vehicles = JsonConvert.DeserializeObject<List<string>>(findFaction.faction_allowed_vehicles);
                }
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
                    veh.vehicle_parking_lot_id == garageId &&
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
                    character.cachedClothes = character.characterClothing;
                    character.characterClothing = findUniform.uniform;
                    player.setPlayerCharacterData(character, true);
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
            => Enum.GetNames(typeof(Factions))[faction].ToString().Replace("_", " ");

        public static bool hasDispatchCall(Player player)
            => player.getPlayerCharacterData() != null && dispatchCalls.ContainsKey(player.getPlayerCharacterData().character_id);

        public static void removeDispatchCall(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            dispatchCalls.Remove(character.character_id);
        }

        public static void addDispatchCall(Player player, Factions faction, string desc)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null || hasDispatchCall(player)) return;

            dispatchCalls.Add(character.character_id, new DispatchCall
            {
                forFaction = faction,
                callDesc = desc,
                characterName = character.character_name.Replace("_", " "),
                location = player.Position,
                createdAt = CommandUtils.generateUnix()
            });

            sendMessageToOndutyFactionMembers($"{ChatUtils.factions}{character.character_name} makes a new call to dispatch", faction);
            resyncDispatchMenu();
        }

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

            if(targetVehicle != null && vehicleSpawnPoints.ContainsKey((Factions)targetVehicle.faction_owner_id))
            {
                List<FactionVehSpawn> points = vehicleSpawnPoints[(Factions)targetVehicle.faction_owner_id];

                FactionVehSpawn spawn = points
                    .Where(p => p.garageId == targetVehicle.vehicle_parking_lot_id)
                    .FirstOrDefault();

                if (spawn == null || spawn != null && Vector3.Distance(player.Position, spawn.spawnPos) > 12) return;

                Vehicle spawnedVehicle = VehicleSystem.spawnVehicle(targetVehicle, spawn.spawnPos);
                player.SetIntoVehicle(spawnedVehicle, 0);
                uiHandling.resetRouter(player);
            }
        }

        public static void handleVehicleImport(Player player, int vehicleId)
        {
            int isInAreaIdx = -1;

            vehicleImportAreas.ForEach(area =>
            {
                if (player.checkIsWithinCoord(area, 5f)) isInAreaIdx = vehicleImportAreas.IndexOf(area);
            });

            if (isInAreaIdx == -1 || vehicleId == -1) return;

            DbCharacter character = player.getPlayerCharacterData();

            Factions playerFaction = (Factions)character.faction_duty_status;

            List<string> allowedVehicles = loadFactionVehicles(playerFaction);

            if(vehicleId < 0 || vehicleId >= allowedVehicles.Count) return;

            Vector3 spawnPos = vehicleSpawnAreas[isInAreaIdx];

            if (VehicleSystem.checkVehInSpot(spawnPos, 5) != null)
            {
                uiHandling.sendPushNotifError(player, "There is a vehicle blocking the import spot.", 6600);
                return;
            }

            string spawnVehicle = allowedVehicles[vehicleId];

            (Vehicle veh, DbVehicle data) = VehicleSystem.buildVehicle(spawnVehicle, spawnPos, spawnVehicleRot, -1, 1, 1, "N/A", playerFaction);

            if (veh == null || data == null) return;

            uiHandling.resetRouter(player);
            CommandUtils.successSay(player, $"You have imported a new faction vehicle ({data.vehicle_display_name}) for your faction {getFactionName((int)playerFaction)}.");
            MarkersAndLabels.addBlipForClient(player, 4, "Faction Vehicle", spawnPos, 2, 10);
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

                    if(factionDuty == (int)Factions.None) return;

                    List<TrackVehicle> vehicles = new List<TrackVehicle>();

                    NAPI.Pools.GetAllVehicles().ForEach(veh =>
                    {
                        DbVehicle vehicleData = veh.getData();

                        if (vehicleData == null) return;

                        if (vehicleData.faction_owner_id != -1 && vehicleData.faction_owner_id == factionDuty || emergencyFactions.Contains((Factions)factionDuty) && emergencyFactions.Contains((Factions)vehicleData.faction_owner_id))
                        {
                            int blipType = 672;

                            switch((VehicleClasses)vehicleData.vehicle_class_id)
                            {
                                case VehicleClasses.Helicopters: {
                                        blipType = 43;
                                        break;
                                }
                                case VehicleClasses.Sports:
                                {
                                        blipType = 724;
                                        break;        
                                }
                                case VehicleClasses.Boats:
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
                                blipType = blipType,
                                blipColour = trackerBlipColours[vehicleData.faction_owner_id]
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

        public static void trackUnit(Player player, int vehicleId)
            => player.TriggerEvent("c::faction:tracking:trackUnit", vehicleId);

        public static void toggleDispatchMenu(Player player, bool toggle)
            => player.TriggerEvent("c::faction:dispatch:toggle", toggle);

        public static void removeTrackedVehicle(int vehicleId)
            => NAPI.ClientEvent.TriggerClientEventForAll("c::faction:tracking:remove", vehicleId);

        public static void payFactionSalaries()
        {
            List<Player> onDutyFactionMembers = getAllOnDutyFactionMembers();

            onDutyFactionMembers.ForEach(factionMem =>
            {
                DbCharacter character = factionMem.getPlayerCharacterData();

                if (character == null) return;

                Factions faction = (Factions)character.faction_duty_status;

                FactionRank rank = factionMem.getFactionRankViaFaction(faction);

                if (rank == null) return;

                character.salary_amount += rank.rank_salary;
                factionMem.setPlayerCharacterData(character, false, true);

                factionMem.SendChatMessage(ChatUtils.factions + $"You've recieved your salary of {ChatUtils.moneyGreen}${rank.rank_salary.ToString("N0")}{ChatUtils.White} from faction {getFactionName((int)faction)}. As rank {rank.rank_name}.");
            });
        }

        #endregion

        #region Remote Events
        [RemoteEvent("server:factionSystem:duty")]
        public void beginFactionDuty(Player player, int uniformId)
        {
            DbCharacter character = player.getPlayerCharacterData();
            Factions targetFaction = Factions.None;

            if (character == null || character != null && character.faction_duty_status != -1) return;

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
            FactionRank rank = player.setFactionDuty(targetFaction);

            uiHandling.sendNotification(player, $"Your now ~g~on duty~w~ for faction {targetFaction.ToString().Replace("_", " ")}. As a {rank.rank_name.Replace("_", " ")}", false);
            uiHandling.resetRouter(player);
        }

        [RemoteEvent("server:factionSystem:dutyEnd")]
        public void endFactionDuty(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            Factions targetFaction = Factions.None;

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

            if(character.faction_duty_status == (int)targetFaction) player.setOffFactionDuty();
        }

        [RemoteEvent("server:factionSystem:dispatch:answerCall")]
        public void answerDispatchCall(Player player, int key)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null || character.faction_duty_status == -1) return;

            KeyValuePair<int, DispatchCall> call = dispatchCalls
                .Where(k => k.Key == key)
                .FirstOrDefault();

            if (call.Value == null) return;

            if (call.Value.units.Contains(character.character_name)) return;

            call.Value.units.Add(character.character_name);
            resyncDispatchMenu();

            sendMessageToOndutyFactionMembers($"{ChatUtils.factions}{character.character_name} responds to call #{call.Key}.", (Factions)character.faction_duty_status);

            MarkersAndLabels.setClientWaypoint(player, call.Value.location);

            player.SendChatMessage(ChatUtils.info + "The call location has been marked on your GPS.");
        }

        [RemoteEvent("server:factionSystem:dispatch:endCall")]
        public void disposeDispatchCall(Player player, int key)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null || character.faction_duty_status == -1) return;

            KeyValuePair<int, DispatchCall> call = dispatchCalls
                .Where(k => k.Key == key)
                .FirstOrDefault();

            if (call.Value == null) return;

            dispatchCalls.Remove(key);
            resyncDispatchMenu();

            sendMessageToOndutyFactionMembers($"{ChatUtils.factions}{character.character_name} closes a call to dispatch.", (Factions)character.faction_duty_status);
        }
        #endregion

        #region Commands
        [Command("trackunit", "~y~Use: ~w~/trackunit [unit]")]
        public void unitTrackCommand(Player player, string plate)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if(character == null) return;

            int vehicleId = -1;

            NAPI.Pools.GetAllVehicles().ForEach(veh =>
            {
                DbVehicle data = veh.getData();

                if(data != null && data.faction_owner_id == character.faction_duty_status && data.numberplate.Replace("_", " ").ToUpper() == plate.Replace("_", " ").ToUpper())
                {
                    vehicleId = veh.Id;
                } 
            });

            if(vehicleId == -1)
            {
                CommandUtils.errorSay(player, "Unit wasn't found.");
                return;
            }

            if(player.IsInVehicle)
            {
                Player frontPassenger = null;

                NAPI.Pools.GetAllPlayers().ForEach(p =>
                {
                    if(p.IsInVehicle && p.Vehicle.Equals(player.Vehicle) && p.VehicleSeat == 1)
                    {
                        DbCharacter pasChar = p.getPlayerCharacterData();

                        if (pasChar == null || pasChar != null && pasChar.faction_duty_status != character.faction_duty_status) return;

                        frontPassenger = p;
                    }
                });

                if(frontPassenger != null)
                {
                    trackUnit(frontPassenger, vehicleId);
                }

            }

            trackUnit(player, vehicleId);
        }

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

        [Command("finvite", "~y~Use: /finvite")]
        public void factionInviteCommand(Player player, string nameOrId)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            if(character.faction_duty_status == -1)
            {
                CommandUtils.errorSay(player, "You must be on faction duty to use this command.");
                return;
            }

            Factions playerFaction = (Factions)character.faction_duty_status;

            if (!player.hasFactionPermission(playerFaction, GeneralRankPerms.CanInviteMembers))
            {
                CommandUtils.errorSay(player, "You don't have permission to do this.");
                return;
            }

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if(findPlayer == null || findPlayer != null && Vector3.Distance(player.Position, findPlayer.Position) > maxInviteRange)
            {
                CommandUtils.errorSay(player, "Player couldn't be found. (Are you within distance?)");
                return;
            }

            if(findPlayer.isPartOfFaction(playerFaction))
            {
                CommandUtils.errorSay(player, "Player is already a part of this faction.");
                return;
            }

            findPlayer.addPlayerFaction(playerFaction);

            findPlayer.SendChatMessage(ChatUtils.info + $"You have been added to the faction {getFactionName((int)playerFaction)} by {character.character_name}.");
        }

        [FactionCommand(true)]
        [Command("salary", "~y~Use:~w~ /salary")]
        public void factionSalaryCommand(Player player)
        {
            Factions faction = (Factions)player.getPlayerCharacterData().faction_duty_status;

            FactionRank rank = player.getFactionRankViaFaction(faction);

            if (rank == null) return;

            int timeRemaining = TimeSystem.getMinuteDifferenceToHour();

            player.SendChatMessage(ChatUtils.CloudBlue + "------------------------------------");
            player.SendChatMessage($"[Faction] {getFactionName((int)faction)} [Rank] {rank.rank_name.Replace("_", " ")}");
            player.SendChatMessage($"[Salary] {ChatUtils.moneyGreen}${rank.rank_salary.ToString("N0")}{ChatUtils.White} [Next Paycheck] {ChatUtils.moneyGreen}{timeRemaining} {(timeRemaining == 1 ? "minute" : "minutes")}{ChatUtils.White}");
            player.SendChatMessage(ChatUtils.CloudBlue + "------------------------------------");
        }

        [Command("cancelcall", "~y~Use: ~w~/cancelcall")]
        public void cancelTaxiServiceCommand(Player player)
        {
            if(!hasDispatchCall(player))
            {
                CommandUtils.errorSay(player, "You don't have a pending call to dispatch.");
                return;
            }

            removeDispatchCall(player);
            CommandUtils.successSay(player, "You have remove your call to dispatch.");
        }
        #endregion
    }

    public enum GeneralRankPerms
    {
        ImportVehicles,
        ViewFactionParking,
        CanGoOnDuty,
        CanInviteMembers
    }

    public enum Factions
    {
        None,
        LSPD,
        SASD,
        LSMD,
        Weazel_News,
        Bayview,
        LS_Customs,
        DCC
    }
}
