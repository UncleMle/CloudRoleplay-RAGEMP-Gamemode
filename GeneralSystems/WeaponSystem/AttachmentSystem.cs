using CloudRP.PlayerSystems.PlayerData;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;


namespace CloudRP.GeneralSystems.WeaponSystem
{
    public class AttachmentSystem : Script
    {
        Dictionary<string, Root> weaponData = new Dictionary<string, Root>();
        public static readonly string _attachmentDataIdentifier = "playerGunAttachmentData";

        public static readonly Vector3 meleeAttachmentPos = new Vector3(-0.07, 0.07, 0.110);
        public static readonly Vector3 meleeAttachmentRot = new Vector3(37.0, 88.0, -3.0);

        public static readonly Vector3 PistolAttachmentPos = new Vector3(-0.0800, -0.1000, 0.03);
        public static readonly Vector3 PistolAttachmentRot = new Vector3(3, -8, 24);

        public static readonly Vector3 SMGAttachmentPos = new Vector3(-0.08, -0.16, -0.01);
        public static readonly Vector3 SMGAttachmentRot = new Vector3(0, 37.0, 3);

        public static readonly Vector3 ShotgunAttachmentPos = new Vector3(-0.1, -0.15, 0.07);
        public static readonly Vector3 ShotgunAttachmentRot = new Vector3(-1, 40, 3);

        public static readonly Vector3 RifleAttachmentPos = new Vector3(0.0600, -0.1300, 0.0900);
        public static readonly Vector3 RifleAttachmentRot = new Vector3(0, 136.0000, 0);

        public static readonly Vector3 MicroSMGAttachmentPos = new Vector3(-0, -0.17, 0.07); //new mp.Vector3(-0.1, -0.15, -0.13);
        public static readonly Vector3 MicroSMGAttachmentRot = new Vector3(0, -115, -1); //new mp.Vector3(0.0, 0.0, 3.5);

        public static readonly Vector3 CarbineAttachmentPos = new Vector3(0.10, -0.16, 0.01); //new mp.Vector3(-0.1, -0.15, -0.13);
        public static readonly Vector3 CarbineAttachmentRot = new Vector3(0, 143, 0); //new mp.Vector3(0.0, 0.0, 3.5);

        public static readonly Vector3 RPGAttachmentPos = new Vector3(0.22, -0.17, -0.08);
        public static readonly Vector3 RPGAttachmentRot = new Vector3(-4, 21, -2);

        public static readonly Vector3 MGAttachmentPos = new Vector3(-0.2, -0.17, 0.07);
        public static readonly Vector3 MGAttachmentRot = new Vector3(6, 34, -4);

