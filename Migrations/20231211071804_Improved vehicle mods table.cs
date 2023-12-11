using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Improvedvehiclemodstable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "mod_index",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "mod_name",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "mod_type",
                table: "vehicle_mods");

            migrationBuilder.AddColumn<int>(
                name: "armor",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "back_wheels",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "boost",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "brakes",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "colour_1",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "colour_2",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "dial_design",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "engine",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "exhaust",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "fender",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "frame",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "front_bumper",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "front_wheels",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "grille",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "hood",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "horns",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "hydraulics",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "livery",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ornaments",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "plaques",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "plate",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "plate_holders",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "rear_bumper",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "right_fender",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "roof",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "shift_lever",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "side_skirt",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "spoilers",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "steering_wheel",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "suspension",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "transmission",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "trim_design",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "turbo",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "window_tint",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "xenon",
                table: "vehicle_mods",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "armor",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "back_wheels",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "boost",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "brakes",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "colour_1",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "colour_2",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "dial_design",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "engine",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "exhaust",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "fender",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "frame",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "front_bumper",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "front_wheels",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "grille",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "hood",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "horns",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "hydraulics",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "livery",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "ornaments",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "plaques",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "plate",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "plate_holders",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "rear_bumper",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "right_fender",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "roof",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "shift_lever",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "side_skirt",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "spoilers",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "steering_wheel",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "suspension",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "transmission",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "trim_design",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "turbo",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "window_tint",
                table: "vehicle_mods");

            migrationBuilder.DropColumn(
                name: "xenon",
                table: "vehicle_mods");

            migrationBuilder.AddColumn<int>(
                name: "mod_index",
                table: "vehicle_mods",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "mod_name",
                table: "vehicle_mods",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "mod_type",
                table: "vehicle_mods",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
