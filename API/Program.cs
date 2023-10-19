using System.Text;
using API.Data;
using API.Extensions;
using API.Interfaces;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using API.Entities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline middleware.

app.UseMiddleware<ExceptionMiddleware>();

builder.Services.AddCors();

app.UseCors(builder => builder.AllowAnyHeader()
                            .AllowAnyMethod()
                            .WithOrigins("http://localhost:4200", 
                                        "https://localhost:4200"));

app.UseHttpsRedirection();


app.UseAuthentication(); // asks do you have a valid token middleware
app.UseAuthorization(); // asks, now you have a valide token what are your permissions middleware 

app.MapControllers();

using var scope = app.Services.CreateScope(); // Gives access to all services in app
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
    await context.Database.MigrateAsync(); //applies any pending migrations to the database and will create database if it doesn't exist
    await Seed.SeedUsers(userManager, roleManager);
}
catch (System.Exception ex)
{
    var logger = services.GetService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during migration");    
}



app.Run();