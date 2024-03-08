using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.WeaponSystem
{
    public class WeaponList
    {
        public static Dictionary<WeaponHash, WeaponsData> serverWeapons = new Dictionary<WeaponHash, WeaponsData>
        {
            {
                WeaponHash.Pistol50, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.secondary,
                    weaponName = "Pistol .50"
                }
            },
            {
                WeaponHash.Pistol, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.secondary,
                    weaponName = "Pistol .50"
                }
            },
            {
                WeaponHash.Combatpdw, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.primary,
                    weaponName = "Combat PDW"
                }
            },
            {
                WeaponHash.Assaultrifle, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.primary,
                    weaponName = "Combat PDW"
                }
            },
            {
                WeaponHash.Nightstick, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.melee,
                    weaponName = "Night Stick"
                }
            },
            {
                WeaponHash.Stungun, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.melee,
                    weaponName = "Stun Gun"
                }
            },
            {
                WeaponHash.Knife, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.melee,
                    weaponName = "Knife"
                }
            },
            {
                WeaponHash.Machete, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.melee,
                    weaponName = "Machete"
                }
            },
            {
                WeaponHash.Molotov, new WeaponsData
                {
                    maxAmmo = 20,
                    weaponClass = WeaponClasses.melee,
                    weaponName = "Molotov"
                }
            }
        };
    }
}
