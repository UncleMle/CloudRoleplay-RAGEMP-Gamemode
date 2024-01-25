using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.AttachmentSync
{
    public class AttachmentData
    {
        public string bone { get; set; }
        public Vector3 offset { get; set; }
        public Vector3 rotation { get; set; }
        public string modelName { get; set; }
    }
}
