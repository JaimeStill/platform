using System.Linq;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

using <%= classify(name) %>.Core.Extensions;
using <%= classify(name) %>.Core.Logging;
using <%= classify(name) %>.Data;
using <%= classify(name) %>.Office;

namespace <%= classify(name) %>.Web
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }
        public LogProvider Logger { get; }
        public OfficeConfig OfficeConfig { get; }

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;

            Logger = new LogProvider
            {
                LogDirectory = Configuration.GetValue<string>("LogDirectory")
                    ?? $@"{Environment.WebRootPath}\logs"
            };

            OfficeConfig = new OfficeConfig
            {
                Directory = Configuration.GetValue<string>("OfficeDirectory")
                    ?? $@"{Environment.WebRootPath}\office"
            };
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

            services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                    options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                });

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
                options.UseSqlServer(Configuration.GetConnectionString("Project"));
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "<%= classify(name) %>", version="v1" });
            });

            services.AddSingleton(OfficeConfig);

            services.AddSignalR();
        }

        public void Configure(IApplicationBuilder app)
        {
            if (Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "<%= classify(name) %> v1"));

            app.UseStaticFiles();

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Logger.LogDirectory),
                RequestPath = "/logs"
            });

            app.UseDirectoryBrowser(new DirectoryBrowserOptions
            {
                FileProvider = new PhysicalFileProvider(Logger.LogDirectory),
                RequestPath = "/logs"
            });

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(OfficeConfig.Directory),
                RequestPath = "/office"
            });

            app.UseExceptionHandler(err => err.HandleError(Logger));

            app.UseRouting();

            app.UseCors(builder =>
            {
                builder.WithOrigins(GetConfigArray("CorsOrigins"))
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .WithExposedHeaders("Content-Disposition");
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        string[] GetConfigArray(string section) => Configuration.GetSection(section)
            .GetChildren()
            .Select(x => x.Value)
            .ToArray();
    }
}
