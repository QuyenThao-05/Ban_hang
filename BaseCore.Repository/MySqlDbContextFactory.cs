using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.Repository
{
    public class MySqlDbContextFactory : IDesignTimeDbContextFactory<MySqlDbContext>
    {
        public MySqlDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<MySqlDbContext>();

            optionsBuilder.UseSqlServer(
                "Server=localhost;Database=VPP;Trusted_Connection=True;TrustServerCertificate=True"
            );

            return new MySqlDbContext(optionsBuilder.Options);
        }
    }
}
