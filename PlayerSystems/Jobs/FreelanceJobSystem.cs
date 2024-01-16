using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using Discord.Rest;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs
{
    public class FreelanceJobSystem : Script
    {
        public static readonly string _FreelanceJobDataIdentifier = "FreeLanceJobData";
        public static readonly string _FreelanceJobVehicleDataIdentifier = "FreeLanceJobVehicleData";

        #region Global Methods
        public static void handleVehicleDestroyed(Vehicle vehicle)
        {
            FreeLanceJobVehicleData vehicleData = vehicle.getFreelanceJobData();
            if (vehicleData != null)
            {
                NAPI.Pools.GetAllPlayers().ForEach(p =>
                {
                    if(p.getPlayerCharacterData() != null && p.getPlayerCharacterData().character_id == vehicleData.characterOwnerId)
                    {
                        p.SendChatMessage($"{ChatUtils.info} Your job vehicle has been destroyed and you have been fired from your job as a {vehicleData.jobName}.");
                        p.ResetData(_FreelanceJobDataIdentifier);
                    }
                });

                vehicle.Delete();
            }
        }

        public static bool hasAJob(Player player, int compareJobId)
        {
            bool hasAJob = false;

            if(player.getFreelanceJobData() != null && player.getFreelanceJobData().jobId != compareJobId)
            {
                player.SendChatMessage(ChatUtils.error + "You already have a freelance job. Use /qjob to quit it.");
                hasAJob = true;
            }

            if(!hasAJob)
            {
                deleteFreeLanceVehs(player);
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

                player.SendChatMessage(ChatUtils.info + "You have quit your freelance job as a " + jobName + ".");

                characterData.freelance_job_data = null;
                player.setPlayerCharacterData(characterData, false, true);

                player.ResetData(_FreelanceJobDataIdentifier);
                deleteFreeLanceVehs(player);
            }
        }
        #endregion
    }

    public enum FreelanceJobs
    {
        BusJob = 0,
    }

    public class FreeLanceJobData
    {
        public int jobId {  get; set; }
        public string jobName { get; set; }
        public long jobStartedUnix { get; set; }
    }

    public class FreeLanceJobVehicleData
    {
        public int characterOwnerId { get; set; }
        public string jobName { get; set; }
        public bool destroyOnLeave { get; set; } = true;
    }
}
