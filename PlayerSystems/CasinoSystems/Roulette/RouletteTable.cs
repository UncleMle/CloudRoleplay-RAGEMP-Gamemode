using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;
using GTANetworkAPI;
using CloudRP.ServerSystems.Database;
using System.Linq;

namespace CloudRP.PlayerSystems.CasinoSystems.Roulette
{
    public class RouletteTable
    {
        private static readonly string rouletteTableObject = "vw_prop_casino_roulette_01";
        private static readonly string _rouletteTableSharedDataKey = "server:casinoSystem:rouletteTableData";
        
        [Key]
        public int roulette_table_id { get; set; }

        [Required]
        public float heading { get; set; }
        public float pos_x { get; set; }
        public float pos_y { get; set; }
        public float pos_z { get; set; }

        [NotMapped]
        public Vector3 position { get; set; }
        [NotMapped]
        public bool beingRolled { get; set; }
        [NotMapped]
        public GTANetworkAPI.Object tableObject { get; set; }

        #region Static Methods
        public static RouletteTable addTable(Vector3 pos, float heading)
        {
            RouletteTable table = new RouletteTable
            {
                heading = heading,
                position = pos,
                pos_x = pos.X,
                pos_y = pos.Y,
                pos_z = pos.Z
            };

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.roulette_tables.Add(table);
                dbContext.SaveChanges();
            }

            RouletteTables.rouletteTables.Add(table.roulette_table_id, table);

            table.load();

            return table;
        }
        
        public static bool deleteTableById(int tableId)
        {
            bool wasDeleted = false;

            if(RouletteTables.rouletteTables.ContainsKey(tableId))
            {
                RouletteTable table = RouletteTables.rouletteTables[tableId];

                wasDeleted = true;
                table.delete();
            }

            return wasDeleted;
        }
        #endregion

        public void load()
        {
            tableObject = NAPI.Object.CreateObject(NAPI.Util.GetHashKey(rouletteTableObject), new Vector3(pos_x, pos_y, pos_z), new Vector3(0, 0, heading), 255, 0);
            tableObject.SetData(_rouletteTableSharedDataKey, this);
            tableObject.SetSharedData(_rouletteTableSharedDataKey, this);
        }
        
        public void delete()
        {
            GTANetworkAPI.Object tableObject = null;
            RouletteTable findTable = null;

            NAPI.Pools.GetAllObjects().ForEach(tab =>
            {
                findTable = tab.GetData<RouletteTable>(_rouletteTableSharedDataKey);

                if (findTable == null) return;

                if (findTable.roulette_table_id == roulette_table_id) tableObject = tab;
            });

            if (tableObject == null || findTable == null) return;

            tableObject.Delete();

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.roulette_tables.Remove(findTable);
                dbContext.SaveChanges();
            }
        }

        public void spin()
        {
            beingRolled = true;

            tableObject.SetData(_rouletteTableSharedDataKey, this);
            tableObject.SetSharedData(_rouletteTableSharedDataKey, this);
        }
    }
}
