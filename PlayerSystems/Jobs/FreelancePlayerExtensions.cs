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

                player.SetCustomData(FreelanceJobSystem._FreelanceJobDataIdentifier, new FreeLanceJobData
                {
                    jobName = data.jobName,
                    jobStartedUnix = CommandUtils.generateUnix()
                });
            }
        }
    }
}
