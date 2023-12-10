using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Fixedsomenotmappedcolumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "character_name",
                table: "characters",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "characterClothingclothing_id",
                table: "characters",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "characterModelcharacter_model_id",
                table: "characters",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_characters_characterClothingclothing_id",
                table: "characters",
                column: "characterClothingclothing_id");

            migrationBuilder.CreateIndex(
                name: "IX_characters_characterModelcharacter_model_id",
                table: "characters",
                column: "characterModelcharacter_model_id");

            migrationBuilder.AddForeignKey(
                name: "FK_characters_character_clothes_characterClothingclothing_id",
                table: "characters",
                column: "characterClothingclothing_id",
                principalTable: "character_clothes",
                principalColumn: "clothing_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_characters_character_models_characterModelcharacter_model_id",
                table: "characters",
                column: "characterModelcharacter_model_id",
                principalTable: "character_models",
                principalColumn: "character_model_id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_characters_character_clothes_characterClothingclothing_id",
                table: "characters");

            migrationBuilder.DropForeignKey(
                name: "FK_characters_character_models_characterModelcharacter_model_id",
                table: "characters");

            migrationBuilder.DropIndex(
                name: "IX_characters_characterClothingclothing_id",
                table: "characters");

            migrationBuilder.DropIndex(
                name: "IX_characters_characterModelcharacter_model_id",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "characterClothingclothing_id",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "characterModelcharacter_model_id",
                table: "characters");

            migrationBuilder.AlterColumn<string>(
                name: "character_name",
                table: "characters",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}
