Add-Type -AssemblyName "System.Data"

$serverName = "localhost"
$connectionStrings = @(
    "Server=$serverName;Database=master;Integrated Security=True;TrustServerCertificate=True;",
    "Server=localhost\\SQLEXPRESS;Database=master;Integrated Security=True;TrustServerCertificate=True;",
    "Server=.\\SQLEXPRESS;Database=master;Integrated Security=True;TrustServerCertificate=True;",
    "Server=np:$env:COMPUTERNAME\pipe\sql\query;Database=master;Integrated Security=True;"
)

foreach ($connString in $connectionStrings) {
    Write-Host "Trying: $connString"
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($connString)
        $conn.Open()
        Write-Host "SUCCESS! Connected"
        $conn.Close()
        break
    }
    catch {
        Write-Host "Failed: $($_.Exception.Message)"
    }
}