Add-Type -AssemblyName "System.Data"

$serverName = "localhost"
$databaseName = "SmartPowerDB"

$connString = "Server=$serverName;Database=master;Integrated Security=True;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)

try {
    $conn.Open()
    Write-Host "Connected to SQL Server"

    $cmd = $conn.CreateCommand()

    $cmd.CommandText = "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '$databaseName') BEGIN CREATE DATABASE $databaseName END"
    $cmd.ExecuteNonQuery() | Out-Null
    Write-Host "Database $databaseName created"

    $conn.ChangeDatabase($databaseName)

    $createTable = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'devices')
BEGIN
CREATE TABLE devices (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) NOT NULL,
    room NVARCHAR(50) NOT NULL,
    power INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
)
END
"@
    $cmd.CommandText = $createTable
    $cmd.ExecuteNonQuery() | Out-Null
    Write-Host "Devices table created"

    $cmd.CommandText = "SELECT COUNT(*) FROM devices"
    $count = $cmd.ExecuteScalar()

    if ($count -eq 0) {
        $cmd.CommandText = @"
INSERT INTO devices (name, room, power) VALUES
('AC', 'LivingRoom', 180),
('TV', 'LivingRoom', 80),
('Light', 'LivingRoom', 60),
('Speaker', 'LivingRoom', 40),
('AC', 'MasterBedroom', 150),
('Light', 'MasterBedroom', 40),
('TV', 'MasterBedroom', 50),
('Light', 'SecondBedroom', 30),
('AC', 'SecondBedroom', 100),
('Fan', 'SecondBedroom', 20),
('WaterHeater', 'Bathroom', 120),
('Light', 'Bathroom', 25),
('VentFan', 'Bathroom', 15),
('Fridge', 'Kitchen', 200),
('Microwave', 'Kitchen', 80),
('RiceCooker', 'Kitchen', 50),
('Hood', 'Kitchen', 30)
"@
        $cmd.ExecuteNonQuery() | Out-Null
        Write-Host "Sample device data inserted"
    }

    $conn.Close()
    Write-Host "Database initialization complete!"
}
catch {
    Write-Host "Error: $_"
}