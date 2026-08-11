using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanzasVineyard.Migrations
{
    public partial class modRegistroGastos2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistroGastos_Registros_RegistroId",
                table: "RegistroGastos");

            migrationBuilder.RenameColumn(
                name: "RegistroId",
                table: "RegistroGastos",
                newName: "EntradaId");

            migrationBuilder.RenameIndex(
                name: "IX_RegistroGastos_RegistroId",
                table: "RegistroGastos",
                newName: "IX_RegistroGastos_EntradaId");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistroGastos_Entradas_EntradaId",
                table: "RegistroGastos",
                column: "EntradaId",
                principalTable: "Entradas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistroGastos_Entradas_EntradaId",
                table: "RegistroGastos");

            migrationBuilder.RenameColumn(
                name: "EntradaId",
                table: "RegistroGastos",
                newName: "RegistroId");

            migrationBuilder.RenameIndex(
                name: "IX_RegistroGastos_EntradaId",
                table: "RegistroGastos",
                newName: "IX_RegistroGastos_RegistroId");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistroGastos_Registros_RegistroId",
                table: "RegistroGastos",
                column: "RegistroId",
                principalTable: "Registros",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
