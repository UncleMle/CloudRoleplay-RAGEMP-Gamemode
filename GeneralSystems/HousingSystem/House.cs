﻿using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using static CloudRP.GeneralSystems.HousingSystem.Interiors;

namespace CloudRP.GeneralSystems.HousingSystem
{
    public class House : BaseEntity
    {
        [Key]
        public int house_id { get; set; }

        [Required]
        public int house_owner_id { get; set; }
        public string house_name { get; set; }
        public float house_position_x { get; set; }
        public float house_position_y { get; set; }
        public float house_position_z { get; set; }
        public int house_interior_id { get; set; }
        public int house_price { get; set; }
        public int garage_size { get; set; }
        public bool blip_visible { get; set; }

        [NotMapped]
        public bool isLocked { get; set; } = true;
        [NotMapped]
        public Interior houseInterior { get; set; }

        public static House getHouseById(int id)
        {
            House findHouse = null;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                findHouse = dbContext.houses.Where(house => house.house_id == id).FirstOrDefault();
            }

            return findHouse;
        }

        public static void deleteById(int houseId, bool deleteFromDb = false)
        {
            removeTextLabel(houseId);
            removeColshape(houseId);
            removeBlip(houseId);
            removePlaceMarker(houseId);
            clearPlayerHouseData(houseId);

            if (deleteFromDb)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    House findH = dbContext.houses
                        .Where(house => house.house_id == houseId)
                        .FirstOrDefault();

                    if (findH != null)
                    {
                        dbContext.Remove(findH);
                        dbContext.SaveChanges();
                    }
                }
            }
        }

        public static void clearPlayerHouseData(int houseId)
        {
            NAPI.Pools.GetAllPlayers().ForEach(player =>
            {
                House houseData = player.GetData<House>(HousingSystem._housingDataIdentifier);

                if (houseData != null && houseData.house_id == houseId)
                {
                    player.ResetData(HousingSystem._housingDataIdentifier);
                    player.ResetOwnSharedData(HousingSystem._housingDataIdentifier);
                    player.ResetData(HousingSystem._housingDataIdentifier);
                    player.ResetOwnSharedData(HousingSystem._housingDataIdentifier);
                }
            });
        }

        public static void updateHouseDataForWorld(House house)
        {
            NAPI.Pools.GetAllPlayers().ForEach(player =>
            {
                House houseData = player.GetData<House>(HousingSystem._housingDataIdentifier);

                if (houseData != null && houseData.house_id == house.house_id)
                {
                    player.SetData(HousingSystem._housingDataIdentifier, house);
                    player.SetSharedData(HousingSystem._housingDataIdentifier, house);
                }
            });

            NAPI.Pools.GetAllColShapes().ForEach(col =>
            {
                House houseData = col.GetData<House>(HousingSystem._housingDataIdentifier);

                if (houseData != null && houseData.house_id == house.house_id)
                {
                    col.SetData(HousingSystem._housingDataIdentifier, house);
                }
            });

        }

        public static void removeTextLabel(int houseId)
        {
            NAPI.Pools.GetAllTextLabels().ForEach(label =>
            {
                House houseData = label.GetData<House>(HousingSystem._housingDataIdentifier);

                if (houseData != null && houseData.house_id == houseId)
                {
                    label.Delete();
                }
            });
        }

        public static void removeColshape(int houseId)
        {
            NAPI.Pools.GetAllColShapes().ForEach(col =>
            {
                House houseData = col.GetData<House>(HousingSystem._housingDataIdentifier);

                if (houseData != null && houseData.house_id == houseId)
                {
                    col.Delete();
                }
            });
        }

        public static void removeBlip(int houseId)
        {
            NAPI.Pools.GetAllBlips().ForEach(blip =>
            {
                House houseData = blip.GetData<House>(HousingSystem._housingDataIdentifier);

                if (houseData != null && houseData.house_id == houseId)
                {
                    blip.Delete();
                }
            });
        }

        public static void removePlaceMarker(int houseId)
        {
            NAPI.Pools.GetAllMarkers().ForEach(marker =>
            {
                House houseData = marker.GetData<House>(HousingSystem._housingDataIdentifier);

                if (houseData != null && houseData.house_id == houseId)
                {
                    marker.Delete();
                }
            });
        }
    }
}
