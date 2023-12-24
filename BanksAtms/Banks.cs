using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.World;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.BanksAtms
{
    public class Banks : Script
    {
        public static string _tellerColshapeDataIdentifier = "bankTellerColshapeData";
        public static List<Bank> banks = new List<Bank>
        {
            new Bank
            {
                blipPos = new Vector3(278.9, 232.5, 170.9),
                tellers = new List<Vector3>
                {
                    new Vector3(242.0, 224.0, 106.3),
                    new Vector3(247.1, 222.0, 106.3),
                    new Vector3(252.2, 220.0, 106.3)
                }
            }
        };

        public Banks()
        {
            banks.ForEach(bank =>
            {
                NAPI.Blip.CreateBlip(374, bank.blipPos, 1.0f, 5, "Bank", 255, 1.0f, true, 0, 0);
                
                bank.tellers.ForEach(teller =>
                {
                    ColShape tellerCol = NAPI.ColShape.CreateSphereColShape(teller, 1.0f, 0);
                    tellerCol.SetData(_tellerColshapeDataIdentifier, bank);
                    MarkersAndLabels.setTextLabel(teller, "Use ~y~Y~w~ to interact with bank.", 5f);
                    MarkersAndLabels.setPlaceMarker(teller);
                });
            });
        }

        [RemoteEvent("server:openBank")]
        public void openBankEvent(Player player)
        {
            Bank bankData = player.GetData<Bank>(_tellerColshapeDataIdentifier);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if(bankData != null && characterData != null)
            {
                uiHandling.handleObjectUiMutation(player, MutationKeys.AtmData, new AtmUiData
                {
                    isBank = true,
                    balanceMoney = characterData.money_amount,
                    balanceCash = characterData.cash_amount,
                });

                uiHandling.pushRouterToClient(player, Browsers.Atm);
            }
        }

        [RemoteEvent("server:bankDepositCash")]
        public void bankDepositEvent(Player player, string amount)
        {
            Bank bankData = player.GetData<Bank>(_tellerColshapeDataIdentifier);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if(bankData != null && characterData != null)
            {
                if(amount == null || string.IsNullOrEmpty(amount))
                {
                    uiHandling.sendPushNotifError(player, "Enter a valid money amount", 6600, true);
                }
                try
                {
                    int cashDepo = int.Parse(amount);

                    if(cashDepo < 0 || cashDepo > 200000)
                    {
                        uiHandling.sendPushNotifError(player, "Cash amount must be greater than zero and less than $200,000", 5600, true);
                        return;
                    }

                    if((characterData.cash_amount - cashDepo) < 0)
                    {
                        uiHandling.sendPushNotifError(player, "You don't have enough cash to deposit this amount", 6600, true);
                        return;
                    }

                    characterData.cash_amount -= cashDepo;
                    characterData.money_amount += cashDepo;

                    PlayersData.setPlayerCharacterData(player, characterData, false, true);
                    CommandUtils.successSay(player, $"You deposited ${cashDepo} into your bank account.");
                    uiHandling.setLoadingState(player, false);
                    uiHandling.pushRouterToClient(player, Browsers.None);
                }
                catch
                {
                    uiHandling.sendPushNotifError(player, "Enter a valid money amount", 6600, true);
                }

            } else
            {
                uiHandling.sendPushNotifError(player, "You must be in a bank to use this.", 5500, true);
            }
        }

        [RemoteEvent("server:bankTransferSomeone")]
        public void bankTransferEvent(Player player, string data)
        {
            Console.WriteLine(data);
            Bank bankData = player.GetData<Bank>(_tellerColshapeDataIdentifier);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);
            BankTransfer bankTransfer = JsonConvert.DeserializeObject<BankTransfer>(data);

            if(bankData != null && characterData != null && bankTransfer != null)
            {
                try
                {
                    long transferAmount = long.Parse(bankTransfer.transferAmount);

                    if ((characterData.money_amount - transferAmount) < 0)
                    {
                        uiHandling.sendPushNotifError(player, "You don't have enough money to send that amount.", 6600, true);
                        return;
                    }


                    if (transferAmount < 0 || transferAmount > 200000)
                    {
                        uiHandling.sendPushNotifError(player, "Transfer amount must be between $0 and $200,000", 6600, true);
                        return;
                    }

                    bool found = false;

                    if (bankTransfer.recieverName != null)
                    {
                        NAPI.Pools.GetAllPlayers().ForEach(p =>
                        {
                            DbCharacter targetCharData = PlayersData.getPlayerCharacterData(p);

                            if (targetCharData != null && targetCharData.character_name == bankTransfer.recieverName.Replace(" ", "_"))
                            {
                                found = true;

                                if (targetCharData.character_id == characterData.character_id)
                                {
                                    uiHandling.sendPushNotifError(player, "You cannot bank transfer money to yourself.", 6600, true);
                                    return;
                                }

                                characterData.money_amount -= transferAmount;
                                targetCharData.money_amount += transferAmount;

                                PlayersData.setPlayerCharacterData(player, characterData, false, true);
                                PlayersData.setPlayerCharacterData(p, targetCharData, false, true);
                                p.SendChatMessage(ChatUtils.info + $"You have just been bank transferred {transferAmount.ToString("C")}.");
                                CommandUtils.successSay(player, $"You successfully bank transferred {targetCharData.character_name} {transferAmount.ToString("C")}");
                                uiHandling.setLoadingState(player, false);
                            }
                        });
                    }

                    if (!found)
                    {
                        uiHandling.sendPushNotifError(player, "Player wasn't found.", 6600, true);
                    }
                }
                catch
                {
                    uiHandling.sendPushNotifError(player, "Enter a valid transfer amount.", 6600, true);
                }
            }

        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void addBankData(ColShape colshape, Player player)
        {
            Bank bankData = colshape.GetData<Bank>(_tellerColshapeDataIdentifier);

            if (bankData != null)
            {
                player.SetData(_tellerColshapeDataIdentifier, bankData);
                player.SetSharedData(_tellerColshapeDataIdentifier, bankData);
            }
        }
        
        [ServerEvent(Event.PlayerExitColshape)]
        public void removeBankData(ColShape colshape, Player player)
        {
            if(colshape.GetData<Bank>(_tellerColshapeDataIdentifier) != null)
            {
                player.ResetData(_tellerColshapeDataIdentifier);
                player.ResetSharedData(_tellerColshapeDataIdentifier);
            }
        }
    }
}
