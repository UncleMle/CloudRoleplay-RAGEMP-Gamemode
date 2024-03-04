using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.Jobs;
using CloudRP.PlayerSystems.Jobs.BusDriver;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.PlayerSystems.PlayerDealerships;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.DMV
{
    public class DmvSystem : Script
    {
        private static readonly Vector3 dmvStartPoint = new Vector3(797.8, -2988.7, 6.0);
        public static readonly string _PlayerDmvDataKey = "server:dmvSystem:selectCourseKeyPlayer";
        public static readonly string _VehicleDmvDataKey = "server:dmvSystem:selectCourseKeyVehicle";

        public DmvSystem()
        {
            Main.playerDisconnect += removeDmvVehicle;

            VehicleSystem.vehicleDeath += (vehicle, vehicleData) =>
            {
                DmvLicenseVehicle dmvVehicle = vehicle.GetData<DmvLicenseVehicle>(_VehicleDmvDataKey);
                if (dmvVehicle == null) return;

                checkDmvVehicleDelete(vehicle);

                CharacterSystem.sendMessageViaCharacterId(dmvVehicle.characterOwnerId, ChatUtils.dmv + "Your vehicle has been returned to the DMV."); 
            };

            DmvLicenseCourses.availableCourses.ForEach(course =>
            {
                initCourseEnd(course.vehicleSpawn);
                initCourse(course);
            });

            NAPI.Blip.CreateBlip(351, dmvStartPoint, 1f, 71, "DMV", 255, 5f, true, 0, 0);

            RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
            {
                menuTitle = "Department of Motor Vehicles",
                raycastMenuItems = new List<string> { "Select a course" },
                raycastMenuPosition = dmvStartPoint,
                targetMethod = viewDmvMenu
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"A total of {DmvLicenseCourses.availableCourses.Count} DMV courses were loaded in.");
        }

        #region Global Methods
        private void initCourse(DmvLicenseCourse course)
        {
            course.stops.ForEach(stop =>
            {
                ColShape courseCol = NAPI.ColShape.CreateSphereColShape(stop, 2f, 0);

                courseCol.OnEntityEnterColShape += (col, player) => handlePlayerEnterDmvCol(col, player, stop);
            });
        }

        private void initCourseEnd(Vector3 courseEnd)
        {
            ColShape endCol = NAPI.ColShape.CreateSphereColShape(courseEnd, 2f, 0);

            endCol.OnEntityEnterColShape += (col, player) =>
            {
                if(col.Equals(endCol) && player.IsInVehicle)
                {
                    (DmvLicensePlayer dmvPlayer, DmvLicenseVehicle dmvVeh) = validDmvVehicle(player.Vehicle, player);
                    if (dmvPlayer == null || dmvVeh == null) return;

                    if (!dmvPlayer.courseFinished) return;

                    MarkersAndLabels.removeClientBlip(player);
                    Licenses license = dmvPlayer.course.license;

                    if (NAPI.Vehicle.GetVehicleEngineHealth(player.Vehicle) < 980)
                    {
                        player.SendChatMessage(ChatUtils.dmv + $"You have {ChatUtils.red}FAILED{ChatUtils.White} your DMV Course for license {license}. Your welcome to try again whenever.");
                    } else
                    {
                        player.addAlicense(license);
                        player.SendChatMessage(ChatUtils.dmv + $"You have {ChatUtils.moneyGreen}PASSED{ChatUtils.White} your DMV Course for license {license}.");
                    }

                    player.ResetData(_PlayerDmvDataKey);
                    player.Vehicle.Delete();
                }

            };
        }

        private void handlePlayerEnterDmvCol(ColShape col, Player player, Vector3 stop)
        {
            if (!player.IsInVehicle) return;

            DmvLicensePlayer playerDmv = player.GetData<DmvLicensePlayer>(_PlayerDmvDataKey);

            if(playerDmv == null) return;

            int selectIdx = playerDmv.course.stops.IndexOf(stop);

            if (playerDmv.courseLevel != selectIdx || playerDmv.courseFinished) return;

            if(playerDmv.courseLevel + 1 >= playerDmv.course.stops.Count)
            {
                playerDmv.courseFinished = true;
                Vector3 endStop = playerDmv.course.stops.Last();
                
                setNextDmvStop(player, endStop);

                player.SetCustomData(_PlayerDmvDataKey, playerDmv);

                player.SendChatMessage(ChatUtils.dmv + $"You have finished this course. Head back to the DMV to recieve your test results.");

                MarkersAndLabels.addBlipForClient(player, 1, "Finish DMV Course", playerDmv.course.vehicleSpawn, 2, 255, -1, true, true);
                return;
            }

            playerDmv.courseLevel++;

            Vector3 nextStop = playerDmv.course.stops[playerDmv.courseLevel];

            setNextDmvStop(player, nextStop);
            player.SetCustomData(_PlayerDmvDataKey, playerDmv);
        }

        private void viewDmvMenu(Player player, string rayOption)
        {
            if (!player.checkIsWithinCoord(dmvStartPoint, 2f)) return;

            uiHandling.resetMutationPusher(player, MutationKeys.DmvCourses);

            uiHandling.pushRouterToClient(player, Browsers.DmvCourseView, true);

            DmvLicenseCourses.availableCourses.ForEach(course =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.DmvCourses, course);
            });
        }

        private void createDmvVehicle(Player player, DmvLicenseCourse course)
        {
            DbCharacter character = player.getPlayerCharacterData();

            Vehicle dmvVeh = VehicleSystem.buildVolatileVehicle(player, course.vehicleName, course.vehicleSpawn, course.vehicleSpawnRot, "DMV" + character.character_id);
            if (dmvVeh == null) return;

            player.SetCustomData(_PlayerDmvDataKey, new DmvLicensePlayer
            {
                course = course,
                courseLevel = -1
            });
            
            dmvVeh.SetData(_VehicleDmvDataKey, new DmvLicenseVehicle
            {
                course = course,
                characterOwnerId = character.character_id
            });

            MarkersAndLabels.addBlipForClient(player, 225, "DMV Vehicle", course.vehicleSpawn, 1, 255, 20, true);
            player.SendChatMessage(ChatUtils.dmv + "Your DMV vehicle has been spawned in. Get in it to start the course.");
        }

        private void checkDmvVehicleDelete(Vehicle vehicle)
        {
            DmvLicenseVehicle vehicleDmv = vehicle.GetData<DmvLicenseVehicle>(_VehicleDmvDataKey);
            if (vehicleDmv == null) return;

            int findCharacter = vehicleDmv.characterOwnerId;

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                if(p.getPlayerCharacterData()?.character_id == findCharacter)
                {
                    vehicle.Delete();
                    p.ResetData(_PlayerDmvDataKey);
                    MarkersAndLabels.removeClientBlip(p);
                }
            });

        }

        private (DmvLicensePlayer, DmvLicenseVehicle) validDmvVehicle(Vehicle vehicle, Player player)
        {
            (DmvLicensePlayer pLicense, DmvLicenseVehicle vLicense) = (null, null);

            DmvLicensePlayer dmv = player.GetData<DmvLicensePlayer>(_PlayerDmvDataKey);
            DmvLicenseVehicle dmvVehicle = vehicle.GetData<DmvLicenseVehicle>(_VehicleDmvDataKey);

            if(dmv != null && dmvVehicle != null && dmvVehicle.characterOwnerId == player.getPlayerCharacterData()?.character_id)
            {
                pLicense = dmv;
                vLicense = dmvVehicle;
            }

            return (pLicense, vLicense);
        }

        private void setNextDmvStop(Player player, Vector3 stop)
        {
            MarkersAndLabels.addBlipForClient(player, 1, "Dmv Stop", stop, 4, 255, -1, true, true);
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:dmv:selectDmvCourse")]
        public void selectDmvCourse(Player player, int courseId)
        {
            if (!player.checkIsWithinCoord(dmvStartPoint, 2f)) return;

            DbCharacter character = player.getPlayerCharacterData();
            DmvLicenseCourse selectCourse = DmvLicenseCourses.availableCourses
                .Where(course => course.courseId == courseId)
                .FirstOrDefault();

            if(selectCourse == null || character == null) return;

            if (player.getFreelanceJobData() != null)
            {
                uiHandling.sendPushNotifError(player, "You must quit your freelance job before beginning this.", 5600);
                return;
            }
            
            if (player.GetData<DmvLicensePlayer>(_PlayerDmvDataKey) != null)
            {
                uiHandling.sendPushNotifError(player, "You already have a pending course.", 5600);
                return;
            }

            PlayerLicense license = player.getAllLicenses()?
                .Where(license => license.license.Equals(selectCourse.license))
                .FirstOrDefault();

            if (license != null)
            {
                uiHandling.sendPushNotifError(player, "You already have this license.", 5600);
                return;
            }

            if(!player.processPayment(selectCourse.coursePrice, "DMV - Course Payment"))
            {
                uiHandling.sendPushNotifError(player, "You don't have enough money to afford this course.", 5600);
                return;
            }
            
            createDmvVehicle(player, selectCourse);
            uiHandling.resetRouter(player);
        }
        #endregion

        #region Server Events 
        [ServerEvent(Event.PlayerEnterVehicle)]
        public void startDmvRoute(Player player, Vehicle vehicle, sbyte seatId)
        {
            (DmvLicensePlayer pLicense, DmvLicenseVehicle vLicense) = validDmvVehicle(vehicle, player);

            if(pLicense != null && vLicense != null && pLicense.courseLevel == -1)
            {
                pLicense.courseLevel = 0;

                Vector3 nextStop = pLicense.course.stops[pLicense.courseLevel];

                player.SetCustomData(_PlayerDmvDataKey, pLicense);
                player.SendChatMessage(ChatUtils.dmv + $"You have started the course for the license {pLicense.course.license}. Head over to the first blip on the gps. Ensure to remain within the vehicle at all times.");
                player.SendChatMessage(ChatUtils.dmv + "Ensure not to crash or damage your vehicle at all. Or you will fail your test.");

                setNextDmvStop(player, nextStop);
            }
        }

        [ServerEvent(Event.PlayerExitVehicle)]
        public void handleDmvVehicleDelete(Player player, Vehicle vehicle)
        {
            if(player.getPlayerCharacterData()?.character_id == vehicle.GetData<DmvLicenseVehicle>(_VehicleDmvDataKey)?.characterOwnerId)
            {
                NAPI.Task.Run(() =>
                {
                    if (vehicle.Exists)
                    {
                        checkDmvVehicleDelete(vehicle);
                    }
                }, 1500);
            }
        }

        public void removeDmvVehicle(Player player)
        {
            NAPI.Pools.GetAllVehicles().ForEach(veh =>
            {
                DmvLicenseVehicle dmvVeh = veh.GetData<DmvLicenseVehicle>(_VehicleDmvDataKey);
                DbCharacter character = player.getPlayerCharacterData();

                if (dmvVeh == null || character == null) return;

                if (dmvVeh.characterOwnerId == character.character_id)
                {
                    veh.Delete();
                }
            });
        }

        #endregion

    }
}
