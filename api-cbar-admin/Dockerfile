# Builds Cbar.AdminApi explicitly rather than consuming the pipeline's publish/
# artifact. The shared template picks the project to publish with
#   find . -name "*.csproj" | grep -l 'Microsoft.NET.Sdk(.Web|.Worker)?' | head -1
# which also matches the Cbar.Domain class library and, depending on directory
# order, would publish the library instead of the API — leaving no app to run.
# Naming the project here makes the image deterministic.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# TEMPORARY (2026-09-10) — remove once the CI runner is fixed.
# The Roslyn compiler runs as a separate CoreCLR process with Server GC enabled
# in its runtimeconfig, and Server GC partitions its heaps across the CPUs in
# the process affinity mask. On a runner whose cgroup hands the build container
# an empty mask, that mask reports zero CPUs and the compiler dies before it
# compiles anything:
#   GC: This process is affinitize to 0 CPUs
#   GC heap initialization failed with error 0x8013200A
#   Failed to create CoreCLR, HRESULT: 0x8013200A
# Workstation GC skips the affinity step, and a fixed processor count keeps the
# rest of the SDK from querying the mask at all. Set before the first dotnet
# invocation so restore is covered too. Build stage only — these do not reach
# the runtime image, which keeps Server GC.
ENV DOTNET_gcServer=0 \
    DOTNET_GCHeapCount=1 \
    DOTNET_PROCESSOR_COUNT=2

COPY CbarAdminApi.slnx ./
COPY src/Cbar.Domain/Cbar.Domain.csproj    src/Cbar.Domain/
COPY src/Cbar.AdminApi/Cbar.AdminApi.csproj src/Cbar.AdminApi/
RUN dotnet restore src/Cbar.AdminApi/Cbar.AdminApi.csproj

COPY src/ src/
# Cbar.AdminApi.csproj copies db/migrations/*.sql and db/seed.sql into the
# output, so they must be present before publish.
COPY db/ db/
# UseSharedCompilation=false and -m:1 drop the persistent compiler server and
# parallel project builds, so the whole publish stays in processes that inherit
# the GC settings above. Two projects, so the lost parallelism costs seconds.
RUN dotnet publish src/Cbar.AdminApi/Cbar.AdminApi.csproj \
        -c Release -o /app/publish /p:UseAppHost=false \
        /p:UseSharedCompilation=false -m:1

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# The publish output already contains db/migrations/*.sql and db/seed.sql —
# Cbar.AdminApi.csproj copies them next to the binary, and MigrationRunner reads
# them from there at startup.
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_RUNNING_IN_CONTAINER=true \
    TZ=Asia/Baku

EXPOSE 8080

# Run as the non-root user that ships with the aspnet image.
USER $APP_UID

ENTRYPOINT ["dotnet", "Cbar.AdminApi.dll"]
