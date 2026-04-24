using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ATStool.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJobsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeadLine",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ExperienceYears",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Salary",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Stipend",
                table: "Jobs");

            migrationBuilder.RenameColumn(
                name: "FullTimeOfferSalary",
                table: "Jobs",
                newName: "FulltimeOfferSalary");

            migrationBuilder.RenameColumn(
                name: "PostedDate",
                table: "Jobs",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "EmploymentType",
                table: "Jobs",
                newName: "YearsOfExperience");

            migrationBuilder.AlterColumn<string>(
                name: "FulltimeOfferSalary",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "AssignedTo",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GeneratedId",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StipendSalary",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "GeneratedId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "StipendSalary",
                table: "Jobs");

            migrationBuilder.RenameColumn(
                name: "FulltimeOfferSalary",
                table: "Jobs",
                newName: "FullTimeOfferSalary");

            migrationBuilder.RenameColumn(
                name: "YearsOfExperience",
                table: "Jobs",
                newName: "EmploymentType");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Jobs",
                newName: "PostedDate");

            migrationBuilder.AlterColumn<decimal>(
                name: "FullTimeOfferSalary",
                table: "Jobs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AssignedTo",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeadLine",
                table: "Jobs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ExperienceYears",
                table: "Jobs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Jobs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "Salary",
                table: "Jobs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Stipend",
                table: "Jobs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }
    }
}
