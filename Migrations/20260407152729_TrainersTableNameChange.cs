using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeFit.Migrations
{
    /// <inheritdoc />
    public partial class TrainersTableNameChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PreapprovedTrainers",
                table: "PreapprovedTrainers");

            migrationBuilder.RenameTable(
                name: "PreapprovedTrainers",
                newName: "Trainers");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Trainers",
                table: "Trainers",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Trainers",
                table: "Trainers");

            migrationBuilder.RenameTable(
                name: "Trainers",
                newName: "PreapprovedTrainers");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PreapprovedTrainers",
                table: "PreapprovedTrainers",
                column: "Id");
        }
    }
}
