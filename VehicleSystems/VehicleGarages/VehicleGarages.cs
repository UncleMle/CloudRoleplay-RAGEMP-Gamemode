using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloudRP.VehicleSystems.VehicleGarages
{
    public class VehicleGarages : Script
    {
        private static List<VehicleGarage> vehicleGarages = new List<VehicleGarage>();

        public VehicleGarages()
        {
            Main.resourceStart += loadAllGarages;
        }

        public void loadAllGarages()
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                vehicleGarages = dbContext.vehicle_garages.ToList();

                ChatUtils.startupPrint($"Loaded in {vehicleGarages.Count} vehicle garages.");
            }

            vehicleGarages.ForEach(garage => loadGarage(garage, true));
        }

        public class RaycastMenuOptions
        {
            public const string buyGarage = "Purchase Garage";
            public const string viewVehicles = "View garage vehicles";
        }

        private static void loadGarage(VehicleGarage vehicleGarage, bool fromDb = false)
        {
            Vector3 garagePos = new Vector3(vehicleGarage.pos_x, vehicleGarage.pos_y, vehicleGarage.pos_z);

            NAPI.Blip.CreateBlip(856, garagePos, 1f, 4, "Vehicle Garage", 255, 1f, true, 0, 0);

            vehicleGarage.pos = garagePos;

            List<string> menuItems = new List<string> { RaycastMenuOptions.viewVehicles };

            if(vehicleGarage.garage_sell_price > 0)
            {
                menuItems.Add(RaycastMenuOptions.buyGarage);
            }

            vehicleGarage.raycastPoint = new RaycastInteraction
            {
                menuTitle = "Vehicle Garage #" + vehicleGarage.garage_id,
                raycastMenuItems = menuItems,
                raycastMenuPosition = garagePos,
                targetMethod = handleGarageInteraction
            };

            RaycastInteractionSystem.raycastPoints.Add(vehicleGarage.raycastPoint);

            if (fromDb) return;

            if (vehicleGarages.IndexOf(vehicleGarage) == -1) return;

            vehicleGarages[vehicleGarages.IndexOf(vehicleGarage)] = vehicleGarage;
        }

        public static VehicleGarage createGarage(int sellPrice, Vector3 garagePos, int slots)
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                VehicleGarage newGarage = new VehicleGarage
                {
                    garage_sell_price = sellPrice,
                    pos_x = garagePos.X,
                    pos_y = garagePos.Y,
                    pos_z = garagePos.Z,
                    vehicle_slots = slots
                };

                dbContext.vehicle_garages.Add(newGarage);
                dbContext.SaveChanges();

                loadGarage(newGarage);

                vehicleGarages.Add(newGarage);
                return newGarage;
            }
        }

        public static void handleGarageInteraction(Player player, string menuOption)
        {
            VehicleGarage garage = vehicleGarages.Where(gar => player.checkIsWithinCoord(gar.pos, 2f)).FirstOrDefault();

            if (garage == null) return;

            switch(menuOption)
            {
                case RaycastMenuOptions.viewVehicles:
                    {
                        RaycastInteractionSystem.updateRaycastPointInteractionMenu(garage.raycastPoint, new List<string> { RaycastMenuOptions.buyGarage });

                        Console.Write("View vehs");
                        break;
                    }
                case RaycastMenuOptions.buyGarage:
                    {
                        Console.Write("buy garage");
                        break;
                    }
            }
        }
    }
}
