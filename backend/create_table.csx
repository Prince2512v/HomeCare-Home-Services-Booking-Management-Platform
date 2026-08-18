using Microsoft.Data.Sqlite;

var conn = new SqliteConnection("Data Source=homecare.db");
conn.Open();

// Create UserAddresses table
var cmd = conn.CreateCommand();
cmd.CommandText = @"
CREATE TABLE IF NOT EXISTS ""UserAddresses"" (
    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_UserAddresses"" PRIMARY KEY AUTOINCREMENT,
    ""UserId"" INTEGER NOT NULL,
    ""HouseFlatNumber"" TEXT NOT NULL DEFAULT '',
    ""Landmark"" TEXT NOT NULL DEFAULT '',
    ""FullAddress"" TEXT NOT NULL DEFAULT '',
    ""SaveAs"" TEXT NOT NULL DEFAULT '',
    ""Latitude"" decimal(10,6) NOT NULL DEFAULT 0,
    ""Longitude"" decimal(10,6) NOT NULL DEFAULT 0,
    ""CreatedAt"" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ""FK_UserAddresses_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
)";
cmd.ExecuteNonQuery();

// Also mark migration as applied to avoid re-running it
var histCmd = conn.CreateCommand();
histCmd.CommandText = "CREATE TABLE IF NOT EXISTS \"__EFMigrationsHistory\" (\"MigrationId\" TEXT NOT NULL CONSTRAINT \"PK___EFMigrationsHistory\" PRIMARY KEY, \"ProductVersion\" TEXT NOT NULL)";
histCmd.ExecuteNonQuery();

// Insert migration record to prevent re-run
var insCmd = conn.CreateCommand();
insCmd.CommandText = "INSERT OR IGNORE INTO \"__EFMigrationsHistory\" VALUES ('20260702065535_AddUserAddresses', '9.0.0')";
insCmd.ExecuteNonQuery();

Console.WriteLine("UserAddresses table created successfully.");

// Verify
var checkCmd = conn.CreateCommand();
checkCmd.CommandText = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name";
using var reader = checkCmd.ExecuteReader();
Console.WriteLine("Tables:");
while (reader.Read())
    Console.WriteLine("  " + reader.GetString(0));

conn.Close();
