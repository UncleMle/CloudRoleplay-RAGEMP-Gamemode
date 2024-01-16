using GTANetworkAPI;
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
    }
}
