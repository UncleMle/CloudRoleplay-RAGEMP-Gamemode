using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using System;

namespace CloudRP.PlayerSystems.Jobs
{
    public class FreelanceJobSystem : Script
    {
        public static readonly string _FreelanceJobDataIdentifier = "FreeLanceJobData";
        public static readonly string _FreelanceJobVehicleDataIdentifier = "FreeLanceJobVehicleData";

        public FreelanceJobSystem()
        {
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


            return hasVeh;
        }

        public static bool hasAJob(Player player, int compareJobId)
        {
            bool hasAJob = false;

            if(player.getFreelanceJobData() != null && player.getFreelanceJobData().jobId != compareJobId)
            {
                player.SendChatMessage(ChatUtils.error + "You already have a freelance job. Use /qjob to quit it.");
                hasAJob = true;
            }

            return hasAJob;
        }

        public static void deleteFreeLanceVehs(Player player)
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
            }
        }
        #endregion

        #region Commands
        [Command("quitjob", "~y~Use: ~w~/quitjob", Alias = "qjob")]
        public void quitFreeLanceJob(Player player)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if(player.getFreelanceJobData() != null && characterData != null)
            {
                string jobName = player.getFreelanceJobData().jobName;

                player.SendChatMessage(ChatUtils.freelanceJobs + "You have quit your freelance job as a " + jobName + ".");
                player.resetFreeLanceJobData();
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
        BusJob = 0,
        TruckerJob = 1,
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
