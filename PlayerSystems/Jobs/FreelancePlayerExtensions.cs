using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs
{
    public static class FreelancePlayerExtensions
    {
        public static FreeLanceJobData getFreelanceJobData(this Player player)
        {
            return player.GetData<FreeLanceJobData>(FreelanceJobSystem._FreelanceJobDataIdentifier);
        }

        public static void setFreelanceJobData(this Player player, FreeLanceJobData data)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if(characterData != null)
            {
                characterData.freelance_job_data = JsonConvert.SerializeObject(data);

                player.setPlayerCharacterData(characterData, false, true);

                FreeLanceJobData settedData = new FreeLanceJobData
                {
                    jobName = data.jobName,
                    jobId = data.jobId,
                    jobLevel = data.jobLevel,
                    jobFinished = data.jobFinished,
                    jobStartedUnix = CommandUtils.generateUnix()
                };

                player.SetCustomData(FreelanceJobSystem._FreelanceJobDataIdentifier, settedData);
                player.SetCustomSharedData(FreelanceJobSystem._FreelanceJobDataIdentifier, settedData);
            }
        }

        public static void resetFreeLanceJobData(this Player player, bool deleteVehs = true)
        {
            DbCharacter playerData = player.getPlayerCharacterData();

            if(playerData != null && player.getFreelanceJobData() != null)
            {
                playerData.freelance_job_data = null;
                player.setPlayerCharacterData(playerData, false, true);
                player.ResetData(FreelanceJobSystem._FreelanceJobDataIdentifier);
                player.ResetSharedData(FreelanceJobSystem._FreelanceJobDataIdentifier);

                if(deleteVehs)
                {
                    FreelanceJobSystem.deleteFreeLanceVehs(player);
                }
            }
        }
    }
}
