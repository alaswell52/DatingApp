using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

// DbContext is a combination of unit of work and Repository Patterns
public class DataContext : DbContext
{

    public DataContext(DbContextOptions options) : base(options)
    {

    }

    public DbSet<AppUser> Users { get; set; }

    

}