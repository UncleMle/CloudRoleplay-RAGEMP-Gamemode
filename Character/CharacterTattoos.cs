using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.World;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
                overlayDlc = "mpvinewood_overlays",
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
                MarkersAndLabels.setTextLabel(store.position, $"{store.name} use ~y~Y~w~ to interact", 7f);
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

        [RemoteEvent("server:purchaseTattoos")]
        public async Task purchaseTattoos(Player player, string tatLib, string tatData)
        {
            TattooShop shopData = player.GetData<TattooShop>(_tattoStoreIdentifier);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if(shopData != null && characterData != null)
            {
                List<string> addedTats = JsonConvert.DeserializeObject<List<string>>(tatData);

                foreach (string item in addedTats)
                {
                    using(DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        Tattoo findTat = dbContext.player_tattoos
                            .Where(tat => tat.tattoo_lib == tatLib && tat.tattoo_collection == item)
                            .FirstOrDefault();

                        if(findTat == null)
                        {
                            dbContext.player_tattoos.Add(new Tattoo
                            {
                                tattoo_lib = tatLib,
                                tattoo_collection = item,
                                tattoo_owner_id = characterData.character_id
                            });
                            await dbContext.SaveChangesAsync();                            
                        }
                    }
                }

                List<Tattoo> newTattoList = getAllPlayerTats(characterData.character_id);
                characterData.characterModel.player_tattos = newTattoList;
                PlayersData.setPlayerCharacterData(player, characterData, true);
                uiHandling.sendPushNotif(player, "You purchased some tattoos", 6600, true, true, true);
            } else
            {
                uiHandling.setLoadingState(player, false);
            }
        }

        public static List<Tattoo> getAllPlayerTats(int charId)
        {
            List<Tattoo> findTats;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                findTats = dbContext.player_tattoos
                    .Where(tat => tat.tattoo_owner_id == charId)
                    .ToList();
            }

            return findTats;
        }
    }
}
