using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class VipUnixexpires : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vip_unix_set",
                table: "accounts");

            migrationBuilder.AddColumn<long>(
                name: "vip_unix_expires",
                table: "accounts",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vip_unix_expires",
                table: "accounts");

            migrationBuilder.AddColumn<long>(
                name: "vip_unix_set",
                table: "accounts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }
    }
}
