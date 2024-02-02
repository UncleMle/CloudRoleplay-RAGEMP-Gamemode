using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionSystem : Script
    {
        public delegate void FactionSystemEventsHandler(Player player, Factions faction);

        #region Event Handlers
        public static event FactionSystemEventsHandler onDutyAreaPress;
        public static event FactionSystemEventsHandler vehicleAreaPress;
        #endregion

        public static string[] factionColours = new string[] {
            "",
            "#135DD8",
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
                        vehicleRot = 90.6f,
                        spawnPos = new Vector3(416.7, -1025.0, 29.1)
                    },
                    new FactionVehSpawn
                    {
                        vehicleRot = 57.4f,
                        spawnPos = new Vector3(407.4, -997.3, 29.3)
                    },
                }
            }
        };

        public FactionSystem()
        {
            KeyPressEvents.keyPress_Y += handleKeyInteraction;
            Main.resourceStart += initFactionRanks;

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
                            faction_name = Enum.GetNames(typeof(Factions))[i],
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
                    if (player.checkIsWithinCoord(spot, 2f)) onDutyAreaPress(player, area.Key);
                });
            }

            foreach (KeyValuePair<Factions, List<FactionVehSpawn>> point in vehicleSpawnPoints)
            {
                point.Value.ForEach(spot =>
                {
                    if (player.checkIsWithinCoord(spot.spawnPos, 2f)) vehicleAreaPress(player, point.Key);
                });
            }
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

            int loadedVehicles = vehicles.Count;

            if(loadedVehicles > 0)
            {
                ChatUtils.formatConsolePrint($"Loaded {loadedVehicles} allowed vehicles for faction {faction}", ConsoleColor.Green);
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

        #endregion

        #region Commands
        [Command("factionchat", "~y~Use:~w~ /factionchat [faction] [message]", Alias = "f,fc", GreedyArg = true)]
        public void factionChatCommand(Player player, Factions faction, string message)
        {
            List<Factions> factionData = player.getPlayerFactions();
            DbCharacter character = player.getPlayerCharacterData();
            if (character == null) return;

            if(factionData == null)
            {
                CommandUtils.errorSay(player, "You aren't part of any faction.");
                return;
            }

            if(!factionData.Contains(faction))
            {
                CommandUtils.errorSay(player, "You aren't part of this faction.");
                return;
            }

            string factionColour = "!{" + factionColours[(int)faction] + "}";
            string factionMessage = $"[F] ({faction}) {character.character_name} {ChatUtils.grey}says: {factionColour}(({ChatUtils.White} {message} {factionColour}))";

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
        #endregion
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
