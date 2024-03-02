using CloudRP.GeneralSystems.WeaponSystem;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.WorldSystems.BulletFragments
{
    public class BulletFragmentSystem : Script
    {
        public static List<Vector3> bulletFragments = new List<Vector3>();

        public BulletFragmentSystem() {
            Main.playerConnect += updateAllBulletCasings;
        }

        #region Global Methods

        private static void updateAllBulletCasings(Player player)
            => player.TriggerEvent("client:bulletFragmentSystem:updateClientFrags", JsonConvert.SerializeObject(bulletFragments));

        private static void addOneBulletCasingToClient(Player player, Vector3 position)
            => player.TriggerEvent("client:bulletFragmentSystem:addOneFrag", JsonConvert.SerializeObject(position));

        public static void flushFragments()
        {
            bulletFragments.Clear();

            NAPI.Pools.GetAllPlayers().ForEach(p => updateAllBulletCasings(p));
        }

        public void syncNewBulletCasing(Vector3 position)
        {
            bulletFragments.Add(position);

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                addOneBulletCasingToClient(p, position);
            });
        }
        
        #endregion

        #region Remote Events
        [RemoteEvent("server:bulletFragments:addNewBulletFragmentArea")]
        public void createNewFragmentArea(Player player, Vector3 position)
        {
            syncNewBulletCasing(position);
        }
        #endregion
    }
}
