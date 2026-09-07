$Key = "C:\Users\krish\Downloads\sih-key.pem"
$Server = "ubuntu@3.82.17.79"
$ProjectDir = "C:\Users\krish\Desktop\SIH project"

Write-Host "Installing nodemailer on EC2..."
ssh -o StrictHostKeyChecking=no -i $Key $Server "cd ~/server && npm install nodemailer"

Write-Host "Copying backend files to EC2..."
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\services\notificationService.js" "$Server`:~/server/src/services/notificationService.js"
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\services\aiService.js" "$Server`:~/server/src/services/aiService.js"
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\services\documentService.js" "$Server`:~/server/src/services/documentService.js"
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\services\caseService.js" "$Server`:~/server/src/services/caseService.js"
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\routes\cases.js" "$Server`:~/server/src/routes/cases.js"
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\routes\documents.js" "$Server`:~/server/src/routes/documents.js"
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\routes\dev.js" "$Server`:~/server/src/routes/dev.js"
scp -o StrictHostKeyChecking=no -i $Key "$ProjectDir\server\src\db\schema.sql" "$Server`:~/server/src/db/schema.sql"

Write-Host "Restarting backend server..."
ssh -o StrictHostKeyChecking=no -i $Key $Server "pm2 restart sih-backend"

Write-Host "Running DB Migration..."
try {
  Invoke-WebRequest -Uri "https://nyayvault.in/api/dev/migrate" -Method GET | Select-Object -ExpandProperty Content
} catch {
  Invoke-WebRequest -Uri "https://sih-project-pied-pi.vercel.app/api/dev/migrate" -Method GET | Select-Object -ExpandProperty Content
}

Write-Host "Deployment Complete!"