        private Dictionary<string, WeaponAttachmentData> weaponAttachmentData = new Dictionary<string, WeaponAttachmentData>
        {
        // Melee
        { "WEAPON_NIGHTSTICK", new WeaponAttachmentData { Slot = "SKEL_R_Thigh", AttachBone = 51826, AttachPosition = meleeAttachmentPos, AttachRotation = meleeAttachmentRot } },

            // Pistols
        { "WEAPON_PISTOL", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_PISTOL_MK2", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_COMBATPISTOL", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_APPISTOL", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_STUNGUN", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_PISTOL50", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_SNSPISTOL", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_SNSPISTOL_MK2", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_HEAVYPISTOL", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_VINTAGEPISTOL", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_REVOLVER", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_REVOLVER_MK2", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_DOUBLEACTION", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },
        { "WEAPON_RAYPISTOL", new WeaponAttachmentData { Slot = "RIGHT_THIGH", AttachBone = 11816, AttachPosition = PistolAttachmentPos, AttachRotation = PistolAttachmentRot } },

        // Submachine Guns
        { "WEAPON_MICROSMG", new WeaponAttachmentData { Slot = "LEFT_THIGH", AttachBone = 11816, AttachPosition = SMGAttachmentPos, AttachRotation = SMGAttachmentRot } },
        { "WEAPON_SMG", new WeaponAttachmentData { Slot = "LEFT_THIGH", AttachBone = 24818, AttachPosition = SMGAttachmentPos, AttachRotation = SMGAttachmentRot } },
        { "WEAPON_SMG_MK2", new WeaponAttachmentData { Slot = "LEFT_THIGH", AttachBone = 24818, AttachPosition = SMGAttachmentPos, AttachRotation = SMGAttachmentRot } },
        { "WEAPON_ASSAULTSMG", new WeaponAttachmentData { Slot = "LEFT_THIGH", AttachBone = 24818, AttachPosition = SMGAttachmentPos, AttachRotation = SMGAttachmentRot } },
        { "WEAPON_COMBATPDW", new WeaponAttachmentData { Slot = "LEFT_THIGH", AttachBone = 24818, AttachPosition = SMGAttachmentPos, AttachRotation = SMGAttachmentRot } },
        { "WEAPON_MACHINEPISTOL", new WeaponAttachmentData { Slot = "LEFT_THIGH", AttachBone = 24818, AttachPosition = MGAttachmentPos, AttachRotation = MGAttachmentRot} },
        { "WEAPON_MINISMG", new WeaponAttachmentData { Slot = "LEFT_THIGH", AttachBone = 24818, AttachPosition = SMGAttachmentPos, AttachRotation = SMGAttachmentRot } },

        // Shotguns
        { "WEAPON_PUMPSHOTGUN", new WeaponAttachmentData { Slot = "LEFT_BACK", AttachBone = 24818, AttachPosition = ShotgunAttachmentPos, AttachRotation = ShotgunAttachmentRot } },
        { "WEAPON_PUMPSHOTGUN_MK2", new WeaponAttachmentData { Slot = "LEFT_BACK", AttachBone = 24818,AttachPosition = ShotgunAttachmentPos, AttachRotation = ShotgunAttachmentRot } },
        { "WEAPON_SAWNOFFSHOTGUN", new WeaponAttachmentData { Slot = "LEFT_BACK", AttachBone = 24818, AttachPosition = ShotgunAttachmentPos, AttachRotation = ShotgunAttachmentRot } },
        { "WEAPON_ASSAULTSHOTGUN", new WeaponAttachmentData { Slot = "LEFT_BACK", AttachBone = 24818, AttachPosition = ShotgunAttachmentPos, AttachRotation = ShotgunAttachmentRot } },
        { "WEAPON_BULLPUPSHOTGUN", new WeaponAttachmentData { Slot = "LEFT_BACK", AttachBone = 24818, AttachPosition = ShotgunAttachmentPos, AttachRotation = ShotgunAttachmentRot } },
        { "WEAPON_HEAVYSHOTGUN", new WeaponAttachmentData { Slot = "LEFT_BACK", AttachBone = 24818, AttachPosition = ShotgunAttachmentPos, AttachRotation = ShotgunAttachmentRot } },

        // Rifles
        { "WEAPON_ASSAULTRIFLE", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } },
        { "WEAPON_ASSAULTRIFLE_MK2", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } },
        { "WEAPON_CARBINERIFLE", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } },
        { "WEAPON_CARBINERIFLE_MK2", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } },
        { "WEAPON_SPECIALCARBINE", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } },
        { "WEAPON_SPECIALCARBINE_MK2", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } },
        { "WEAPON_MARKSMANRIFLE", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } },
        { "WEAPON_MARKSMANRIFLE_MK2", new WeaponAttachmentData { Slot = "RIGHT_BACK", AttachBone = 24818, AttachPosition = RifleAttachmentPos, AttachRotation = RifleAttachmentRot } }

        };


        public AttachmentSystem()
        {
            /*
            using (StreamReader sr = new StreamReader(Main.JsonDirectory + "weaponData.json"))
            {
                weaponData = JsonConvert.DeserializeObject<Dictionary<string, Root>>(sr.ReadToEnd());

                foreach (KeyValuePair<string, WeaponAttachmentData> item in weaponAttachmentData)
                {
                    KeyValuePair<string, Root> data = weaponData
                        .Where(dat => dat.Key == item.Key)
                        .FirstOrDefault();

                    if (data.Value != null && data.Value.HashKey != null && data.Value.ModelHashKey != null)
                    {
                        item.Value.AttachName = $"WDSP_{data.Value.HashKey}";
                        item.Value.AttachModel = data.Value.ModelHashKey;
                    }
                }
            }
            */
        }

        /*
        [ServerEvent(Event.PlayerConnected)]
        public void setBodyWeaponData(Player player)
        {
            player.SetCustomData(_attachmentDataIdentifier, new string[] { });
            //player.TriggerEvent("registerWeaponAttachments", JsonConvert.SerializeObject(weaponAttachmentData));
        }
        */

        [ServerEvent(Event.PlayerWeaponSwitch)]
        public void OnPlayerWeaponSwitch(Player player, uint oldWeapon, uint newWeapon)
        {
            /*
            KeyValuePair<string, Root> wepData = weaponData
                .Where(wep => wep.Key == oldWeapon.ToString())
                .FirstOrDefault();

            if(wepData.Value != null)
            {
                string oldWeaponKey = wepData.Value.HashKey;

                KeyValuePair<string, WeaponAttachmentData> wepAttach = weaponAttachmentData
                    .Where(wep => wep.Key == oldWeaponKey)
                    .FirstOrDefault();

                if (wepAttach.Value != null)
                {
                    // Remove the attached weapon that is occupying the slot
                    string slot = weaponAttachmentData[oldWeaponKey].Slot;
                    if (player._bodyWeapons[slot] && player.hasAttachment(player._bodyWeapons[slot])) player.addAttachment(player._bodyWeapons[slot], true);

                    // Attach the updated old weapon
                    let attachName = weaponAttachmentData[oldWeaponKey].AttachName;
                    player.addAttachment(attachName, false);
                    player._bodyWeapons[slot] = attachName;
                }
            }
            */
        }

    }
}
