using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.CasinoSystems.LuckyWheel
{
    public class LuckyWheelSystem : Script
    {
        private static readonly string _spinningWheelDataKey = "casinoSystem:spinningWheel:winDataKey";
        private static readonly Vector3 spawnVehicleAt = new Vector3(1099.5, 220.3, -48.7);
        private static readonly int spinWheelCost = 400;
        string[] winListNames = new string[]
        {
            "clothing",
            "2,500 RP",
            "$20,000",
            "10,000 chips",
            "discount",
            "5,000 RP",
            "$30,000",
            "15,000 chips",
            "clothing",
            "7,500 RP",
            "20,000 chips",
            "mystery",
            "clothing",
            "10,000 RP",
            "$40,000",
            "25,000 chips",
            "clothing",
            "15,000 RP",
            "vehicle",
            "$50,000"
        };
        string[] winVehicles = new string[]
        {
            "adder", "autarch", "banshee2", "bullet", "cheetah", "emerus", "italigtb2"
        };
        int[] winMoneyAmounts = new int[]
        {
            -1, 2500, 20000, 10000, 2000, 5000, 30000, 15000, -1, 7500, 20000, -1, -1, 10000, 40000, 25000, -1, 15000, -1, 50000
        };

        public LuckyWheelSystem()
        {
            Main.resourceStart += () => ChatUtils.startupPrint("Loaded in Lucky Wheel System");
        }

        #region Global Methods
        public void startWheelWelcome(Player player, object callback)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if((character.money_amount - spinWheelCost) < 0)
            {
                uiHandling.sendPushNotifError(player, "You don't have money to spin the wheel.", 5000);
                return;
            }

            character.money_amount -= spinWheelCost;
            player.setPlayerCharacterData(character, false, true);

            int randomWin = new Random().Next(winListNames.Length);

            player.SetCustomData(_spinningWheelDataKey, randomWin);

            player.TriggerEvent("luckywheel.cometoluckywheel", randomWin);
        }
        #endregion

        #region Remote Events
        [RemoteEvent("luckywheel.cometoluckywheel")]
        public void handleArriveToWheel(Player player)
        {
            if (player.getPlayerCharacterData() == null || player.HasData(_spinningWheelDataKey)) return;

            uiHandling.sendPrompt(player, "fa-solid fa-money-bill", "Lucky Wheel", $"Are you sure you want to spin the lucky wheel? It will cost ${spinWheelCost.ToString("N0")}.", startWheelWelcome);
        }

        [RemoteEvent("luckywheel.spin")]
        public void handleWheelSpin(Player player)
        {
            if (!player.HasData(_spinningWheelDataKey)) return;

            NAPI.ClientEvent.TriggerClientEventInRange(player.Position, 50f, "luckywheel.spin", player.GetData<int>(_spinningWheelDataKey));
        }

        [RemoteEvent("luckywheel.finishspin")]
        public void handleFinishWheelSpin(Player player)
        {
            if (!player.HasData(_spinningWheelDataKey) || player.getPlayerCharacterData() == null) return;

            DbCharacter character = player.getPlayerCharacterData();

            character.money_amount -= spinWheelCost;

            int win = player.GetData<int>(_spinningWheelDataKey);

            player.ResetData(_spinningWheelDataKey);

            int winMoneyAmount = winMoneyAmounts[win];

            if (winMoneyAmount != -1)
            {
                player.SendChatMessage(ChatUtils.Success + $"You have succesfully won ${winMoneyAmount.ToString("N0")}.");
                character.money_amount += winMoneyAmount;
                player.setPlayerCharacterData(character, false, true);
                return;
            }

            switch((PossibleWins)win)
            {
                case PossibleWins.vehicle:
                    {
                        string winVeh = winVehicles[new Random().Next(winVehicles.Length)];

                        VehicleSystem.buildVehicle(winVeh, spawnVehicleAt, 20f, character.character_id, 111, 111, character.character_name);

                        player.SendChatMessage(ChatUtils.Success + $"You have won an {winVeh}! It has been spawned at the casino podium.");
                        break;
                    }
            }
        }
        #endregion
    }

    public enum PossibleWins
    {
        clothing,
        _2500Rp,
        _20000,
        _10000Chips,
        discount,
        _5000Rp,
        _30000,
        _15000Chips,
        clothing2,
        _7500Rp,
        _20000Chips,
        mystery,
        clothing3,
        _10000Rp,
        _40000,
        _25000Chips,
        clothing4,
        _15000Rp,
        vehicle,
        _50000
    }
}
