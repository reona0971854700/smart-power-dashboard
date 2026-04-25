# 启用 SQL Server TCP/IP 协议
$serviceName = "MSSQL`$SQLEXPRESS"

try {
    # 使用 WMI 啟用 TCP/IP
    $wmi = Get-WmiObject -Namespace "root\Microsoft\SqlServer\ComputerManagement16" -Class ServerNetworkProtocol -ErrorAction SilentlyContinue

    # 嘗試通過註冊表啟用
    $tcpKey = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp"
    if (Test-Path $tcpKey) {
        Set-ItemProperty -Path $tcpKey -Name Enabled -Value 1
        Write-Host "TCP/IP enabled via registry"
    }
    else {
        Write-Host "Creating TCP/IP registry key"
        New-Item -Path $tcpKey -Force | Out-Null
        Set-ItemProperty -Path $tcpKey -Name Enabled -Value 1 -Force
        Set-ItemProperty -Path $tcpKey -Name TcpPort -Value 1433 -Force
        Set-ItemProperty -Path $tcpKey -Name TcpDynamicPorts -Value "" -Force
    }

    Write-Host "Restarting SQL Server service..."
    Restart-Service -Name $serviceName -Force

    Write-Host "Done! TCP/IP should now be enabled."
    Write-Host "Please restart your computer or SQL Server for changes to take effect."
}
catch {
    Write-Host "Error: $_"
}