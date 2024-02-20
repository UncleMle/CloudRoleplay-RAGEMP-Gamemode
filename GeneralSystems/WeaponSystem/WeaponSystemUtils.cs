using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.WeaponSystem
{
    public enum WeaponClasses
    {
        primary,
        secondary,
        melee
    }

    public class WeaponsData
    {
        public string weaponName { get; set; }
        public WeaponClasses weaponClass { get; set; }
        public int maxAmmo { get; set; }
    }
}
