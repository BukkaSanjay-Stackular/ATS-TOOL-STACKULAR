using System.Text.Json.Serialization;

namespace ATStool.DTOs
{
    public class CreateDraftDto
    {
        [JsonPropertyName("experience_level")]
        public string? ExperienceLevel { get; set; }

        [JsonPropertyName("job_title")]
        public string? JobTitle { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

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
    }

    public class AssignDraftDto
    {
        [JsonPropertyName("assigned_to")]
        public List<string>? AssignedTo { get; set; }
    }

    public class RoleDescriptionDto
    {
        [JsonPropertyName("role_description")]
        public string? RoleDescription { get; set; }
    }

    public class DismissDraftDto
    {
        [JsonPropertyName("username")]
        public string? Username { get; set; }
    }

    public class FinalizeDraftDto
    {
        [JsonPropertyName("finalJD")]
        public string? FinalJD { get; set; }

        [JsonPropertyName("experience_level")]
        public string? ExperienceLevel { get; set; }

        [JsonPropertyName("job_title")]
        public string? JobTitle { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

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
    }
}
