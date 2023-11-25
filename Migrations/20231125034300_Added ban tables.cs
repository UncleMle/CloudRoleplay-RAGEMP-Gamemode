using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedbantables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bans",
                columns: table => new
                {
                    ban_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    ip_address = table.Column<string>(nullable: false),
                    client_serial = table.Column<string>(nullable: false),
                    social_club_id = table.Column<string>(nullable: false),
                    social_club_name = table.Column<string>(nullable: false),
                    username = table.Column<string>(nullable: false),
                    account_id = table.Column<int>(nullable: false),
                    ban_reason = table.Column<string>(nullable: false),
                    admin = table.Column<string>(nullable: false),
                    lift_unix_time = table.Column<int>(nullable: false),
                    issue_unix_data = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bans", x => x.ban_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bans");
        }
    }
}
