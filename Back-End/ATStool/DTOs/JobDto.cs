using System.Text.Json.Serialization;

namespace ATStool.DTOs
{
    public class CreateJobDto
    {
        [JsonPropertyName("job_title")]
        public string? JobTitle { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("employment_type")]
        public string? EmploymentType { get; set; }

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
        public decimal Stipend { get; set; }

        [JsonPropertyName("salary")]
        public decimal Salary { get; set; }

        [JsonPropertyName("fulltime_offer_salary")]
        public decimal FullTimeOfferSalary { get; set; }

        [JsonPropertyName("experience_years")]
        public double ExperienceYears { get; set; }

        [JsonPropertyName("posted_date")]
        public DateTime PostedDate { get; set; }

        [JsonPropertyName("deadline")]
        public DateTime? DeadLine { get; set; }
    }

    public class UpdateJobDto : CreateJobDto
    {
        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }
    }
}