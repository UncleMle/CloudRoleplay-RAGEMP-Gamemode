using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WeaponSystem
{
    public class WeaponAttachmentData
    {
        public string Slot { get; set; }
        public int AttachBone { get; set; }
        public Vector3 AttachPosition { get; set; }
        public Vector3 AttachRotation { get; set; }
    }
}

