import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import sharp from 'sharp'

interface ImageMap {
  [key: string]: string
}

const imageUrls: ImageMap = {
  'airpods.webp': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95&.v=1660803972361',
  'watch.webp': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT613ref_VW_34FR+watch-case-41-stainless-gold-s9_VW_34FR+watch-face-41-stainless-gold-s9_VW_34FR?wid=700&hei=700&trim=1%2C0&fmt=p-jpg&qlt=95&.v=1694507905569',
  'jeep.webp': 'https://www.jeep.com/content/dam/fca-brands/na/jeep/en_us/2024/wrangler/gallery/exterior/2024-Jeep-Wrangler-Gallery-Exterior-2.jpg.image.1440.jpg',
  'macbook.webp': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202301?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1671304673202',
  'ps5.webp': 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$',
  'drone.webp': 'https://dji-official-fe.djicdn.com/dps/6284e40517abe8d48c3d5b9f9cc2e42d.jpg',
  'iphone.webp': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
  'tv.webp': 'https://image-us.samsung.com/us/smartphones/galaxy-s23/v2/images/galaxy-s23-highlights-kv.jpg',
  'vacuum.webp': 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/417969-01.png?$responsive$&fmt=png-alpha&cropPathE=mobile&fit=stretch,1&wid=640',
  'ipad.webp': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-11-select-202210?wid=545&hei=550&fmt=jpeg&qlt=95&.v=1664411207154',
  'switch.webp': 'https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_400/ncom/en_US/switch/site-design-update/hardware/switch/nintendo-switch-oled-model-white-set/gallery/image01',
  'soundbar.webp': 'https://www.sonos.com/content/dam/sonos/images/arc/arc-black-wall-mounted.jpg'
}

const imagesDir = path.join(process.cwd(), 'public', 'images')
const placeholderSvgPath = path.join(imagesDir, 'placeholder.svg')
const placeholderWebpPath = path.join(imagesDir, 'placeholder.webp')

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

async function ensurePlaceholderWebp(): Promise<void> {
  if (!fs.existsSync(placeholderSvgPath)) {
    throw new Error('placeholder.svg not found in public/images directory')
  }

  // Convert SVG to webp if it doesn't exist or is older than the SVG
  if (!fs.existsSync(placeholderWebpPath) || 
      fs.statSync(placeholderSvgPath).mtime > fs.statSync(placeholderWebpPath).mtime) {
    await sharp(placeholderSvgPath)
      .resize(800, 600)
      .webp({ quality: 90 })
      .toFile(placeholderWebpPath)
  }
}

async function copyPlaceholder(targetPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(placeholderWebpPath)
    const writeStream = fs.createWriteStream(targetPath)

    readStream.on('error', reject)
    writeStream.on('error', reject)
    writeStream.on('finish', resolve)

    readStream.pipe(writeStream)
  })
}

function downloadImage(url: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename)
    const file = fs.createWriteStream(filepath)

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(filepath, async () => {
          try {
            await copyPlaceholder(filepath)
            console.log(`⚠️ Using placeholder for ${filename} (HTTP status ${response.statusCode})`)
            resolve()
          } catch (err) {
            reject(new Error(`Failed to copy placeholder for ${filename}: ${err}`))
          }
        })
        return
      }

      const contentType = response.headers['content-type']
      if (!contentType?.startsWith('image/')) {
        fs.unlink(filepath, async () => {
          try {
            await copyPlaceholder(filepath)
            console.log(`⚠️ Using placeholder for ${filename} (Invalid content type: ${contentType})`)
            resolve()
          } catch (err) {
            reject(new Error(`Failed to copy placeholder for ${filename}: ${err}`))
          }
        })
        return
      }

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        console.log(`✓ Downloaded: ${filename}`)
        resolve()
      })

      file.on('error', async (err) => {
        fs.unlink(filepath, async () => {
          try {
            await copyPlaceholder(filepath)
            console.log(`⚠️ Using placeholder for ${filename} (Write error: ${err.message})`)
            resolve()
          } catch (copyErr) {
            reject(new Error(`Failed to copy placeholder for ${filename}: ${copyErr}`))
          }
        })
      })
    }).on('error', async (err) => {
      fs.unlink(filepath, async () => {
        try {
          await copyPlaceholder(filepath)
          console.log(`⚠️ Using placeholder for ${filename} (Network error: ${err.message})`)
          resolve()
        } catch (copyErr) {
          reject(new Error(`Failed to copy placeholder for ${filename}: ${copyErr}`))
        }
      })
    })
  })
}

async function main() {
  console.log('🚀 Starting image downloads...\n')
  
  const total = Object.keys(imageUrls).length
  let completed = 0
  let failed = 0
  let usedPlaceholders = 0

  try {
    await ensurePlaceholderWebp()
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Failed to prepare placeholder image')
    process.exit(1)
  }

  for (const [filename, url] of Object.entries(imageUrls)) {
    try {
      await downloadImage(url, filename)
      if (fs.readFileSync(path.join(imagesDir, filename)).equals(fs.readFileSync(placeholderWebpPath))) {
        usedPlaceholders++
      }
      completed++
    } catch (error) {
      console.error(`❌ Failed to handle ${filename}:`, error instanceof Error ? error.message : 'Unknown error')
      failed++
    }
  }

  console.log(`\n📊 Download Summary:`)
  console.log(`✓ Successfully downloaded: ${completed - usedPlaceholders}/${total}`)
  if (usedPlaceholders > 0) {
    console.log(`⚠️ Placeholder images used: ${usedPlaceholders}`)
  }
  if (failed > 0) {
    console.log(`❌ Complete failures: ${failed}`)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
} 