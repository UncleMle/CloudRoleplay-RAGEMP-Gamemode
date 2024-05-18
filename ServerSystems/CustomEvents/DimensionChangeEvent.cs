using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace CloudRP.ServerSystems.CustomEvents
{
    public class DimensionChangeEvent : Script
    {
        public delegate void DimensionChangeEventHandler(Player player, uint oldDimension, uint newDimension);
        
        public static event DimensionChangeEventHandler onDimensionChange;
        
        public static Dictionary<int, uint> playerDimensions = new Dictionary<int, uint>();

        public DimensionChangeEvent()
        {
            Main.playerDisconnect += (player) => playerDimensions.Remove(player.Id);

            System.Timers.Timer dimCheckTimer = new System.Timers.Timer
            {
                AutoReset = true,
                Enabled = true,
                Interval = 1000
            };

            dimCheckTimer.Elapsed += (source, elapsed) => {
                checkDimensions();
            };
        }

        private static void checkDimensions()
        {
            NAPI.Task.Run(() =>
            {
                NAPI.Pools.GetAllPlayers().ForEach(p =>
                {
                    if (!playerDimensions.ContainsKey(p.Id)) playerDimensions.Add(p.Id, p.Dimension);

                    if (playerDimensions[p.Id] != p.Dimension)
                    {
                        uint oldDim = playerDimensions[p.Id];
                        uint newDim = p.Dimension;

                        playerDimensions[p.Id] = p.Dimension;
                        onDimensionChange(p, oldDim, newDim);
                    }
                });
            });
        }

    }
}
