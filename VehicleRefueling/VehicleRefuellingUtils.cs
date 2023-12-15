using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleRefueling
{
    public class RefuelStation
    {
        public int station_id {  get; set; }
        public string name { get; set; }
        public int pricePerLitre { get; set; }
        public Vector3 position { get; set; }
        public List<RefuelPump> pumps { get; set; }
    }

    public class RefuelPump
    {
        public Vector3 position { get; set; }
        public int owner_id { get; set; }
    }

    public class UiFuelData
    {
        public int price { get; set; }
        public double fuel_literage { get; set; }
    }

    public class RefuelingData
    {
        public int vehicleId { get; set; }
        public int refuelStationId { get; set; }
        public int totalSalePrice { get; set; }
    }

}
