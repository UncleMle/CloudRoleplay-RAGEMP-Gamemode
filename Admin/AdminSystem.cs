using CloudRP.Authentication;
using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using static CloudRP.Authentication.Account;

namespace CloudRP.Admin
{
    internal class AdminSystem : Script
    {
        [Command("makeadmin")]
        public void makeAdmin(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, "Example chat message");
        }

        [Command("makeaccount")]
        public void makeAccount(Player player) {
            NAPI.Chat.SendChatMessageToPlayer(player, "Make");

            using (var db = new DbConn())
            {

                AccountModel account = new AccountModel();

                account.username = "unclemole";

                db.Accounts.Add(account);
                db.SaveChanges();
            }

            

        }
    }
}
