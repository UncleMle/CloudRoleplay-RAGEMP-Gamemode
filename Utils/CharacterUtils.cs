using CloudRP.Character;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class CharacterUtils
    {
        public static ulong playTimeToDays(ulong playTime)
        {
            return playTime / 86400;
        }

        public static CharacterModel createCharacter(CharacterCreation characterModel, User userData)
        {
            try
            {
                CharacterModel newCharacter = new CharacterModel
                {
                    ageing = characterModel.model.ageing ,
                    blemishes = characterModel.model.blemishes,
                    blushStyle = characterModel.model.blushStyle,
                    browHeight = characterModel.model.browHeight,
                    browWidth = characterModel.model.browWidth,
                    cheekBoneHeight = characterModel.model.cheekBoneHeight,
                    cheekBoneWidth = characterModel.model.cheekBoneWidth,
                    cheeksWidth = characterModel.model.cheeksWidth,
                    chestHairStyle = characterModel.model.chestHairStyle,
                    chinLength = characterModel.model.chinLength,
                    chinPosition = characterModel.model.chinPosition,
                    chinShape = characterModel.model.chinShape,
                    chinWidth = characterModel.model.chinWidth,
                    complexion = characterModel.model.complexion,
                    eyebrowsColour = characterModel.model.eyebrowsColour,
                    eyebrowsStyle = characterModel.model.eyebrowsStyle,
                    eyeColour = characterModel.model.eyeColour,
                    eyes = characterModel.model.eyes,
                    facialHairColour = characterModel.model.facialHairColour,
                    facialHairStyle = characterModel.model.facialHairStyle,
                    firstHeadShape = characterModel.model.firstHeadShape,
                    firstSkinTone = characterModel.model.firstSkinTone,
                    hairColour = characterModel.model.hairColour,
                    hairHighlights = characterModel.model.hairHighlights,
                    hairStyle = characterModel.model.hairStyle,
                    headMix = characterModel.model.headMix,
                    jawHeight = characterModel.model.jawHeight,
                    jawWidth = characterModel.model.jawWidth,
                    lips = characterModel.model.lips,
                    lipstick = characterModel.model.lipstick,
                    makeup = characterModel.model.makeup,
                    molesFreckles = characterModel.model.molesFreckles,
                    neckWidth = characterModel.model.neckWidth,
                    noseBridge = characterModel.model.noseBridge,
                    noseBridgeShift = characterModel.model.noseBridgeShift,
                    noseHeight = characterModel.model.noseHeight,
                    noseLength = characterModel.model.noseLength,
                    noseTip = characterModel.model.noseTip,
                    noseWidth = characterModel.model.noseWidth,
                    owner_id = userData.accountId,
                    rotation = characterModel.model.rotation,
                    secondHeadShape = characterModel.model.secondHeadShape,
                    secondSkinTone = characterModel.model.secondSkinTone,
                    sex = characterModel.model.sex,
                    skinMix = characterModel.model.skinMix,
                    sunDamage = characterModel.model.sunDamage
                };
                

                return newCharacter;    

            } catch (Exception e)
            {
                Console.WriteLine(e.ToString());

                return null;
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
