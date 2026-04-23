using System.Text.Json;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations.Schema;

namespace ATStool.Models
{
    public class Draft
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("experience_level")]
        public string ExperienceLevel { get; set; } = string.Empty;

        [JsonPropertyName("job_title")]
        public string JobTitle { get; set; } = string.Empty;

        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;

        [JsonPropertyName("work_mode")]
        public string WorkMode { get; set; } = string.Empty;

        [JsonPropertyName("work_hours")]
        public string WorkHours { get; set; } = string.Empty;

        [JsonPropertyName("duration")]
        public string Duration { get; set; } = string.Empty;

        [JsonPropertyName("stipend_salary")]
        public string StipendSalary { get; set; } = string.Empty;

        [JsonPropertyName("fulltime_offer_salary")]
        public string FulltimeOfferSalary { get; set; } = string.Empty;

        [JsonPropertyName("years_of_experience")]
        public string YearsOfExperience { get; set; } = string.Empty;

        [JsonPropertyName("role_description")]
        public string? RoleDescription { get; set; }

        // Backing column for assigned_to — stored as JSON array string in DB
        [JsonIgnore]
        public string? AssignedToJson { get; set; }

        [NotMapped]
        [JsonPropertyName("assigned_to")]
        public List<string>? AssignedTo
        {
            get => AssignedToJson == null
                ? null
                : JsonSerializer.Deserialize<List<string>>(AssignedToJson);
            set => AssignedToJson = value == null
                ? null
                : JsonSerializer.Serialize(value);
        }

        [JsonPropertyName("status")]
        public string Status { get; set; } = "draft";

        [JsonPropertyName("created_by")]
        public string CreatedBy { get; set; } = string.Empty;

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("generated_jd")]
        public string? GeneratedJd { get; set; }
    }
}
