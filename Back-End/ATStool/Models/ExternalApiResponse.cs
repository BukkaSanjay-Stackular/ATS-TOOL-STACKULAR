// Models/ExternalApiResponse.cs
using System.Text.Json.Serialization;

namespace ATStool.Models
{
    public class ExternalApiResponse
    {
        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("jd")]
        public string Jd { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

       
    }
}

//{

//    "status": "success",

//  "jd": "## Job Title\nSenior AI Engineer\n\n## Experience Level\n...",

//  "message": "JD generated successfully"

//}