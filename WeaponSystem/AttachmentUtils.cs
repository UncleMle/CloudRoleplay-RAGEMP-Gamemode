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
        public string AttachName { get; set; }
        public string AttachModel { get; set; }
    }

    public class WeaponData
    {
        public string HashKey { get; set; }
        public string NameGXT { get; set; }
        public string DescriptionGXT { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Group { get; set; }
        public string ModelHashKey { get; set; }
        public int DefaultClipSize { get; set; }
        public string AmmoType { get; set; }
        public Dictionary<string, ComponentData> Components { get; set; }
    }

    public class ComponentData
    {
        public string HashKey { get; set; }
        public string NameGXT { get; set; }
        public string DescriptionGXT { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ModelHashKey { get; set; }
        public bool IsDefault { get; set; }
    }
}

