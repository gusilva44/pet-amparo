import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EXTENSOES_PERMITIDAS = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/webp", ".webp"],
]);

export function validarImagemDataUrl(imagem, limiteBytes, campo) {
  if (imagem === null || imagem === undefined || imagem === "") return null;
  if (typeof imagem !== "string") throw new Error(`A ${campo} é inválida.`);
  const encontrada = imagem.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/]+={0,2})$/i);
  if (!encontrada || encontrada[2].length % 4 !== 0) throw new Error(`A ${campo} deve ser PNG, JPG ou WEBP.`);
  const bytes = Buffer.from(encontrada[2], "base64");
  if (bytes.length > limiteBytes) throw new Error(`A ${campo} deve ter no máximo ${Math.floor(limiteBytes / 1024 / 1024)} MB.`);
  const tipo = encontrada[1].toLowerCase();
  const imagemValida = tipo === 'png'
    ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : tipo === 'webp'
      ? bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
      : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!imagemValida) throw new Error(`O conteúdo da ${campo} não corresponde ao formato informado.`);
  const extensao = EXTENSOES_PERMITIDAS.get(`image/${encontrada[1].toLowerCase()}`)
    || (encontrada[1].toLowerCase().startsWith("jpeg") ? ".jpg" : null);
  return { dataUrl: imagem, bytes, extensao };
}

const diretorioBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const diretorioUploads = path.join(diretorioBackend, 'uploads')

export async function salvarImagemDataUrl(imagem, { limiteBytes, campo, pasta }) {
  const baseUrl = (process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3001}`).replace(/\/$/, '')
  if (typeof imagem === 'string' && imagem.startsWith(`${baseUrl}/uploads/${pasta}/`)) return imagem
  const arquivo = validarImagemDataUrl(imagem, limiteBytes, campo)
  if (!arquivo) return null

  const diretorio = path.join(diretorioUploads, pasta)
  await mkdir(diretorio, { recursive: true })
  const nome = `${randomUUID()}${arquivo.extensao}`
  await writeFile(path.join(diretorio, nome), arquivo.bytes, { flag: 'wx' })

  return `${baseUrl}/uploads/${pasta}/${nome}`
}
