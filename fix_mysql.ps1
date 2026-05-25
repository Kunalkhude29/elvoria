Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue
Rename-Item "C:\xampp\mysql\data" "data_old" -ErrorAction SilentlyContinue
Copy-Item "C:\xampp\mysql\backup" "C:\xampp\mysql\data" -Recurse -Force
Copy-Item "C:\xampp\mysql\data_old\elvoria" "C:\xampp\mysql\data" -Recurse -Force
Copy-Item "C:\xampp\mysql\data_old\kunal_jewellery" "C:\xampp\mysql\data" -Recurse -Force
Copy-Item "C:\xampp\mysql\data_old\mysql" "C:\xampp\mysql\data" -Recurse -Force
Copy-Item "C:\xampp\mysql\data_old\phpmyadmin" "C:\xampp\mysql\data" -Recurse -Force
Copy-Item "C:\xampp\mysql\data_old\test" "C:\xampp\mysql\data" -Recurse -Force
Copy-Item "C:\xampp\mysql\data_old\ibdata1" "C:\xampp\mysql\data" -Force
