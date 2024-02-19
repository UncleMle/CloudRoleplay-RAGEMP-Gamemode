using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.CasinoSystems.Roulette
{
    public class RouletteTables : Script
    {
        public static Dictionary<int, RouletteTable> rouletteTables = new Dictionary<int, RouletteTable>();

        public RouletteTables()
        {
            Main.resourceStart += initTables;
        }

        private static void initTables()
        {
            List<RouletteTable> tables = new List<RouletteTable>();

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                tables = dbContext.roulette_tables.ToList();

                tables.ForEach(table =>
                {
                    rouletteTables.Add(table.roulette_table_id, table);
                });
            }

            tables.ForEach(table =>
            {
                table.load();
            });
        }

        #region Remote Events
        [RemoteEvent("server:casinoSystem:rollRouletteTable")]
        public void rollRouletteTable(Player player, int tableId)
        {
            if (!rouletteTables.ContainsKey(tableId)) return;

            RouletteTable table = rouletteTables[tableId];

            if (Vector3.Distance(player.Position, table.position) > 12) return;

            Console.WriteLine("Table found id spin" + table.roulette_table_id);

            table.spin();
        }
        #endregion
    }
}
