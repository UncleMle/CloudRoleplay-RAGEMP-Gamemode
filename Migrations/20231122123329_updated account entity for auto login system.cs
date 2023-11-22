using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class updatedaccountentityforautologinsystem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "auto_login_key",
                table: "accounts",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "user_ip",
                table: "accounts",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "auto_login_key",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "user_ip",
                table: "accounts");
        }
    }
}
