using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.DeathSystem;
using CloudRP.PlayerSystems.DMV;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;

namespace CloudRP.PlayerSystems.Jobs
{
    public class FreelanceJobSystem : Script
    {
        public delegate void FreelanceJobSystemEventsHandler(Player player, FreeLanceJobData job);
        public static event FreelanceJobSystemEventsHandler quitJob;
        public static readonly string _FreelanceJobDataIdentifier = "FreeLanceJobData";
        public static readonly string _FreelanceJobVehicleDataIdentifier = "FreeLanceJobVehicleData";
        
        public FreelanceJobSystem()
        {
            DeathEvent.onDeath += (player) =>
            {
                if(player.getFreelanceJobData() != null)
                {
                    deleteFreeLanceVehs(player, true);
                    MarkersAndLabels.removeClientBlip(player);
                }
            };

            Commands.loggingOut += (Player player, DbCharacter character) =>
            {
                if(player.getFreelanceJobData() != null)
                {
                    deleteFreeLanceVehs(player);
                }
            };
        }

        #region Global Methods
        public static void handleVehicleDestroyed(Vehicle vehicle)
        {
            FreeLanceJobVehicleData vehicleData = vehicle.getFreelanceJobData();
            if (vehicleData != null)
            {
                NAPI.Pools.GetAllPlayers().ForEach(p =>
                {
                    DbCharacter playerData = p.getPlayerCharacterData();

                    if(p.getPlayerCharacterData() != null && playerData != null && p.getPlayerCharacterData().character_id == vehicleData.characterOwnerId)
                    {
                        p.SendChatMessage($"{ChatUtils.freelanceJobs} Your job vehicle has been destroyed and you have been fired from your job as a {vehicleData.jobName}.");
                    }
                });

                vehicle.Delete();
            }
        }

        public static bool hasFreeLanceVehicle(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            bool hasVeh = false;

            if (characterData != null)
            {
                NAPI.Pools.GetAllVehicles().ForEach(veh =>
                {
                    if(veh.getFreelanceJobData()?.characterOwnerId == characterData.character_id)
                    {
                        hasVeh = true;
                    }
                });
            }

            if(hasVeh)
            {
                CommandUtils.errorSay(player, "You already have a work truck. Continue with your job or use /qjob.");
            }

            return hasVeh;
        }

        public static bool checkValidFreelanceVeh(Player player, FreelanceJobs job)
        {
            bool isValid = false;
            if(player.IsInVehicle)
            {
                FreeLanceJobVehicleData freelanceVehData = player.Vehicle.getFreelanceJobData();
                FreeLanceJobData playerJobData = player.getFreelanceJobData();
                DbCharacter characterData = player.getPlayerCharacterData();

                if(freelanceVehData != null && characterData != null && playerJobData != null && freelanceVehData.jobId == (int)job && freelanceVehData.characterOwnerId == characterData.character_id)
                {
                    isValid = true;
                }
            }

            return isValid;
        }

        public static bool hasAJob(Player player, int compareJobId)
        {
            bool hasAJob = false;

            if(player.getFreelanceJobData() != null && player.getFreelanceJobData().jobId != compareJobId)
            {
                player.SendChatMessage(ChatUtils.error + "You already have a freelance job. Use /qjob to quit it.");
                hasAJob = true;
            }

            if(player.GetData<DmvLicensePlayer>(DmvSystem._PlayerDmvDataKey) != null)
            {
                hasAJob = true;
                player.SendChatMessage(ChatUtils.error + "You have a DMV Course pending.");
            }

            return hasAJob;
        }

        public static void deleteFreeLanceVehs(Player player, bool sendMsg = false)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            
            if(characterData != null)
            {
                NAPI.Pools.GetAllVehicles().ForEach(veh =>
                {
                    if (veh.getFreelanceJobData() != null && veh.getFreelanceJobData().characterOwnerId == characterData.character_id)
                    {
                        veh.Delete();
                    }
                });

                if(sendMsg)
                {
                    player.SendChatMessage(ChatUtils.freelanceJobs + "Your truck has been returned to your employer.");
                }

            }
        }
        #endregion

        #region Commands
        [Command("quitjob", "~y~Use: ~w~/quitjob", Alias = "qjob")]
        public void quitFreeLanceJob(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            FreeLanceJobData jobData = player.getFreelanceJobData();

            if(jobData != null && characterData != null)
            {
                string jobName = jobData.jobName;
                quitJob(player, jobData);

                player.SendChatMessage(ChatUtils.freelanceJobs + "You have quit your freelance job as a " + jobName + ".");
                player.resetFreeLanceJobData();
                MarkersAndLabels.removeClientBlip(player);

            } else
            {
                CommandUtils.errorSay(player, "You don't have any freelance jobs to quit.");
            }
        }
        #endregion

        #region Server Events
        [ServerEvent(Event.PlayerDisconnected)]
        public void removeLeavePlayerVehicles(Player player, DisconnectionType type, string reason)
        {
            if(player.getFreelanceJobData() != null)
            {
                deleteFreeLanceVehs(player);
            }
        }
        #endregion
    }

    public enum FreelanceJobs
    {
        BusJob,
        TruckerJob,
        PostalJob,
        GruppeSix
    }

    public class FreeLanceJobData
    {
        public int jobId {  get; set; }
        public bool jobFinished { get; set; }
        public int jobLevel { get; set; }
        public string jobName { get; set; }
        public long jobStartedUnix { get; set; }
    }

    public class FreeLanceJobVehicleData
    {
        public int characterOwnerId { get; set; }
        public int jobId { get; set; }
        public string jobName { get; set; }
        public bool destroyOnLeave { get; set; } = true;
    }
}
