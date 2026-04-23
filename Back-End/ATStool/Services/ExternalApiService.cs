using System.Text;
using ATStool.Services; // Fixed: "Serices" → "Services"

namespace ATStool.Services // Fixed: missing "namespace" keyword, "Serices" → "Services"
{
    public class ExternalApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config; // Fixed: "IConfiguaration" → "IConfiguration"

        public ExternalApiService(HttpClient httpClient, IConfiguration config) // Fixed: "IConfiguation" → "IConfiguration"
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> GetAsync(string url)
        {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<T> PostAsync<T>(string url, object body)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            return System.Text.Json.JsonSerializer.Deserialize<T>(responseString)!;
        }
    }
}