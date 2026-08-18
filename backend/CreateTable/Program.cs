using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;

var dbPath = args.Length > 0 ? args[0] : "../homecare.db";
var conn = new SqliteConnection($"Data Source={dbPath}");
conn.Open();

// Drop UserAddresses if it exists to clean up
var cleanupCmd = conn.CreateCommand();
cleanupCmd.CommandText = "DROP TABLE IF EXISTS \"UserAddresses\"";
cleanupCmd.ExecuteNonQuery();

var cmd = conn.CreateCommand();
cmd.CommandText = @"
CREATE TABLE IF NOT EXISTS ""Addresses"" (
    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_Addresses"" PRIMARY KEY AUTOINCREMENT,
    ""UserId"" INTEGER NOT NULL,
    ""HouseFlatNumber"" TEXT NOT NULL DEFAULT '',
    ""Landmark"" TEXT NOT NULL DEFAULT '',
    ""FullAddress"" TEXT NOT NULL DEFAULT '',
    ""SaveAs"" TEXT NOT NULL DEFAULT '',
    ""Latitude"" REAL NOT NULL DEFAULT 0,
    ""Longitude"" REAL NOT NULL DEFAULT 0,
    ""CreatedAt"" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
)";
cmd.ExecuteNonQuery();
Console.WriteLine("Addresses table created.");

var check = conn.CreateCommand();
check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name";
using var r = check.ExecuteReader();
Console.Write("Tables: ");
var tables = new System.Collections.Generic.List<string>();
while (r.Read()) tables.Add(r.GetString(0));
Console.WriteLine(string.Join(", ", tables));
conn.Close();
