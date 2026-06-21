/**
 * /api/placa
 *
 * POST /api/placa/ocr
 *   Body: { imageBase64: string }
 *   Envia a imagem para o Google Cloud Vision, extrai o texto,
 *   filtra o padrão de placa Mercosul ou antiga e retorna.
 *
 * GET /api/placa/:placa
 *   Consulta uma API veicular (ex: APIBrasil) e retorna
 *   marca, modelo, ano, cor.
 */

import { Router, Request, Response } from 'express';

export const placaRouter = Router();

// Regex que aceita padrão antigo (AAA-9999) e Mercosul (AAA9A99)
const REGEX_PLACA = /[A-Z]{3}[\s-]?[0-9][0-9A-Z][0-9]{2}/i;

// ─── OCR de placa ─────────────────────────────────────────────────────────────
placaRouter.post('/ocr', async (req: Request, res: Response) => {
  const { imageBase64 } = req.body as { imageBase64: string };

  if (!imageBase64) {
    return res.status(400).json({ erro: 'imageBase64 obrigatório' });
  }

  try {
    // Chama Google Cloud Vision Text Detection
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }),
      }
    );

    const visionData = await visionRes.json();
    const textoCompleto: string =
      visionData.responses?.[0]?.fullTextAnnotation?.text ?? '';

    // Extrai a placa do texto
    const match = textoCompleto.replace(/\n/g, ' ').match(REGEX_PLACA);
    const placa = match ? match[0].replace(/[\s-]/g, '').toUpperCase() : null;

    return res.json({ placa, textoCompleto });
  } catch (err) {
    console.error('[OCR] erro:', err);
    return res.status(500).json({ erro: 'Falha no reconhecimento de placa' });
  }
});

// ─── Consulta dados do veículo ────────────────────────────────────────────────
placaRouter.get('/:placa', async (req: Request, res: Response) => {
  const placa = req.params.placa.toUpperCase();

  if (!REGEX_PLACA.test(placa)) {
    return res.status(400).json({ erro: 'Formato de placa inválido' });
  }

  try {
    /**
     * Troque pela API veicular de sua preferência.
     * Opções: APIBrasil (apibrasil.com.br), Olho no Carro, PlacaFipe.
     * O padrão abaixo usa APIBrasil como exemplo.
     */
    const apiRes = await fetch(
      `https://gateway.apibrasil.io/api/v2/vehicles/dados/placa/${placa}`,
      {
        headers: {
          'DeviceToken': process.env.APIBRASIL_DEVICE_TOKEN ?? '',
          'Authorization': `Bearer ${process.env.APIBRASIL_TOKEN ?? ''}`,
        },
      }
    );

    if (!apiRes.ok) {
      return res
        .status(apiRes.status)
        .json({ erro: 'Placa não encontrada ou serviço indisponível' });
    }

    const dados = await apiRes.json();

    // Normaliza para o formato interno
    return res.json({
      placa,
      marca: dados.MARCA ?? dados.marca,
      modelo: dados.MODELO ?? dados.modelo,
      ano: Number(dados.ano ?? dados.ANO),
      cor: dados.cor ?? dados.COR,
      raw: dados, // mantém o payload completo para debugging
    });
  } catch (err) {
    console.error('[Placa] erro:', err);
    return res.status(500).json({ erro: 'Erro ao consultar dados da placa' });
  }
});
