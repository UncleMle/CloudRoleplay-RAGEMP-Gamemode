using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.SpeedCameras
{
    public class SpeedCamera
    {
        public string name {  get; set; }
        public Vector3 position { get; set; }
        public float range { get; set; }
    }
}
