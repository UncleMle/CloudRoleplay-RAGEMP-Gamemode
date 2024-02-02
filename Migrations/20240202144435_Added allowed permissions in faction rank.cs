using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedallowedpermissionsinfactionrank : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "faction_ranks",
                table: "characters");

            migrationBuilder.AddColumn<string>(
                name: "allowed_uniforms",
                table: "faction_ranks",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "allowed_vehicles",
                table: "faction_ranks",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "allowed_weapons",
                table: "faction_ranks",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "faction_rank",
                table: "characters",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "allowed_uniforms",
                table: "faction_ranks");

            migrationBuilder.DropColumn(
                name: "allowed_vehicles",
                table: "faction_ranks");

            migrationBuilder.DropColumn(
                name: "allowed_weapons",
                table: "faction_ranks");

            migrationBuilder.DropColumn(
                name: "faction_rank",
                table: "characters");

            migrationBuilder.AddColumn<string>(
                name: "faction_ranks",
                table: "characters",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: true);
        }
    }
}
