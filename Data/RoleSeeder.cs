using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using BeFit.Models;
using System;
using System.Threading.Tasks;

namespace BeFit.Data;

public static class RoleSeeder
{
    public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();


        var configuration = serviceProvider.GetRequiredService<IConfiguration>();

        string[] roleNames = { "Administrator", "Trener", "Uczestnik" };

        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        var adminEmail = configuration["AdminSettings:Email"];
        var adminPassword = configuration["AdminSettings:Password"];

        if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
        {
            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                ApplicationUser adminUser = new()
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = configuration["AdminSettings:FirstName"] ?? "Admin",
                    LastName = configuration["AdminSettings:LastName"] ?? "Systemu",
                    SecurityStamp = Guid.NewGuid().ToString()
                };

                await userManager.CreateAsync(adminUser, adminPassword);
                await userManager.AddToRoleAsync(adminUser, "Administrator");
            }
        }
    }
}
