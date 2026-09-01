Set WshShell = CreateObject("WScript.Shell")
    WshShell.Run "cmd /k cd /d D:\RFID_AYT_ASSY\service && python start_rfid.py", 1, False
