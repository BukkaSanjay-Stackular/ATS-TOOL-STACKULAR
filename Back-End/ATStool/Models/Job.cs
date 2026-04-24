using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace ATStool.Models
{
    public class Jobs
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "Job must have a title")]
        [JsonPropertyName("job_title")]
        public string JobTitle { get; set; } = string.Empty;

        [Required(ErrorMessage = "Job must have a location")]
        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;

        [JsonPropertyName("employment_type")]
        public string? EmploymentType { get; set; }

        [JsonPropertyName("experience_level")]
        public string? ExperienceLevel { get;set; }

        [JsonPropertyName("work_mode")]
        public string? WorkMode { get; set; }

        [JsonPropertyName("work_hours")]
        public string? WorkHours { get; set; }

        [JsonPropertyName("duration")]
        public string? Duration { get; set; }

        [JsonPropertyName("role_description")]
        public string? RoleDescription { get; set; }

        [JsonPropertyName("assigned_to")]
        public string? AssignedTo { get; set; }

        [JsonPropertyName("stipend")]
        [Precision(18, 2)]
        public decimal Stipend { get; set; }

        [JsonPropertyName("salary")]
        [Precision(18, 2)]
        public decimal Salary { get; set; }

        [JsonPropertyName("fulltime_offer_salary")]
        [Precision(18, 2)]
        public decimal FullTimeOfferSalary { get; set; }

        [JsonPropertyName("experience_years")]
        public double ExperienceYears { get; set; }

        [JsonPropertyName("posted_date")]
        public DateTime PostedDate { get; set; }

        [JsonPropertyName("deadline")]
        public DateTime? DeadLine { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }
    }
}