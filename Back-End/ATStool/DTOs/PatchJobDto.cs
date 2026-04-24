using System.Text.Json.Serialization;

namespace ATStool.DTOs
{
    public class PatchJobDto
    {
        [JsonPropertyName("job_title")]
        public string? JobTitle { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("experience_level")]
        public string? ExperienceLevel { get; set; }

        [JsonPropertyName("work_mode")]
        public string? WorkMode { get; set; }

        [JsonPropertyName("work_hours")]
        public string? WorkHours { get; set; }

        [JsonPropertyName("duration")]
        public string? Duration { get; set; }

        [JsonPropertyName("stipend_salary")]
        public string? StipendSalary { get; set; }

        [JsonPropertyName("fulltime_offer_salary")]
        public string? FulltimeOfferSalary { get; set; }

        [JsonPropertyName("years_of_experience")]
        public string? YearsOfExperience { get; set; }

        [JsonPropertyName("role_description")]
        public string? RoleDescription { get; set; }

        [JsonPropertyName("assigned_to")]
        public List<string>? AssignedTo { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}