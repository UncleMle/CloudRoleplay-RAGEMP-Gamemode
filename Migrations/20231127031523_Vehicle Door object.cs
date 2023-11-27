using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class VehicleDoorobject : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vehicle_doors",
                table: "vehicles");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "vehicle_doors",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: true);
        }
    }
}
