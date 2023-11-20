using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Updatedspawncolumnname : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vehicle_spawn_name",
                table: "vehicles");

            migrationBuilder.AddColumn<string>(
                name: "vehicle_spawn_hash",
                table: "vehicles",
                nullable: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vehicle_spawn_hash",
                table: "vehicles");

            migrationBuilder.AddColumn<string>(
                name: "vehicle_spawn_name",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                defaultValue: "");
        }
    }
}
