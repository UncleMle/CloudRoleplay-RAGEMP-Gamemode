using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedvehicledimensionsystem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "vehicle_dimension",
                table: "vehicles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "vehicle_garage_id",
                table: "vehicles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "vehicle_insurance_id",
                table: "vehicles",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vehicle_dimension",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "vehicle_garage_id",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "vehicle_insurance_id",
                table: "vehicles");
        }
    }
}
