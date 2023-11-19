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
    [Migration("20231119134532_improvedaccountable")]
    partial class improvedaccountable
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("CloudRP.Authentication.Account", b =>
                {
                    b.Property<int>("account_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UpdatedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("admin_name")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("admin_status")
                        .HasColumnType("int");

                    b.Property<int>("auto_login")
                        .HasColumnType("int");

                    b.Property<int>("ban_status")
                        .HasColumnType("int");

                    b.Property<string>("client_serial")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("email_address")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("password")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("social_club_id")
                        .HasColumnType("int");

                    b.Property<string>("username")
                        .IsRequired()
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<int>("vip_status")
                        .HasColumnType("int");

                    b.HasKey("account_id");

                    b.ToTable("accounts");
                });
#pragma warning restore 612, 618
        }
    }
}
