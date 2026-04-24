using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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

        [JsonPropertyName("experience_level")]
        public string? ExperienceLevel { get; set; } // "intern" | "fresher" | "experienced"

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

        // ── Backend sets these automatically ──────────────────────
        [JsonPropertyName("status")]
        public string Status { get; set; } = "draft";

        [JsonPropertyName("created_by")]
        public string? CreatedBy { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("generated_id")]
        public string GeneratedId { get; set; } = string.Empty;

        [JsonPropertyName("assigned_to")]
        public List<string> AssignedTo { get; set; } = [];
    }
}