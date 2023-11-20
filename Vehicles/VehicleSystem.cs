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
        [ServerEvent(Event.ResourceStart)]
        public void spawnAllVehicles()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                /*
                Vehicle insert = new Vehicle
                {
                    vehicle_name = "blista",
                    vehicle_spawn_name = "blista",
                    owner_id = 0,
                };

                dbContext.vehicles.Add(insert);

                dbContext.SaveChanges();

                List<Vehicle> vehicles = dbContext.vehicles.ToList();

                vehicles.ForEach(vehicle =>
                {
                    Console.WriteLine(vehicle.vehicle_id);
                });
                */

            }

        }
    }
}
