import Anthropic from "npm:@anthropic-ai/sdk@0.27.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history = [], program } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = new Anthropic({ apiKey });

    const programSummary = program ? buildProgramSummary(program) : null;

    const systemPrompt = `You are an AI fitness coach inside the FitStart app.
Help users with:
- Nutrition advice (pre/post workout, protein, hydration, meal timing)
- Workout tips and exercise technique
- Fitness motivation and habit building
- Program planning and progression

IMPORTANT: Always respond in the same language the user writes in.
If user writes in Azerbaijani → respond in Azerbaijani.
If user writes in English → respond in English.
Keep responses concise and practical (3-5 sentences max unless more detail is needed).

${programSummary
  ? `The user's current active workout program:\n${programSummary}\n\nIf the user asks to modify their program (replace/delete/add an exercise), include EXACTLY this XML tag at the end of your response:\n\n<modification>\n{\n  "type": "replace"|"delete"|"add",\n  "weekIndex": <0-based>,\n  "dayIndex": <0-based>,\n  "section": "warmup"|"main"|"cooldown",\n  "exerciseIndex": <0-based, for replace/delete>,\n  "oldName": "<current exercise name, for replace/delete>",\n  "exercise": { "name": "...", "sets": 3, "reps": "10-12", "rest": "60s" }\n}\n</modification>\n\nOnly add this tag when user explicitly requests a program change. Do not mention the tag in your text.`
  : `The user has no active custom program. You can still give fitness and nutrition advice.`}`;

    // Keep last 12 messages for context (to avoid token overflow)
    const trimmedHistory = history.slice(-12);
    const messages = [
      ...trimmedHistory,
      { role: "user", content: message }
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const raw = response.content[0].text;
    const modMatch = raw.match(/<modification>([\s\S]*?)<\/modification>/);
    const reply = raw.replace(/<modification>[\s\S]*?<\/modification>/g, "").trim();

    let modification = null;
    if (modMatch) {
      try {
        modification = JSON.parse(modMatch[1].trim());
      } catch (_) {
        // JSON parse failed — skip modification
      }
    }

    return new Response(JSON.stringify({ reply, modification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("ai-chat error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Builds a compact program summary for the AI system prompt.
 * Avoids sending full exercise details to keep prompt size reasonable.
 */
function buildProgramSummary(program: any): string {
  if (!program?.weeks) return "Program data unavailable.";

  const lines: string[] = [];
  program.weeks.forEach((week: any, wi: number) => {
    lines.push(`Week ${wi + 1}:`);
    (week.days || []).forEach((day: any, di: number) => {
      const warmup = (day.warmup?.exercises || []).map((e: any) => e.name || e.exercise).filter(Boolean);
      const main = (day.mainWorkout || []).map((e: any) => e.name || e.exercise).filter(Boolean);
      const cooldown = (day.cooldown?.exercises || []).map((e: any) => e.name || e.exercise).filter(Boolean);
      lines.push(`  Day ${di + 1}:`);
      if (warmup.length) lines.push(`    Warmup (${warmup.length}): ${warmup.join(', ')}`);
      if (main.length)   lines.push(`    Main (${main.length}): ${main.join(', ')}`);
      if (cooldown.length) lines.push(`    Cooldown (${cooldown.length}): ${cooldown.join(', ')}`);
    });
  });
  return lines.join('\n');
}
