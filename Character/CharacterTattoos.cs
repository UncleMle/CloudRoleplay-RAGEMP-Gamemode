using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Character
{
    public class CharacterTattoos : Script
    {
        public static string _tattoStoreIdentifier = "tattoStoreData";
        public static List<TattooShop> tattooStore = new List<TattooShop>
        {
            new TattooShop
            {
                name = "Vinewood Tattoos",
                position = new Vector3(322.0, 180.5, 103.6)
            }
        };

        [ServerEvent(Event.ResourceStart)]
        public void loadTattooShops()
        {
            foreach(TattooShop store in tattooStore)
            {
                ColShape tattoCol = NAPI.ColShape.CreateSphereColShape(store.position, 2f, 0);
                tattoCol.SetData(_tattoStoreIdentifier, store);

                NAPI.Blip.CreateBlip(75, store.position, 1, 1, store.name, 255, 50, true, 0, 0);
                MarkersAndLabels.setTextLabel(store.position, $"{store.name}", 7f);
                MarkersAndLabels.setPlaceMarker(store.position);
            }
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setTattoData(ColShape colshape, Player player)
        {
            TattooShop tattooData = colshape.GetData<TattooShop>(_tattoStoreIdentifier);

            if (tattooData != null)
            {
                player.SetData(_tattoStoreIdentifier, tattooData);
                player.SetSharedData(_tattoStoreIdentifier, tattooData);
            }
        }

        [ServerEvent(Event.PlayerExitColshape)]
        public void removeTattooData(ColShape colshape, Player player)
        {
            TattooShop tattooData = colshape.GetData<TattooShop>(_tattoStoreIdentifier);

            if (tattooData != null)
            {
                player.ResetData(_tattoStoreIdentifier);
                player.ResetSharedData(_tattoStoreIdentifier);
            }
        }

        [Command("tat", "~r~/tat col lib")]
        public void tatCommnad(Player player, string col, string lib)
        {
            player.TriggerEvent("tat:setTatto", col, lib);
        }

    }
}
