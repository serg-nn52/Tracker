import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env') })

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://tracker-time.netlify.app',
    ],
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`Backend running on http://localhost:${port}`)
  console.log(`Frontend dev server at http://localhost:5173`)
}
bootstrap()
