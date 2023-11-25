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
    [Migration("20231125034300_Added ban tables")]
    partial class Addedbantables
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

                    b.Property<int>("issue_unix_data")
                        .HasColumnType("int");

                    b.Property<int>("lift_unix_time")
                        .HasColumnType("int");

                    b.Property<string>("social_club_id")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("social_club_name")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("username")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.HasKey("ban_id");

                    b.ToTable("bans");
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

                    b.Property<string>("password")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("social_club_id")
                        .HasColumnType("int");

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

                    b.Property<int>("character_isbanned")
                        .HasColumnType("int");

                    b.Property<string>("character_name")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<DateTime>("last_login")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("money_amount")
                        .HasColumnType("int");

                    b.Property<int>("owner_id")
                        .HasColumnType("int");

                    b.Property<int>("play_time_minutes")
                        .HasColumnType("int");

                    b.Property<uint>("player_dimension")
                        .HasColumnType("int unsigned");

                    b.Property<float>("position_x")
                        .HasColumnType("float");

                    b.Property<float>("position_y")
                        .HasColumnType("float");

                    b.Property<float>("position_z")
                        .HasColumnType("float");

                    b.HasKey("character_id");

                    b.ToTable("characters");
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
                        .IsRequired()
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

                    b.Property<string>("vehicle_name")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<uint>("vehicle_spawn_hash")
                        .HasColumnType("int unsigned");

                    b.HasKey("vehicle_id");

                    b.ToTable("vehicles");
                });
#pragma warning restore 612, 618
        }
    }
}
