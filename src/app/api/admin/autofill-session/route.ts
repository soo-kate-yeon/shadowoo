import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sentence } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { sentences } = await request.json();

    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return NextResponse.json(
        { error: "Sentences array is required" },
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Format sentences text
    const sentencesText = sentences.map((s: Sentence) => s.text).join(" ");

    const prompt = `
You are an English learning content creator specializing in conversational English. Analyze the following transcript excerpt and generate a title and description for a shadowing learning session.

**Title Requirements:**
1. MUST include BOTH elements:
   - The full video/source context (e.g., movie name, situation)
   - The specific conversation type or speaking style
2. Conversation types to identify:
   - 설득하는 말하기 (persuasive speaking)
   - 주장/의견 표현 (asserting opinions)
   - 캐주얼 토크/일상 대화 (casual conversation)
   - 토론/논쟁 (debate/argument)
   - 독백/생각 표현 (monologue/expressing thoughts)
   - 요청/부탁하기 (making requests)
   - 감정 표현 (expressing emotions)
3. Be concise but specific - users should understand what they'll learn from the title alone
4. In Korean language

**Title Examples:**
✅ Good: "악마는 프라다를 입는다: 직장 상사와의 갈등 대화로 배우는 직설적 표현법"
✅ Good: "TED Talk: 설득력 있게 의견 주장하는 프레젠테이션 말하기"
✅ Good: "Friends 시트콤: 친구들과의 캐주얼한 농담과 티키타카 대화"
❌ Bad: "악마는 프라다를 입는다 속 대화를 통해 배우는 일상 대화" (too generic, doesn't specify conversation type)

**Description Requirements:**
The description MUST be exactly 2-3 sentences in Korean (약 2-3줄):
1. First sentence: Briefly state what situation/context this conversation is about
2. Second sentence: Quote SPECIFIC expressions/phrases from the actual script with quotation marks
3. Third sentence (optional): Explain practical usage situations where learners can apply these expressions

**Description Requirements (CRITICAL):**
- MUST quote actual words/phrases from the transcript using quotation marks
- MUST analyze when/where these expressions can be used
- Focus on actionable learning outcomes
- Be concrete and specific, NOT abstract or generic

**Description Examples:**
✅ Good: "이 대화는 상사가 부하직원에게 불만을 표현하는 장면이에요. "That's all", "You have no style or sense of fashion" 같은 직설적인 비판 표현과 "I don't think I'm like that" 같은 방어적 응답 표현을 배울 수 있어요. 이런 표현들은 직장에서 피드백을 주고받을 때나 의견 차이를 표현할 때 활용할 수 있어요."

✅ Good: "발표자가 청중에게 새로운 관점을 제시하는 프레젠테이션이에요. "What if we could~", "Imagine a world where~" 같은 가정을 통한 설득 표현과 "The key is to~" 같은 핵심 강조 표현을 배울 수 있어요."

❌ Bad: "이 대화는 직장에서의 대화에 대한 내용이에요. 직장 관련 표현을 배울 수 있어요." (no specific quotes, too abstract)

**Tone:** Use friendly, conversational Korean ending with "~요" (존댓말 but casual)

Transcript excerpt:
"${sentencesText}"

Return ONLY a valid JSON object (no markdown formatting) with this structure:
{
  "title": "[영상/출처 맥락]: [구체적인 대화 타입]으로 배우는 [학습 포인트]",
  "description": "첫 문장: 상황 설명. 두 번째 문장: '실제 스크립트 표현' 인용과 문법/표현 패턴. 세 번째 문장(선택): 활용 상황 분석."
}

CRITICAL RULES:
1. Title MUST specify the conversation type (설득/주장/대화/토론/독백/요청/감정표현 etc.)
2. Description MUST quote actual expressions from the transcript with "quotation marks"
3. Description MUST explain practical usage situations
4. Be specific and concrete, never generic or abstract
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let autofillData: { title: string; description: string };
    try {
      // Clean up potentially wrapped markdown
      const cleanedText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      autofillData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse AI response:", responseText);
      throw new Error("AI response was not valid JSON");
    }

    // Validate response structure
    if (!autofillData.title || !autofillData.description) {
      throw new Error("Invalid response structure from AI");
    }

    return NextResponse.json(autofillData);
  } catch (error: any) {
    console.error("Session autofill API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to autofill session details" },
      { status: 500 },
    );
  }
}
