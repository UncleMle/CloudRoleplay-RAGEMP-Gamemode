using CloudRP.PlayerSystems.AnimationSync;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;

namespace CloudRP.GeneralSystems.WeaponSystem
{
    class WeaponSystems : Script
    {
        public static readonly string _currentWeaponDataIdentifier = "server:weaponSystem:currentWeapon";

        public WeaponSystems()
        {
            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {WeaponList.serverWeapons.Count} server weapons were loaded.");
        }

        [ServerEvent(Event.PlayerWeaponSwitch)]
        public void OnPlayerWeaponSwitch(Player player, WeaponHash oldWeapon, WeaponHash newWeapon)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData != null)
            {
                if (characterData.injured_timer > 0) return;

                Dictionary<WeaponHash, WeaponsData> weapons = WeaponList.serverWeapons;

                WeaponsData data = null;

                if(weapons.ContainsKey(oldWeapon))
                {
                    data = weapons[oldWeapon]; 
                }
                
                if(weapons.ContainsKey(newWeapon))
                {
                    data = weapons[newWeapon]; 
                }

                if (data == null)
                {
                    player.ResetData(_currentWeaponDataIdentifier);
                    return;
                }

                player.SetCustomData(_currentWeaponDataIdentifier, data);

                switch(data.weaponClass)
                {
                    case WeaponClasses.primary:
                        {
                            AnimSync.playSyncAnimation(player, 49, "anim@heists@ornate_bank@grab_cash", "exit", 1800);
                            break;
                        }
                    case WeaponClasses.secondary:
                        {
                            AnimSync.playSyncAnimation(player, 49, "reaction@intimidation@1h", "intro", 1800);
                            break;
                        }
                    case WeaponClasses.melee:
                        {
                            AnimSync.playSyncAnimation(player, 49, "anim@weapons@pistol@doubleaction_holster", "holster", 1800);
                            break;
                        }
                }
            }
        }
    }
}
