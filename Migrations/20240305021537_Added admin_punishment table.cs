using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedadmin_punishmenttable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin_punishments",
                columns: table => new
                {
                    admin_punishment_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    owner_account_id = table.Column<int>(nullable: false),
                    punishment_type = table.Column<int>(nullable: false),
                    admin_name = table.Column<string>(nullable: true),
                    punishment_reason = table.Column<string>(nullable: true),
                    is_void = table.Column<bool>(nullable: false),
                    unix_expires = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin_punishments", x => x.admin_punishment_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_punishments");
        }
    }
}
