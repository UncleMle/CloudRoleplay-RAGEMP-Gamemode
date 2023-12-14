﻿// <auto-generated />
using System;
using CloudRP.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CloudRP.Migrations
{
    [DbContext(typeof(DefaultDbContext))]
    [Migration("20231214132001_interiors")]
    partial class interiors
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("CloudRP.Admin.Ban", b =>
                {
                    b.Property<int>("ban_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("account_id")
                        .HasColumnType("int");

                    b.Property<string>("admin")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("ban_reason")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("client_serial")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("ip_address")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<long>("issue_unix_date")
                        .HasColumnType("bigint");

                    b.Property<long>("lift_unix_time")
                        .HasColumnType("bigint");

                    b.Property<ulong>("social_club_id")
                        .HasColumnType("bigint unsigned");

                    b.Property<string>("social_club_name")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("username")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.HasKey("ban_id");

                    b.ToTable("bans");
                });

            modelBuilder.Entity("CloudRP.AntiCheat.CharacterConnection", b =>
                {
                    b.Property<int>("join_log_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("character_id")
                        .HasColumnType("int");

                    b.Property<string>("character_name")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("connection_type")
                        .HasColumnType("int");

                    b.Property<int>("player_id")
                        .HasColumnType("int");

                    b.Property<long>("unix")
                        .HasColumnType("bigint");

                    b.HasKey("join_log_id");

                    b.ToTable("server_connections");
                });

            modelBuilder.Entity("CloudRP.Authentication.Account", b =>
                {
                    b.Property<int>("account_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("account_uuid")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<bool>("admin_esp")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("admin_name")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("admin_ped")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("admin_status")
                        .HasColumnType("int");

                    b.Property<int>("auto_login")
                        .HasColumnType("int");

                    b.Property<string>("auto_login_key")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("ban_status")
                        .HasColumnType("int");

                    b.Property<string>("client_serial")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("email_address")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("max_characters")
                        .HasColumnType("int");

                    b.Property<string>("password")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<ulong>("social_club_id")
                        .HasColumnType("bigint unsigned");

                    b.Property<string>("user_ip")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("username")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("vip_status")
                        .HasColumnType("int");

                    b.HasKey("account_id");

                    b.ToTable("accounts");
                });

            modelBuilder.Entity("CloudRP.Character.CharacterClothing", b =>
                {
                    b.Property<int>("clothing_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("access")
                        .HasColumnType("int");

                    b.Property<int>("access_texture")
                        .HasColumnType("int");

                    b.Property<int>("armor")
                        .HasColumnType("int");

                    b.Property<int>("armor_texture")
                        .HasColumnType("int");

                    b.Property<int>("bag_texture")
                        .HasColumnType("int");

                    b.Property<int>("bags")
                        .HasColumnType("int");

                    b.Property<int>("character_id")
                        .HasColumnType("int");

                    b.Property<int>("decals")
                        .HasColumnType("int");

                    b.Property<int>("decals_texture")
                        .HasColumnType("int");

                    b.Property<int>("leg")
                        .HasColumnType("int");

                    b.Property<int>("leg_texture")
                        .HasColumnType("int");

                    b.Property<int>("mask")
                        .HasColumnType("int");

                    b.Property<int>("mask_texture")
                        .HasColumnType("int");

                    b.Property<int>("shoes")
                        .HasColumnType("int");

                    b.Property<int>("shoes_texture")
                        .HasColumnType("int");

                    b.Property<int>("top")
                        .HasColumnType("int");

                    b.Property<int>("top_texture")
                        .HasColumnType("int");

                    b.Property<int>("torso")
                        .HasColumnType("int");

                    b.Property<int>("torso_texture")
                        .HasColumnType("int");

                    b.Property<int>("undershirt")
                        .HasColumnType("int");

                    b.Property<int>("undershirt_texture")
                        .HasColumnType("int");

                    b.HasKey("clothing_id");

                    b.ToTable("character_clothes");
                });

            modelBuilder.Entity("CloudRP.Character.CharacterModel", b =>
                {
                    b.Property<int>("character_model_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ageing")
                        .HasColumnType("int");

                    b.Property<int>("blemishes")
                        .HasColumnType("int");

                    b.Property<int>("blushStyle")
                        .HasColumnType("int");

                    b.Property<int>("browHeight")
                        .HasColumnType("int");

                    b.Property<int>("browWidth")
                        .HasColumnType("int");

                    b.Property<int>("cheekBoneHeight")
                        .HasColumnType("int");

                    b.Property<int>("cheekBoneWidth")
                        .HasColumnType("int");

                    b.Property<int>("cheeksWidth")
                        .HasColumnType("int");

                    b.Property<int>("chestHairStyle")
                        .HasColumnType("int");

                    b.Property<int>("chinLength")
                        .HasColumnType("int");

                    b.Property<int>("chinPosition")
                        .HasColumnType("int");

                    b.Property<int>("chinShape")
                        .HasColumnType("int");

                    b.Property<int>("chinWidth")
                        .HasColumnType("int");

                    b.Property<int>("complexion")
                        .HasColumnType("int");

                    b.Property<int>("eyeColour")
                        .HasColumnType("int");

                    b.Property<int>("eyebrowsColour")
                        .HasColumnType("int");

                    b.Property<int>("eyebrowsStyle")
                        .HasColumnType("int");

                    b.Property<int>("eyes")
                        .HasColumnType("int");

                    b.Property<int>("facialHairColour")
                        .HasColumnType("int");

                    b.Property<int>("facialHairStyle")
                        .HasColumnType("int");

                    b.Property<int>("firstHeadShape")
                        .HasColumnType("int");

                    b.Property<int>("firstSkinTone")
                        .HasColumnType("int");

                    b.Property<int>("hairColour")
                        .HasColumnType("int");

                    b.Property<int>("hairHighlights")
                        .HasColumnType("int");

                    b.Property<int>("hairStyle")
                        .HasColumnType("int");

                    b.Property<int>("headMix")
                        .HasColumnType("int");

                    b.Property<int>("jawHeight")
                        .HasColumnType("int");

                    b.Property<int>("jawWidth")
                        .HasColumnType("int");

                    b.Property<int>("lips")
                        .HasColumnType("int");

                    b.Property<int>("lipstick")
                        .HasColumnType("int");

                    b.Property<int>("makeup")
                        .HasColumnType("int");

                    b.Property<int>("molesFreckles")
                        .HasColumnType("int");

                    b.Property<int>("neckWidth")
                        .HasColumnType("int");

                    b.Property<int>("noseBridge")
                        .HasColumnType("int");

                    b.Property<int>("noseBridgeShift")
                        .HasColumnType("int");

                    b.Property<int>("noseHeight")
                        .HasColumnType("int");

                    b.Property<int>("noseLength")
                        .HasColumnType("int");

                    b.Property<int>("noseTip")
                        .HasColumnType("int");

                    b.Property<int>("noseWidth")
                        .HasColumnType("int");

                    b.Property<int>("owner_id")
                        .HasColumnType("int");

                    b.Property<int>("rotation")
                        .HasColumnType("int");

                    b.Property<int>("secondHeadShape")
                        .HasColumnType("int");

                    b.Property<int>("secondSkinTone")
                        .HasColumnType("int");

                    b.Property<bool>("sex")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("skinMix")
                        .HasColumnType("int");

                    b.Property<int>("sunDamage")
                        .HasColumnType("int");

                    b.HasKey("character_model_id");

                    b.ToTable("character_models");
                });

            modelBuilder.Entity("CloudRP.Character.DbCharacter", b =>
                {
                    b.Property<int>("character_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("character_health")
                        .HasColumnType("int");

                    b.Property<double>("character_hunger")
                        .HasColumnType("double");

                    b.Property<ulong>("character_isbanned")
                        .HasColumnType("bigint unsigned");

                    b.Property<string>("character_name")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<double>("character_water")
                        .HasColumnType("double");

                    b.Property<int>("injured_timer")
                        .HasColumnType("int");

                    b.Property<DateTime>("last_login")
                        .HasColumnType("datetime(6)");

                    b.Property<ulong>("money_amount")
                        .HasColumnType("bigint unsigned");

                    b.Property<int>("owner_id")
                        .HasColumnType("int");

                    b.Property<ulong>("play_time_seconds")
                        .HasColumnType("bigint unsigned");

                    b.Property<uint>("player_dimension")
                        .HasColumnType("int unsigned");

                    b.Property<ulong>("player_exp")
                        .HasColumnType("bigint unsigned");

                    b.Property<float>("position_x")
                        .HasColumnType("float");

                    b.Property<float>("position_y")
                        .HasColumnType("float");

                    b.Property<float>("position_z")
                        .HasColumnType("float");

                    b.HasKey("character_id");

                    b.ToTable("characters");
                });

            modelBuilder.Entity("CloudRP.Character.Tattoo", b =>
                {
                    b.Property<int>("tattoo_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("tattoo_collection")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("tattoo_lib")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("tattoo_owner_id")
                        .HasColumnType("int");

                    b.HasKey("tattoo_id");

                    b.ToTable("player_tattoos");
                });

            modelBuilder.Entity("CloudRP.GeneralCommands.Nickname", b =>
                {
                    b.Property<int>("nickname_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("nickname")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("owner_id")
                        .HasColumnType("int");

                    b.Property<int>("target_character_id")
                        .HasColumnType("int");

                    b.HasKey("nickname_id");

                    b.ToTable("nicknames");
                });

            modelBuilder.Entity("CloudRP.HousingSystem.House", b =>
                {
                    b.Property<int>("house_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<bool>("blip_visible")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("garage_size")
                        .HasColumnType("int");

                    b.Property<int>("house_interior_id")
                        .HasColumnType("int");

                    b.Property<string>("house_name")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("house_owner_id")
                        .HasColumnType("int");

                    b.Property<float>("house_position_x")
                        .HasColumnType("float");

                    b.Property<float>("house_position_y")
                        .HasColumnType("float");

                    b.Property<float>("house_position_z")
                        .HasColumnType("float");

                    b.Property<int>("house_price")
                        .HasColumnType("int");

                    b.HasKey("house_id");

                    b.ToTable("houses");
                });

            modelBuilder.Entity("CloudRP.VehicleModification.VehicleMods", b =>
                {
                    b.Property<int>("vehicle_mod_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("armor")
                        .HasColumnType("int");

                    b.Property<int>("back_wheels")
                        .HasColumnType("int");

                    b.Property<int>("boost")
                        .HasColumnType("int");

                    b.Property<int>("brakes")
                        .HasColumnType("int");

                    b.Property<int>("colour_1")
                        .HasColumnType("int");

                    b.Property<int>("colour_2")
                        .HasColumnType("int");

                    b.Property<int>("dial_design")
                        .HasColumnType("int");

                    b.Property<int>("engine")
                        .HasColumnType("int");

                    b.Property<int>("exhaust")
                        .HasColumnType("int");

                    b.Property<int>("fender")
                        .HasColumnType("int");

                    b.Property<int>("frame")
                        .HasColumnType("int");

                    b.Property<int>("front_bumper")
                        .HasColumnType("int");

                    b.Property<int>("front_wheels")
                        .HasColumnType("int");

                    b.Property<int>("grille")
                        .HasColumnType("int");

                    b.Property<int>("hood")
                        .HasColumnType("int");

                    b.Property<int>("horns")
                        .HasColumnType("int");

                    b.Property<int>("hydraulics")
                        .HasColumnType("int");

                    b.Property<int>("livery")
                        .HasColumnType("int");

                    b.Property<int>("ornaments")
                        .HasColumnType("int");

                    b.Property<int>("pearleascent")
                        .HasColumnType("int");

                    b.Property<int>("plaques")
                        .HasColumnType("int");

                    b.Property<int>("plate")
                        .HasColumnType("int");

                    b.Property<int>("plate_holders")
                        .HasColumnType("int");

                    b.Property<int>("rear_bumper")
                        .HasColumnType("int");

                    b.Property<int>("right_fender")
                        .HasColumnType("int");

                    b.Property<int>("roof")
                        .HasColumnType("int");

                    b.Property<int>("shift_lever")
                        .HasColumnType("int");

                    b.Property<int>("side_skirt")
                        .HasColumnType("int");

                    b.Property<int>("spoilers")
                        .HasColumnType("int");

                    b.Property<int>("steering_wheel")
                        .HasColumnType("int");

                    b.Property<int>("suspension")
                        .HasColumnType("int");

                    b.Property<int>("transmission")
                        .HasColumnType("int");

                    b.Property<int>("trim_design")
                        .HasColumnType("int");

                    b.Property<int>("turbo")
                        .HasColumnType("int");

                    b.Property<int>("vehicle_owner_id")
                        .HasColumnType("int");

                    b.Property<int>("wheel_colour")
                        .HasColumnType("int");

                    b.Property<int>("wheel_type")
                        .HasColumnType("int");

                    b.Property<int>("window_tint")
                        .HasColumnType("int");

                    b.Property<int>("xenon")
                        .HasColumnType("int");

                    b.HasKey("vehicle_mod_id");

                    b.ToTable("vehicle_mods");
                });

            modelBuilder.Entity("CloudRP.Vehicles.DbVehicle", b =>
                {
                    b.Property<int>("vehicle_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("numberplate")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("owner_id")
                        .HasColumnType("int");

                    b.Property<float>("position_x")
                        .HasColumnType("float");

                    b.Property<float>("position_y")
                        .HasColumnType("float");

                    b.Property<float>("position_z")
                        .HasColumnType("float");

                    b.Property<float>("rotation")
                        .HasColumnType("float");

                    b.Property<string>("vehicle_dimension")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<ulong>("vehicle_distance")
                        .HasColumnType("bigint unsigned");

                    b.Property<double>("vehicle_fuel")
                        .HasColumnType("double");

                    b.Property<int>("vehicle_garage_id")
                        .HasColumnType("int");

                    b.Property<int>("vehicle_insurance_id")
                        .HasColumnType("int");

                    b.Property<bool>("vehicle_locked")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("vehicle_name")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<uint>("vehicle_spawn_hash")
                        .HasColumnType("int unsigned");

                    b.Property<string>("vehicle_uuid")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.HasKey("vehicle_id");

                    b.ToTable("vehicles");
                });

            modelBuilder.Entity("CloudRP.Vehicles.VehicleKey", b =>
                {
                    b.Property<int>("vehicle_key_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("target_character_id")
                        .HasColumnType("int");

                    b.Property<int>("vehicle_id")
                        .HasColumnType("int");

                    b.Property<string>("vehicle_name")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.HasKey("vehicle_key_id");

                    b.ToTable("vehicle_keys");
                });
#pragma warning restore 612, 618
        }
    }
}
