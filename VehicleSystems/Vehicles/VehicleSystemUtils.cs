﻿using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VehicleSystems.Vehicles
{
    public class VehicleKeyData
    {
        public int vehicleId { get; set; }
        public string nameOrId { get; set; }
        public string nickname { get; set; }
    }

    public class VehicleKeyRemoveData
    {
        public int keyId { get; set; }
        public int vehicle_id { get; set; }
    }
}