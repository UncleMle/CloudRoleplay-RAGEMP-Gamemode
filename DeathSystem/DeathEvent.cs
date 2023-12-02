using CloudRP.Utils;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Internal;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace CloudRP.DeathSystem
{
    class DeathEvent : Script
    {
        public static List<Hospital> hospitalList = new List<Hospital>();

        [ServerEvent(Event.ResourceStart)]
        public void initEvents()
        {
            hospitalList.Add(new Hospital { name = "South LS Hospital", position = new Vector3(342.3, -1397.5, 32.5) });
            hospitalList.Add(new Hospital { name = "Pillbox Hill Hospital Back", position = new Vector3(360.8, -585.3, 28.8) });
            hospitalList.Add(new Hospital { name = "Pillbox Hill Hospital Front", position = new Vector3(297.7, -583.6, 43.3) });
            hospitalList.Add(new Hospital { name = "Mount Zonah", position = new Vector3(-497.3, -336.3, 34.5) });
            hospitalList.Add(new Hospital { name = "Sandy Hospital", position = new Vector3(1821.3, 3684.9, 34.3) });
            hospitalList.Add(new Hospital { name = "Paleto Hospital", position = new Vector3(-381.1, 6119.7, 31.5) });

            NAPI.Server.SetAutoRespawnAfterDeath(false);
            NAPI.Server.SetAutoSpawnOnConnect(false);

            ChatUtils.deathSystem("Disabled auto respawn and loaded hospitals.");
        }

        [ServerEvent(Event.PlayerDeath)]
        public void OnPlayerDeath(Player player, Player killer, uint reason)
        {
            respawnAtHospital(player);
        }

        public static void respawnAtHospital(Player player)
        {
            Dictionary<float, Hospital> pDist = new Dictionary<float, Hospital>();

            foreach (Hospital hospital in hospitalList)
            {
                float dist = Vector3.Distance(hospital.position, player.Position);
                
                pDist.Add(dist, hospital);
            }

            List<float> distList = new List<float>(pDist.Keys);

            distList.Sort();

            Hospital closestHospital = pDist.GetValueOrDefault(distList[0]);

            NAPI.Player.SpawnPlayer(player, closestHospital.position);

            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.hospital + "You recieved medial treatment at " + closestHospital.name);
        }

    }
}
