using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Housepricegaragesizeblipvisiblecolumnsforhousingsystem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "blip_visible",
                table: "houses",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "garage_size",
                table: "houses",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "blip_visible",
                table: "houses");

            migrationBuilder.DropColumn(
                name: "garage_size",
                table: "houses");
        }
    }
}
