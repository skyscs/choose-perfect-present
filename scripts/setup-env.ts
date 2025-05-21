const fs = require('fs')
const path = require('path')
const { randomBytes } = require('crypto')

const envFilePath = path.join(process.cwd(), '.env')
const envLocalFilePath = path.join(process.cwd(), '.env.local')
const envExampleFilePath = path.join(process.cwd(), '.env.example')

// Generate a secure random password
function generateSecurePassword() {
  return randomBytes(16).toString('hex')
}

// Generate a secure secret key for JWT
function generateSecretKey() {
  return randomBytes(32).toString('hex')
}

// Generate a secret code for presents
function generateSecretCode() {
  // Generate a 6-character alphanumeric code
  return randomBytes(3).toString('hex').toUpperCase()
}

const defaultEnvVars = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/presents_db',
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: generateSecurePassword(),
  JWT_SECRET: generateSecretKey(),
  PRESENTS_SECRET_CODE: generateSecretCode(),
}

function createEnvFile(filePath: string, vars: Record<string, string>) {
  const content = Object.entries(vars)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n')

  fs.writeFileSync(filePath, content + '\n')
  console.log(`Created ${path.basename(filePath)}`)
}

// Create .env.example
createEnvFile(envExampleFilePath, {
  ...defaultEnvVars,
  DATABASE_URL: 'postgresql://user:password@localhost:5432/database_name',
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'your-secure-password',
  JWT_SECRET: 'your-jwt-secret-key',
  PRESENTS_SECRET_CODE: 'YOUR_SECRET_CODE',
})

// Create .env if it doesn't exist
if (!fs.existsSync(envFilePath)) {
  createEnvFile(envFilePath, defaultEnvVars)
  console.log('\nAdmin Credentials (save these somewhere safe):')
  console.log('Username:', defaultEnvVars.ADMIN_USERNAME)
  console.log('Password:', defaultEnvVars.ADMIN_PASSWORD)
  console.log('Presents Secret Code:', defaultEnvVars.PRESENTS_SECRET_CODE)
}

// Create .env.local if it doesn't exist
if (!fs.existsSync(envLocalFilePath)) {
  createEnvFile(envLocalFilePath, defaultEnvVars)
}

console.log('\nEnvironment files have been set up!')
console.log('Note: You may need to modify these files with your specific configuration.') 