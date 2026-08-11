using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using FinanzasVineyard.Data;
using FinanzasVineyard.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

builder.Services.AddMvc().AddRazorPagesOptions(options =>
{
    options.Conventions.AddPageRoute("/Home/Index", "");
}
);

/*builder.Services.AddDbContext<FinanzasVineyardContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FinanzasVineyardContext")));*/

builder.Services.AddDbContext<FinanzasVineyardContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SQLEXContext")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
