using CloudRP.Database;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.Vehicles
{
    internal class VehicleSystem : Script
    {
        public static List<DbVehicle> vehicles;

        [ServerEvent(Event.ResourceStart)]
        public void spawnAllVehicles()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                vehicles = dbContext.vehicles.ToList();
            }

            Console.WriteLine($"A total of {vehicles.Count} vehicles where loaded in.");

            if(vehicles.Count > 0)
            {

                foreach (var item in vehicles)
                {
                    spawnVehicle(item);
                }
            };
        }

        public static void spawnVehicle(DbVehicle vehicle)
        {
            Vector3 spawnPosition = new Vector3(vehicle.position_x, vehicle.position_y, vehicle.position_z);
            float rotation = vehicle.rotation;

            Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicle.vehicle_spawn_hash, spawnPosition, rotation, 255, 255, "ADMIN", 255, false, true, 0);
        }
    }
}
