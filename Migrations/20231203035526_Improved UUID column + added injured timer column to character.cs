using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class ImprovedUUIDcolumnaddedinjuredtimercolumntocharacter : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "vehicle_uuid",
                table: "vehicles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "injured_timer",
                table: "characters",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vehicle_uuid",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "injured_timer",
                table: "characters");
        }
    }
}
