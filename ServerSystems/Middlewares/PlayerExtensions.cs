using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Authentication;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.ServerSystems.Middlewares
{
    public static class PlayerExtensions
    {
        public static void addAllowedEvents(this Player player, string[] events)
        {
            User account = player.getPlayerAccountData();

            KeyValuePair<int, List<string>> allowedEvents = RemoteEventMiddleware.allowedEvents
                .Where(allowed => allowed.Key == account.account_id)
                .FirstOrDefault();

            foreach(string selectEvent in events)
            {
                if(!allowedEvents.Value.Contains(selectEvent))
                {
                    allowedEvents.Value.Add(selectEvent);
                }
            }
        }

        public static void removeAllowedEvents()
        {

        }
    }
}
