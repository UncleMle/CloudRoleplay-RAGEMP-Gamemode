using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class improvedaccountable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "accounts",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "password",
                table: "accounts",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "accounts",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "accounts",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "admin_name",
                table: "accounts",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "admin_status",
                table: "accounts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "auto_login",
                table: "accounts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ban_status",
                table: "accounts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "client_serial",
                table: "accounts",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "email_address",
                table: "accounts",
                nullable: false);

            migrationBuilder.AddColumn<int>(
                name: "social_club_id",
                table: "accounts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "vip_status",
                table: "accounts",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "admin_name",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "admin_status",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "auto_login",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "ban_status",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "client_serial",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "email_address",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "social_club_id",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "vip_status",
                table: "accounts");

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "accounts",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<string>(
                name: "password",
                table: "accounts",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: true,
                oldClrType: typeof(string));
        }
    }
}
