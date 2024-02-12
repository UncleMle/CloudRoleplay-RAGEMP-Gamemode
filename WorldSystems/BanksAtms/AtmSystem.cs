using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace CloudRP.World.BanksAtms
{
    public class AtmSystem : Script
    {
        public static List<Vector3> Atms = new List<Vector3>
        {
            new Vector3(-2072.4326171875f, -317.276123046875f, 13.315979957580566f),
            new Vector3(-258.7763366699219f, -723.3988037109375f, 33.467262268066406f),
            new Vector3(-256.1478576660156f, -716.0738525390625f, 33.51643371582031f),
            new Vector3(-254.31884765625f, -692.4165649414062f, 33.61027908325195f),
            new Vector3(-2295.475830078125f, 358.1181640625f, 174.60171508789062f),
            new Vector3(-2294.67529296875f, 356.5382995605469f, 174.60171508789062f),
            new Vector3(-3044.10546875f, 594.6197509765625f, 7.736138820648193f),
            new Vector3(238.3200225830078f, 215.9827117919922f, 106.28675842285156f),
            new Vector3(237.8886260986328f, 216.87991333007812f, 106.28675842285156f),
            new Vector3(237.44927978515625f, 217.8021240234375f, 106.28675842285156f),
            new Vector3(237.04400634765625f, 218.7077178955078f, 106.28675842285156f),
            new Vector3(236.62030029296875f, 219.65756225585938f, 106.28675842285156f),
            new Vector3(264.3638610839844f, 210.0670928955078f, 106.28313446044922f),
            new Vector3(264.81817626953125f, 211.02896118164062f, 106.28313446044922f),
            new Vector3(265.15997314453125f, 211.97935485839844f, 106.28313446044922f),
            new Vector3(265.4615783691406f, 212.9705047607422f, 106.28313446044922f),
            new Vector3(265.8057861328125f, 213.86923217773438f, 106.28313446044922f),
            new Vector3(-97.3278579711914f, 6455.30615234375f, 31.466419219970703f),
            new Vector3(-95.53550720214844f, 6457.14697265625f, 31.460538864135742f),
            new Vector3(-283.0f, 6226.1, 31.5),
            new Vector3(33.2f, -1348.2, 29.5),
            new Vector3(-1827.2, 784.9, 138.3),
            new Vector3(380.9, 323.4, 103.6),
            new Vector3(380.9, 323.4, 103.6),
            new Vector3(1686.8, 4815.8, 42.0),
            new Vector3(1702.9, 4933.5, 42.1),
            new Vector3(2682.9, 3286.7, 55.2),
            new Vector3(-846.2, -341.2, 38.7),
            new Vector3(-846.9, -340.2, 38.7),
            new Vector3(-1205.0, -326.2, 37.8),
            new Vector3(-1205.7, -324.8, 37.9),
            new Vector3(-1571.0, -547.3, 35.0),
            new Vector3(-1570.2, -546.7, 35.0),
            new Vector3(-1314.9, -836.0, 17.0),
            new Vector3(-1315.8, -834.8, 17.0),
            new Vector3(-717.6, -915.7, 19.2),
            new Vector3(1735.3, 6410.6, 35.0),
            new Vector3(1701.3, 6426.5, 32.8),
            new Vector3(1968.1, 3743.7, 32.3),
            new Vector3(2558.8, 351.1, 108.6),
            new Vector3(2558.4, 389.4, 108.6),
            new Vector3(228.2, 338.5, 105.6),
            new Vector3(356.9, 173.6, 103.1),
            new Vector3(-165.1, 234.9, 94.9),
            new Vector3(-165.1, 232.8, 94.9),
            new Vector3(1153.7, -326.8, 69.2),
            new Vector3(158.7, 234.2, 106.6),
            new Vector3(155.9, 6642.7, 31.6),
            new Vector3(-821.6, -1082.0, 11.1),
            new Vector3(-3241.2, 997.4, 12.6),
            new Vector3(-3240.7, 1008.6, 12.8),
            new Vector3(-1091.5, 2708.5, 18.9),
            new Vector3(-2293.8, 354.8, 174.6),
            new Vector3(-2959.0, 487.8, 15.5),
            new Vector3(-2957.0, 487.7, 15.5),
            new Vector3(-2975.1, 380.2, 15.0),
            new Vector3(540.3, 2671.0, 42.2),
            new Vector3(-273.0, -2024.5, 30.1),
            new Vector3(-262.0, -2012.5, 30.1),
            new Vector3(145.9, -1035.2, 29.3),
            new Vector3(147.5, -1035.7, 29.3),
            new Vector3(-1305.4, -706.3, 25.3),
            new Vector3(-712.9, -818.9, 23.7),
            new Vector3(-710.0, -819.0, 23.7),
            new Vector3(-867.6, -186.1, 37.8),
            new Vector3(-866.7, -187.7, 37.8),
            new Vector3(1138.3, -468.9, 66.7),
            new Vector3(1166.9, -456.1, 66.8),
            new Vector3(296.4, -894.1, 29.2),
            new Vector3(295.7, -896.1, 29.2),
            new Vector3(-203.8, -861.4, 30.3)
        };

        public AtmSystem()
        {
            KeyPressEvents.keyPress_Y += openAtm;

            Atms.ForEach(atm =>
            {
                NAPI.Blip.CreateBlip(108, atm, 1.0f, 25, "ATM", 255, 1.0f, true, 0, 0);
                MarkersAndLabels.setTextLabel(atm, "Use ~y~Y~w~ to interact with this ATM", 2f);
                MarkersAndLabels.setPlaceMarker(atm);
            });
        }

        public static bool checkIsByAtm(Player player)
        {
            bool isByAtm = false;

            Atms.ForEach(atm =>
            {
                if(player.checkIsWithinCoord(atm, 2f))
                {
                    isByAtm = true;
                }
            });

            return isByAtm;
        }

        public void openAtm(Player player)
        {
            if (!checkIsByAtm(player)) return;

            DbCharacter characterData = player.getPlayerCharacterData();

            if (characterData != null)
            {
                Banks.sendAtmUIData(player, characterData);
            }
        }

        [RemoteEvent("server:atmWithdrawCash")]
        public void atmWithdrawCash(Player player, string amount)
        {
            DbCharacter characterData = player.getPlayerCharacterData();

            if ((checkIsByAtm(player) || Banks.closeToBankTeller(player)) && characterData != null)
            {
                if (amount == null || string.IsNullOrWhiteSpace(amount))
                {
                    uiHandling.sendPushNotifError(player, "Enter a valid cash amount.", 5400, true);
                    return;
                }

                try
                {
                    int withdrawAmount = int.Parse(amount);

                    if (withdrawAmount > 0 && withdrawAmount <= 200000)
                    {
                        if (characterData.money_amount - withdrawAmount < 0)
                        {
                            uiHandling.sendPushNotifError(player, "You do not have enough money to withdraw this amount.", 5400, true);
                            return;
                        }

                        characterData.money_amount -= withdrawAmount;
                        characterData.cash_amount += withdrawAmount;

                        player.setPlayerCharacterData(characterData, false, true);
                        uiHandling.sendNotification(player, $"~g~You withdrew ${withdrawAmount.ToString("N0")}.", false, true, "Withdraws cash.");
                        uiHandling.setLoadingState(player, false);
                        Banks.sendAtmUIData(player, characterData);
                    }
                    else
                    {
                        uiHandling.sendPushNotifError(player, "Amount must be greater than zero and less than $200,000.", 5400, true);
                    }
                }
                catch
                {
                    uiHandling.sendPushNotifError(player, "Enter a valid cash amount.", 5400, true);
                }
            }
        }

    }
}
