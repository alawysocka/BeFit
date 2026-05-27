using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Calendar.v3;
using Microsoft.AspNetCore.Mvc;
using BeFit.Models;

namespace BeFit.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CalendarController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly string _redirectUri = "https://localhost:7140/api/calendar/callback";

    public CalendarController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Inicjacja połączenia z Google
    [HttpGet("connect")]
    public async Task<IActionResult> Connect([FromQuery] string userId)
    {
        if (string.IsNullOrEmpty(userId))
            return BadRequest("Identyfikator użytkownika jest wymagany.");

        var clientSecrets = await GoogleClientSecrets.FromFileAsync("client_secret.json");

        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = clientSecrets.Secrets,
            Scopes = new[] { CalendarService.Scope.Calendar } 
        });


        var authorizationUrl = (GoogleAuthorizationCodeRequestUrl)flow.CreateAuthorizationCodeRequest(_redirectUri);

        authorizationUrl.State = userId;
        authorizationUrl.AccessType = "offline";
        authorizationUrl.Prompt = "consent";


        return Redirect(authorizationUrl.Build().ToString());
    }

    // Punkt zwrotny, do którego Google odsyła użytkownika
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
    {
        var userId = state;

        if (string.IsNullOrEmpty(code))
            return BadRequest("Brak kodu autoryzacyjnego Google.");

        var clientSecrets = await GoogleClientSecrets.FromFileAsync("client_secret.json");

        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = clientSecrets.Secrets
        });

        var tokenResponse = await flow.ExchangeCodeForTokenAsync(userId, code, _redirectUri, CancellationToken.None);


        var user = await _context.Users.FindAsync(userId);
        if (user != null && !string.IsNullOrEmpty(tokenResponse.RefreshToken))
        {
            user.GoogleRefreshToken = tokenResponse.RefreshToken;
            await _context.SaveChangesAsync();
        }

        return Redirect("/participant.html?calendar=success");
    }
}