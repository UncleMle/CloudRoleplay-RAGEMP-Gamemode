using CloudRP.ServerSystems.Database;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Logging
{
    public class ServerLogging
    {
        public static void addNewLog(int characterId, string name, string description, LogTypes logType, int accountId = -1)
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                ServerLog log = new ServerLog
                {
                    character_owner_id = characterId,
                    log_type = (int)logType,
                    server_log_description = description,
                    server_log_name = name,
                    account_id = accountId
                };

                dbContext.server_logs.Add(log);
                dbContext.SaveChanges();
            }
        }
    }

    public enum LogTypes
    {
        CashAndMoneyLog,
        AssetPurchase,
        AdminLog
    }
}
