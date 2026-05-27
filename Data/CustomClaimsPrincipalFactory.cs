using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using BeFit.Models; 

namespace BeFit.Data; 
// Klasa pośrednicząca, która uczy system, jak pakować dane ApplicationUser do tokena
public class CustomClaimsPrincipalFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>
{
    public CustomClaimsPrincipalFactory(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IOptions<IdentityOptions> optionsAccessor)
        : base(userManager, roleManager, optionsAccessor)
    {
    }

    // To jest kluczowa metoda, która generuje zestaw roszczeń (claims) dla użytkownika
    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        // 1. Pobieramy bazowy zestaw roszczeń (imię, nazwisko, e-mail itp., jeśli są zmapowane)
        var identity = await base.GenerateClaimsAsync(user);

        // 2. JAWNIE dodajemy roszczenie identyfikatora użytkownika (NameIdentifier).
        // To jest standardowy klucz, którego szuka frontend.
        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id));

        return identity;
    }
}