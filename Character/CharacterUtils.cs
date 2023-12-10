using CloudRP.Database;
using CloudRP.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Character
{
    public class CharacterUtils : Script
    {
        public static ulong playTimeToDays(ulong playTime)
        {
            return playTime / 86400;
        }

        public static void createCharModel(int charId, CharacterModel model)
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                model.owner_id = charId;
                dbContext.character_models.Add(model);
                dbContext.SaveChanges();
            }
        }
    }

    public class CharacterCreation
    {
        public class Model
        {
            public int rotation { get; set; }
            public int firstHeadShape { get; set; }
            public int secondHeadShape { get; set; }
            public int firstSkinTone { get; set; }
            public int secondSkinTone { get; set; }
            public int headMix { get; set; }
            public int skinMix { get; set; }
            public bool sex { get; set; }
            public int noseWidth { get; set; }
            public int noseLength { get; set; }
            public int noseTip { get; set; }
            public int browHeight { get; set; }
            public int cheekBoneHeight { get; set; }
            public int cheeksWidth { get; set; }
            public int lips { get; set; }
            public int lipstick { get; set; }
            public int jawHeight { get; set; }
            public int chinPosition { get; set; }
            public int chinShape { get; set; }
            public int noseHeight { get; set; }
            public int noseBridge { get; set; }
            public int noseBridgeShift { get; set; }
            public int browWidth { get; set; }
            public int cheekBoneWidth { get; set; }
            public int eyes { get; set; }
            public int jawWidth { get; set; }
            public int chinLength { get; set; }
            public int chinWidth { get; set; }
            public int neckWidth { get; set; }
            public int eyeColour { get; set; }
            public int blemishes { get; set; }
            public int ageing { get; set; }
            public int facialHairStyle { get; set; }
            public int facialHairColour { get; set; }
            public int chestHairStyle { get; set; }
            public int hairStyle { get; set; }
            public int hairColour { get; set; }
            public int hairHighlights { get; set; }
            public int eyebrowsStyle { get; set; }
            public int eyebrowsColour { get; set; }
            public int complexion { get; set; }
            public int sunDamage { get; set; }
            public int molesFreckles { get; set; }
            public int blushStyle { get; set; }
            public int makeup { get; set; }
        }

        public string fname { get; set; }
        public string lname { get; set; }
        public Model model { get; set; }
    }

    public class HungerThirst
    {
        public double hunger;
        public double water;
    }

}
