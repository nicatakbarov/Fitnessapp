import Anthropic from "npm:@anthropic-ai/sdk@0.27.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are a nutrition expert AI. Your ONLY job is to estimate the calorie and macronutrient content of food.

When given a food description OR a food image, respond with ONLY a valid JSON object — no extra text, no markdown, no explanation.

JSON format:
{
  "name": "Food name with quantity (e.g. Chicken Breast 150g)",
  "calories": 250,
  "protein": 30,
  "carbs": 0,
  "fat": 5
}

Rules:
- If input is in Azerbaijani, keep the name in Azerbaijani
- Estimate reasonable portion sizes if not specified (assume a standard serving)
- All numeric values must be integers (round to nearest whole number)
- If the image does not show food, return: {"name":"Tanınmadı","calories":0,"protein":0,"carbs":0,"fat":0}
- Never add any text outside the JSON object`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, image, mimeType = 'image/jpeg' } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = new Anthropic({ apiKey });

    // Build message content — image takes priority, else text
    let userContent: Anthropic.MessageParam['content'];

    if (image) {
      userContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            data: image,
          },
        },
        {
          type: 'text',
          text: 'Bu şəkildəki yeməyin kaloriya və makro məlumatlarını JSON formatında ver.',
        },
      ];
    } else if (text) {
      userContent = text;
    } else {
      return new Response(JSON.stringify({ error: "text or image required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const raw = response.content[0].text.trim();

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(jsonStr);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("calorie-scan error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
