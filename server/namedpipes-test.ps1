Add-Type -AssemblyName "System.Data"

# 使用本地默认实例
$instance = "SQLEXPRESS"
$computer = $env:COMPUTERNAME

$connectionStrings = @(
    "Server=localhost;Database=master;Integrated Security=True;TrustServerCertificate=True;",
    "Server=.;Database=master;Integrated Security=True;TrustServerCertificate=True;",
    "Server=(local);Database=master;Integrated Security=True;TrustServerCertificate=True;"
)

foreach ($connString in $connectionStrings) {
    Write-Host "Trying: $connString"
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($connString)
        $conn.Open()
        Write-Host "Connected!"

        $cmd = $conn.CreateCommand()
        $dbName = "SmartPowerDB"

        Write-Host "Creating database..."
        $cmd.CommandText = "
            IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '$dbName')
            BEGIN
                CREATE DATABASE $dbName
            END"
        $cmd.ExecuteNonQuery() | Out-Null

        $conn.ChangeDatabase($dbName)

        Write-Host "Creating table..."
        $cmd.CommandText = "
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'devices')
            BEGIN
                CREATE TABLE devices (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    name NVARCHAR(50) NOT NULL,
                    room NVARCHAR(50) NOT NULL,
                    power INT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE()
                )
            END"
        $cmd.ExecuteNonQuery() | Out-Null

        Write-Host "Inserting sample data..."
        $cmd.CommandText = "
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
            ('Hood', 'Kitchen', 30)"
        $cmd.ExecuteNonQuery() | Out-Null

        $conn.Close()
        Write-Host "Database initialized!"
        exit
    }
    catch {
        Write-Host "Failed: $($_.Exception.Message)"
    }
}

Write-Host "All connection methods failed"