

using System.Security.Claims;

namespace API.Extensions
{
    public static class ClaimsPrincipleExtensions
    {
        public static string GetUsername(this ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.Name)?.Value;

        public static int GetUserId(this ClaimsPrincipal user)
        {
            Int32.TryParse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value, out int id);
            return id;
        }
                        
            
        
    }
}