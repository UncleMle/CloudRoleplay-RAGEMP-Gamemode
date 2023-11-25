using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Furtherupdatedbandatatypesincolumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<ulong>(
                name: "social_club_id",
                table: "bans",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "social_club_id",
                table: "bans",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(ulong));
        }
    }
}
