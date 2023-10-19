
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {

            if(await userManager.Users.AnyAsync()) return;

            var userData = await File.ReadAllTextAsync("Data/UserSeedData.json");
            var options = new JsonSerializerOptions();
            options.PropertyNameCaseInsensitive = true;
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData);

            var roles = new List<AppRole> 
            {
                new AppRole{Name = "Member"},
                new AppRole{Name = "Admin"},
                new AppRole{Name = "Moderator"}
            };

            foreach(var role in roles)
            {
                await roleManager.CreateAsync(role);
            } 

            foreach (var user in users)
            {                
                user.UserName = user.UserName.ToLower();
                await userManager.CreateAsync(user, "Pa$$w0rd");  // add to Entity Framework tracking que                
                await userManager.AddToRoleAsync(user, "Member");
            }

            var admin = new AppUser
            {
                UserName = "Admin"
            };

            var result = await userManager.CreateAsync(admin, "Pa$$w0rd");
            if(!result.Succeeded) Console.Write("!!!!!! " + result);
            await userManager.AddToRolesAsync(admin, new[] {"Admin", "Moderator"});

        }        
    }

}